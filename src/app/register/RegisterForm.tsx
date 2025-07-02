"use client"

import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { auth, db } from "@/lib/firebase" // Import Firebase auth and db
import { createUserWithEmailAndPassword } from "firebase/auth"
import { doc, setDoc } from "firebase/firestore"

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
import { Checkbox } from "@/components/ui/checkbox"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import {
  addressCompletion,
  type AddressCompletionOutput,
} from "@/ai/flows/address-completion"
import { useToast } from "@/hooks/use-toast"
import { MapComponent } from "@/app/dashboard/new-order/Map"
import { Loader2, CheckCircle, Wand2, User, Mail, Lock, Building, Phone, MapPin, AlertTriangle } from "lucide-react"

const formSchema = z.object({
  fullName: z.string().min(2, "El nombre completo es requerido."),
  email: z.string().email("Por favor ingresa un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  businessName: z.string().min(2, "El nombre del negocio es requerido."),
  businessPhone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
  businessAddress: z.string().min(10, "La dirección es requerida."),
  terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones.",
  }),
  privacy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar las políticas de privacidad.",
  }),
})

type LatLng = { lat: number; lng: number }

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [addressInput, setAddressInput] = useState("")
  const [completion, setCompletion] = useState<AddressCompletionOutput | null>(null)
  const [isFormSubmitting, setIsFormSubmitting] = useState(false) // For general form submission
  const [aiPending, startAITransition] = useTransition() // Specifically for AI address completion
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 19.2433, lng: -103.7250 }) // Default to Colima, Mexico

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        fullName: "",
        email: "",
        password: "",
        businessName: "",
        businessPhone: "",
        businessAddress: "",
        terms: false,
        privacy: false,
    },
  })

  const watchedAddress = form.watch("businessAddress")

  useEffect(() => {
    const handler = setTimeout(() => {
      setAddressInput(watchedAddress)
    }, 500)
    return () => clearTimeout(handler)
  }, [watchedAddress])

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
    setIsFormSubmitting(true)
    try {
      // 1. Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password)
      const user = userCredential.user

      // 2. Store business data in Firestore
      if (user) {
        const businessData = {
          uid: user.uid,
          ownerFullName: values.fullName,
          email: values.email,
          businessName: values.businessName,
          businessPhone: values.businessPhone,
          businessAddress: values.businessAddress, // Consider storing the validated address if preferred
          addressCoordinates: mapCenter, // Storing lat/lng
          createdAt: new Date().toISOString(),
        }
        await setDoc(doc(db, "businesses", user.uid), businessData)
      }

      toast({
        title: "¡Registro Exitoso!",
        description: "Tu cuenta ha sido creada y los datos de tu negocio guardados. Ahora puedes iniciar sesión.",
        className: "bg-green-100 border-green-300 text-green-800",
      })
      router.push("/login")
    } catch (error: any) {
      console.error("Error durante el registro:", error)
      let errorMessage = "Ocurrió un error durante el registro. Por favor, inténtalo de nuevo."
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Este correo electrónico ya está en uso. Por favor, utiliza otro."
      } else if (error.code === "auth/weak-password") {
        errorMessage = "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
      }
      toast({
        title: "Error de Registro",
        description: errorMessage,
        variant: "destructive",
        action: (
          <div className="flex items-center">
            <AlertTriangle className="mr-2 h-4 w-4" />
            <span>Reintentar</span>
          </div>
        ),
      })
    } finally {
      setIsFormSubmitting(false)
    }
  }

  function applySuggestion() {
    if (completion?.validatedAddress) {
      form.setValue("businessAddress", completion.validatedAddress)
      setCompletion(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Datos del Propietario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground"><User className="w-4 h-4" />Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="John Doe" {...field} disabled={isFormSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground"><Mail className="w-4 h-4" />Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} disabled={isFormSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground"><Lock className="w-4 h-4" />Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} disabled={isFormSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-transparent border-none shadow-none">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Datos del Negocio</CardTitle>
              <CardDescription>Esta será tu dirección de recogida por defecto.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground"><Building className="w-4 h-4"/>Nombre del Negocio</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Negocio Inc." {...field} disabled={isFormSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground"><Phone className="w-4 h-4"/>Teléfono de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} disabled={isFormSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2 text-muted-foreground"><MapPin className="w-4 h-4"/>Dirección de Recogida</FormLabel>
                    <FormControl>
                      <Textarea placeholder="123 Calle Principal, Ciudad..." className="resize-none" {...field} disabled={isFormSubmitting} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {aiPending && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  <span>Validando dirección con IA...</span>
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
                      <Button type="button" variant="outline" size="sm" onClick={applySuggestion} className="border-primary/50 text-primary hover:bg-primary/10 hover:text-primary" disabled={isFormSubmitting || !completion}>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Aplicar
                      </Button>
                      </div>
                  </CardContent>
                  </Card>
              )}
            </CardContent>
          </Card>
          
          <div className="space-y-3 pt-4">
            <FormField
                control={form.control}
                name="terms"
                render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                    <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isFormSubmitting} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                        Acepto los{" "}
                        <span className="underline text-primary/90 hover:text-primary cursor-pointer">
                        términos y condiciones
                        </span>
                    </FormLabel>
                    <FormMessage />
                    </div>
                </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="privacy"
                render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                    <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} disabled={isFormSubmitting} />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                    <FormLabel>
                        He leído y acepto la{" "}
                        <span className="underline text-primary/90 hover:text-primary cursor-pointer">
                        política de privacidad
                        </span>
                    </FormLabel>
                    <FormMessage />
                    </div>
                </FormItem>
                )}
            />
          </div>

          <Button type="submit" className="w-full btn-gradient mt-6" size="lg" disabled={isFormSubmitting}>
            {isFormSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Crear Cuenta"
            )}
          </Button>
        </form>
      </Form>
      <div className="w-full h-80 lg:h-full min-h-[500px] rounded-lg overflow-hidden glass-card p-2 sticky top-24">
        <MapComponent center={mapCenter} />
      </div>
    </div>
  )
}
