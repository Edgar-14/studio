"use client"

import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
import { Loader2, CheckCircle, Wand2, Building, Phone, MapPin } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MapComponent } from "../new-order/Map"

const formSchema = z.object({
  businessName: z.string().min(2, "El nombre del negocio es requerido."),
  businessPhone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
  businessAddress: z.string().min(10, "La dirección es requerida."),
})

type LatLng = { lat: number; lng: number }

export function SettingsForm() {
  const { toast } = useToast()
  const [addressInput, setAddressInput] = useState("")
  const [completion, setCompletion] = useState<AddressCompletionOutput | null>(null)
  const [isPending, startTransition] = useTransition()
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 19.2433, lng: -103.7250 }) // Default to Colima, Mexico

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "BeFast HQ",
      businessPhone: "(555) 987-6543",
      businessAddress: "123 Innovation Drive, Tech City, 12345",
    },
  })
  
  // Set initial map center based on default address
  useEffect(() => {
    startTransition(async () => {
      const result = await addressCompletion({ address: form.getValues("businessAddress") })
      if (result?.latitude && result.longitude) {
        setMapCenter({ lat: result.latitude, lng: result.longitude })
      }
    })
  }, [form]);


  const watchedAddress = form.watch("businessAddress")

  useEffect(() => {
    const handler = setTimeout(() => {
      setAddressInput(watchedAddress)
    }, 500)
    return () => clearTimeout(handler)
  }, [watchedAddress])

  useEffect(() => {
    if (addressInput && addressInput.length > 10) {
      startTransition(async () => {
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "¡Ajustes Guardados!",
      description: "La información de tu negocio ha sido actualizada.",
      className: "bg-green-100 border-green-300 text-green-800",
    })
    setCompletion(null)
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
            <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                <FormItem>
                    <FormLabel className="flex items-center gap-2"><Building className="w-4 h-4 text-muted-foreground"/>Nombre del Negocio</FormLabel>
                    <FormControl>
                    <Input placeholder="Mi Negocio Inc." {...field} />
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
                    <FormLabel className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground"/>Teléfono de Contacto</FormLabel>
                    <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
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
                    <FormLabel className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground"/>Dirección de Recogida</FormLabel>
                    <FormControl>
                    <Textarea
                        placeholder="Empieza a escribir la dirección de tu negocio..."
                        className="resize-none"
                        rows={4}
                        {...field}
                    />
                    </FormControl>
                    <FormMessage />
                </FormItem>
                )}
            />

            {isPending && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                <span>Validando dirección...</span>
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

            <Button type="submit" size="lg" className="btn-gradient">
                Guardar Cambios
            </Button>
        </form>
      </Form>
      <div className="w-full h-80 lg:h-full min-h-[500px] rounded-lg overflow-hidden glass-card p-2 sticky top-24">
         <MapComponent center={mapCenter} />
      </div>
    </div>
  )
}
