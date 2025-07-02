"use client"

import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { db } from "@/lib/firebase" // Import db
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore" // Import Firestore functions for adding documents

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  addressCompletion,
  type AddressCompletionOutput,
} from "@/ai/flows/address-completion"
import { Loader2, CheckCircle, Wand2, User, Phone, MapPin, StickyNote, Building, DollarSign, AlertTriangle, Info } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MapComponent } from "./Map"
import { Skeleton } from "@/components/ui/skeleton" // For loading state

// Define a type for Business Data
interface BusinessData {
  businessName: string;
  businessPhone: string;
  businessAddress: string;
  // Add other fields if they exist in Firestore, e.g., ownerFullName, email
}


const formSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  customerPhone: z.string().min(10, "El número de teléfono parece demasiado corto."),
  customerAddress: z.string().min(10, "La dirección parece demasiado corta."),
  amountToCollect: z.string().optional(),
  notes: z.string().optional(),
})

type LatLng = { lat: number; lng: number }

const BusinessDetailItem = ({ icon, label, value, isLoading }: { icon: React.ReactNode, label: string, value?: string, isLoading?: boolean }) => (
    <div className="flex items-start gap-3">
        <div className="text-primary pt-0.5">{icon}</div>
        <div>
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            {isLoading ? (
                <Skeleton className="h-5 w-40 mt-1" />
            ) : value ? (
                <p className="text-base text-foreground">{value}</p>
            ) : (
                <p className="text-sm text-muted-foreground italic">No disponible</p>
            )}
        </div>
    </div>
);


