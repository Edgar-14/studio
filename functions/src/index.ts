// functions/src/index.ts
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import axios from "axios";
import { z } from "zod";

admin.initializeApp();
const db = admin.firestore();
const auth = admin.auth();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;
const SHIPDAY_API_KEY = process.env.SHIPDAY_API_KEY;
const SHIPDAY_API_URL = "https://api.shipday.com";
const REGION = 'us-central1';

const RegisterBusinessSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  ownerName: z.string().min(2),
  businessName: z.string().min(2),
  contactPhone: z.string().regex(/^\d{10}$/),
  defaultPickupAddress: z.object({
    description: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }),
});

const CreateOrderPayloadSchema = z.object({
  customerName: z.string().min(1),
  customerPhone: z.string().regex(/^\d{10}$/),
  deliveryAddress: z.object({
    description: z.string().min(1),
    lat: z.number(),
    lng: z.number(),
  }),
  notes: z.string().optional(),
});

export const registerBusinessUser = functions.region(REGION).https.onCall(async (data) => {
  try {
    const { email, password, ownerName, businessName, contactPhone, defaultPickupAddress } = RegisterBusinessSchema.parse(data);

    const userRecord = await auth.createUser({ email, password, displayName: ownerName });
    await auth.setCustomUserClaims(userRecord.uid, { role: 'business' });

    await db.collection('businesses').doc(userRecord.uid).set({
      userId: userRecord.uid, email, ownerName, businessName, contactPhone, defaultPickupAddress,
      credits: 0, createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { success: true, userId: userRecord.uid };
  } catch (error: any) {
    if (error.code === 'auth/email-already-exists') {
        throw new functions.https.HttpsError('already-exists', 'El correo electrónico ya está en uso.');
    }
    throw new functions.https.HttpsError('internal', error.message);
  }
});

export const createOrder = functions.region(REGION).https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación.');
  }

  const businessId = context.auth.uid;
  const { orderPayload } = data;
  CreateOrderPayloadSchema.parse(orderPayload);

  const businessRef = db.collection("businesses").doc(businessId);
  const orderRef = db.collection("orders").doc();

  await db.runTransaction(async (t) => {
    const businessDoc = await t.get(businessRef);
    const businessData = businessDoc.data();

    if (!businessData || businessData.credits < 1) {
      throw new functions.https.HttpsError('failed-precondition', 'Créditos insuficientes.');
    }

    t.update(businessRef, { credits: admin.firestore.FieldValue.increment(-1) });
    t.set(orderRef, {
      ...orderPayload, businessUid: businessId, status: 'processing',
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  });

  try {
    const businessData = (await businessRef.get()).data()!;
    const shipdayPayload = {
      orderNumber: orderRef.id,
      customerName: orderPayload.customerName,
      customerAddress: orderPayload.deliveryAddress.description,
      customerPhoneNumber: orderPayload.customerPhone,
      restaurantName: businessData.businessName,
      restaurantAddress: businessData.defaultPickupAddress.description,
      restaurantPhoneNumber: businessData.contactPhone,
      pickupLatitude: businessData.defaultPickupAddress.lat,
      pickupLongitude: businessData.defaultPickupAddress.lng,
      deliveryLatitude: orderPayload.deliveryAddress.lat,
      deliveryLongitude: orderPayload.deliveryAddress.lng,
      notes: orderPayload.notes,
    };

    const response = await axios.post(`${SHIPDAY_API_URL}/orders`, shipdayPayload, {
        headers: { 'Authorization': `Bearer ${SHIPDAY_API_KEY}` }
    });

    await orderRef.update({ status: 'sent_to_shipday', shipdayOrderId: response.data.orderId });
  } catch (error) {
    await orderRef.update({ status: 'shipday_error' });
    throw new functions.https.HttpsError('internal', 'Error al enviar a Shipday.');
  }

  return { success: true, orderId: orderRef.id };
});

export const setAdminRole = functions.region(REGION).https.onCall(async (data, context) => {
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Solo un administrador puede asignar roles.');
  }
  const user = await auth.getUserByEmail(data.email);
  await auth.setCustomUserClaims(user.uid, { admin: true });
  return { message: `Éxito. ${data.email} ahora es administrador.` };
});

export const addCredits = functions.region(REGION).https.onCall(async (data, context) => {
  if (context.auth?.token.admin !== true) {
    throw new functions.https.HttpsError('permission-denied', 'Solo un administrador puede agregar créditos.');
  }

  const { businessId, amount, reason } = data;
  const businessRef = db.collection("businesses").doc(businessId);

  await db.runTransaction(async (t) => {
    t.update(businessRef, { credits: admin.firestore.FieldValue.increment(amount) });
    t.set(businessRef.collection('creditAudits').doc(), {
      adminUid: context.auth!.uid, amountAdded: amount, reason,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
  return { success: true };
});

export const processStripePayment = functions.region(REGION).https.onCall(async (data, context) => {
    if (!context.auth) throw new functions.https.HttpsError('unauthenticated', 'Se requiere autenticación.');
    const { planId, successUrl, cancelUrl } = data;
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{ price: planId, quantity: 1 }],
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: { userId: context.auth.uid, planId },
    });
    return { sessionId: session.id };
});

export const stripeWebhook = functions.region(REGION).https.onRequest(async (req, res) => {
    const sig = req.headers['stripe-signature']!;
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(req.rawBody, sig, stripeWebhookSecret);
    } catch (err: any) {
        res.status(400).send(`Webhook Error: ${err.message}`);
        return;
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.metadata!.userId;
        const planId = session.metadata!.planId;
        const creditsToAdd = 100; // Ejemplo: Deberías buscar los créditos del planId en tu DB

        const businessRef = db.collection('businesses').doc(userId);
        await businessRef.update({ credits: admin.firestore.FieldValue.increment(creditsToAdd) });
    }
    res.json({received: true});
});
