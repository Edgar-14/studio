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

        if (!session.metadata) {
            functions.logger.error("Stripe webhook checkout.session.completed missing metadata", session);
            res.status(400).send("Webhook Error: Missing metadata in session.");
            return;
        }

        const userId = session.metadata.userId;
        const planId = session.metadata.planId;

        if (!userId || !planId) {
            functions.logger.error("Stripe webhook checkout.session.completed missing userId or planId in metadata", { metadata: session.metadata });
            res.status(400).send("Webhook Error: Missing userId or planId in metadata.");
            return;
        }

        let creditsToAdd = 0;

        try {
            const appSettingsDoc = await db.collection('system_config').doc('app_settings').get();
            if (appSettingsDoc.exists) {
                const appConfig = appSettingsDoc.data();
                // Ensure stripePlans exists and is an array before calling find
                const plan = appConfig?.stripePlans && Array.isArray(appConfig.stripePlans)
                             ? appConfig.stripePlans.find((p: any) => p.id === planId)
                             : undefined;

                if (plan && plan.credits) {
                    creditsToAdd = parseInt(String(plan.credits), 10);
                    if (plan.bonusCredits) {
                         creditsToAdd += parseInt(String(plan.bonusCredits), 10);
                    }
                } else {
                    functions.logger.error(`Plan with ID ${planId} not found or credits not defined in system_config/app_settings.`);
                }
            } else {
                functions.logger.error('system_config/app_settings document not found.');
            }
        } catch (dbError: any) {
            functions.logger.error(`Error fetching plan details from Firestore for planId ${planId}:`, dbError);
            // For critical payment processing, consider how to handle DB errors.
            // Options: retry, queue for later processing, or alert admin.
            // For now, creditsToAdd remains 0, and the issue is logged.
        }

        if (creditsToAdd > 0) {
            const businessRef = db.collection('businesses').doc(userId);
            const creditAuditRef = businessRef.collection('creditAudits').doc();

            try {
                await db.runTransaction(async (t) => {
                    // It's good practice to read the business doc within the transaction
                    // if you need to make decisions based on its current state,
                    // though here we are just incrementing.
                    t.update(businessRef, { credits: admin.firestore.FieldValue.increment(creditsToAdd) });
                    t.set(creditAuditRef, {
                        event: "stripe_payment_completed",
                        stripeSessionId: session.id,
                        planId: planId,
                        amountAdded: creditsToAdd,
                        reason: `Payment for plan ${planId} via Stripe.`, // More descriptive reason
                        timestamp: admin.firestore.FieldValue.serverTimestamp(),
                        // Storing amount paid and currency might also be useful for audit
                        // amountPaid: session.amount_total,
                        // currency: session.currency,
                    });
                });
                functions.logger.info(`Successfully added ${creditsToAdd} credits to business ${userId} for plan ${planId}. Audit ID: ${creditAuditRef.id}`);
            } catch (transactionError: any) {
                functions.logger.error(`Transaction failed for adding credits to ${userId} for plan ${planId}:`, transactionError);
                // Handle transaction error, perhaps by alerting or queuing for retry
                res.status(500).send("Internal server error during credit update."); // Let Stripe know something went wrong server-side
                return;
            }
        } else {
            functions.logger.warn(`No credits added for user ${userId} with plan ${planId}. Calculated credits to add was ${creditsToAdd}. This might be due to missing plan configuration or zero credits defined for the plan.`);
            // If creditsToAdd is 0 due to a configuration issue, it's important to investigate.
            // You might want to respond differently to Stripe if this is an unexpected scenario.
        }
    }
    res.json({received: true});
});