export function AddressAssistantForm() {
  const { toast } = useToast()
  const { user } = useAuth() // Get authenticated user
  const [businessData, setBusinessData] = useState<BusinessData | null>(null)
  const [isLoadingBusinessData, setIsLoadingBusinessData] = useState(true)
  const [businessDataError, setBusinessDataError] = useState<string | null>(null)
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false) // For order submission loading state

  const [addressInput, setAddressInput] = useState("")
  const [completion, setCompletion] = useState<AddressCompletionOutput | null>(null)
  const [aiPending, startAITransition] = useTransition() // Renamed from isPending
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 19.2433, lng: -103.7250 }) // Default to Colima, Mexico

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      amountToCollect: "",
      notes: "",
    },
  })

  const watchedAddress = form.watch("customerAddress")

  useEffect(() => {
    const handler = setTimeout(() => {
      setAddressInput(watchedAddress)
    }, 500)

    return () => clearTimeout(handler)
  }, [watchedAddress])

  // Effect to fetch business data when user is available
  useEffect(() => {
    const fetchBusinessData = async () => {
      if (user?.uid) {
        setIsLoadingBusinessData(true)
        setBusinessDataError(null)
        try {
          const businessDocRef = doc(db, "businesses", user.uid)
          const businessDocSnap = await getDoc(businessDocRef)
          if (businessDocSnap.exists()) {
            setBusinessData(businessDocSnap.data() as BusinessData)
            // Optionally, set pickup address or map center based on this data
            // if (businessDocSnap.data().addressCoordinates) {
            //   setMapCenter(businessDocSnap.data().addressCoordinates)
            // }
          } else {
            setBusinessDataError("No se encontraron datos del negocio. Por favor, completa tu perfil.")
            setBusinessData(null)
          }
        } catch (error) {
          console.error("Error fetching business data:", error)
          setBusinessDataError("Error al cargar los datos del negocio.")
          setBusinessData(null)
        } finally {
          setIsLoadingBusinessData(false)
        }
      } else {
        setIsLoadingBusinessData(false) // No user, so not loading
      }
    }
    fetchBusinessData()
  }, [user])


  useEffect(() => {
    if (addressInput && addressInput.length > 10) {
      startAITransition(async () => {
        const result = await addressCompletion({ address: addressInput })
        if (result?.validatedAddress) {
          setCompletion(result)
          if (result.latitude && result.longitude) {
            setMapCenter({ lat: result.latitude, lng: result.longitude })
          }
        } else {
          setCompletion(null)
        }
      })
    } else {
      setCompletion(null)
    }
  }, [addressInput])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user || !businessData) {
      toast({
        title: "Error de Precondición",
        description: "No se puede crear el pedido. Faltan datos del usuario o del negocio.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmittingOrder(true);
    try {
      const orderData = {
        businessUid: user.uid,
        businessInfo: businessData, // Snapshot of business data at time of order
        customerName: values.customerName,
        customerPhone: values.customerPhone,
        customerAddress: completion?.validatedAddress || values.customerAddress, // Prefer validated address
        deliveryCoordinates: mapCenter,
        amountToCollect: values.amountToCollect || null,
        notes: values.notes || null,
        status: "pending", // Initial status
        createdAt: serverTimestamp(), // Firestore server timestamp
        // You might want to add AI completion details if needed
        // addressCompletionConfidence: completion?.confidenceLevel,
      };

      await addDoc(collection(db, "orders"), orderData);

      toast({
        title: "¡Pedido Creado Exitosamente!",
        description: "El nuevo pedido ha sido guardado en la base de datos.",
        className: "bg-green-100 border-green-300 text-green-800",
      });
      form.reset();
      setCompletion(null); // Clear AI suggestion
      // Optionally reset mapCenter to default if desired
      // setMapCenter({ lat: 19.2433, lng: -103.7250 });
    } catch (error) {
      console.error("Error al crear el pedido:", error);
      toast({
        title: "Error al Crear Pedido",
        description: "Hubo un problema al guardar el pedido. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function applySuggestion() {
    if (completion?.validatedAddress) {
      form.setValue("customerAddress", completion.validatedAddress)
      setCompletion(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <div className="space-y-8">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                <Building className="text-primary" />
                Punto de Recogida
            </CardTitle>
             <CardDescription>
              Estos son los datos de tu negocio registrados para la recogida.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {businessDataError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                <AlertTriangle className="h-5 w-5" />
                <p>{businessDataError}</p>
              </div>
            )}
            {!businessDataError && !isLoadingBusinessData && !businessData && (
                 <div className="flex items-center gap-2 text-sm text-muted-foreground bg-secondary p-3 rounded-md">
                    <Info className="h-5 w-5" />
                    <p>No hay datos del negocio disponibles. Considera completar tu perfil.</p>
                </div>
            )}
              <BusinessDetailItem
                icon={<User className="w-5 h-5"/>}
                label="Nombre del Negocio"
                value={businessData?.businessName}
                isLoading={isLoadingBusinessData}
              />
              <BusinessDetailItem
                icon={<Phone className="w-5 h-5"/>}
                label="Teléfono de Recogida"
                value={businessData?.businessPhone}
                isLoading={isLoadingBusinessData}
              />
              <BusinessDetailItem
                icon={<MapPin className="w-5 h-5"/>}
                label="Dirección de Recogida"
                value={businessData?.businessAddress}
                isLoading={isLoadingBusinessData}
              />
          </CardContent>
        </Card>
        
        <Card className="glass-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                    <MapPin className="text-primary"/>
                    Punto de Entrega
                </CardTitle>
                <CardDescription>
                    Completa los datos para la entrega del pedido.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="customerName"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4" />Nombre del Cliente</FormLabel>
                            <FormControl>
                            <Input placeholder="Jane Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="customerPhone"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4"/>Teléfono del Cliente</FormLabel>
                            <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="customerAddress"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4"/>Dirección del Cliente</FormLabel>
                            <FormControl>
                            <Input
                                placeholder="Empieza a escribir una dirección para ver sugerencias..."
                                {...field}
                                disabled={!businessData || isSubmittingOrder}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    
                    {aiPending && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                        <span>La IA está validando la dirección...</span>
                        </div>
                    )}

                    {completion && (
                        <Card className="bg-primary/5 border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 font-semibold text-primary">
                                <Wand2 className="h-5 w-5" />
                                <span>Sugerencia de la IA</span>
                                </div>
                                <p className="mt-2 text-sm">{completion.validatedAddress}</p>
                                <p className="text-xs text-muted-foreground mt-1">
                                Confianza:{" "}
                                <span className="font-medium text-foreground">
                                    {Math.round(completion.confidenceLevel * 100)}%
                                </span>
                                </p>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={applySuggestion}
                                className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary"
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Aplicar
                            </Button>
                            </div>
                        </CardContent>
                        </Card>
                    )}

                    <FormField
                      control={form.control}
                      name="amountToCollect"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2 text-muted-foreground"><DollarSign className="w-4 h-4"/>Monto a Cobrar (Opcional)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="0.00" {...field} disabled={!businessData || isSubmittingOrder} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                        control={form.control}
                        name="notes"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel className="flex items-center gap-2 text-muted-foreground"><StickyNote className="w-4 h-4"/>Notas (Opcional)</FormLabel>
                            <FormControl>
                            <Textarea placeholder="Ej. Puerta azul, casa de dos pisos, dejar en recepción..." className="resize-none" rows={3} {...field} disabled={!businessData || isSubmittingOrder} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />

                    <Button
                        type="submit"
                        size="lg"
                        className="btn-gradient w-full sm:w-auto"
                        disabled={!businessData || isLoadingBusinessData || isSubmittingOrder || aiPending}
                    >
                        {(isLoadingBusinessData || isSubmittingOrder || aiPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" /> }
                        {isSubmittingOrder ? "Creando Pedido..." : (aiPending ? "Validando Dirección..." : "Crear Pedido")}
                    </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
      </div>
      <div className="w-full h-80 lg:h-full min-h-[500px] rounded-lg overflow-hidden glass-card p-2 sticky top-24">
         <MapComponent center={mapCenter} />
      </div>
    </div>
  )
}
