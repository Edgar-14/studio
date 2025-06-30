"use client"

import { useEffect, useState, useTransition } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
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
import { Loader2, CheckCircle, Wand2 } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { MapComponent } from "./Map"

const formSchema = z.object({
  customerName: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  customerPhone: z.string().min(10, "El número de teléfono parece demasiado corto."),
  customerAddress: z.string().min(10, "La dirección parece demasiado corta."),
  orderId: z.string().optional(),
  notes: z.string().optional(),
})

type LatLng = { lat: number; lng: number }

export function AddressAssistantForm() {
  const { toast } = useToast()
  const [addressInput, setAddressInput] = useState("")
  const [completion, setCompletion] = useState<AddressCompletionOutput | null>(null)
  const [isPending, startTransition] = useTransition()
  const [mapCenter, setMapCenter] = useState<LatLng>({ lat: 20.6736, lng: -103.344_1, }) // Default to a central location

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      customerAddress: "",
      orderId: "",
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
      title: "¡Pedido Creado!",
      description: "El nuevo pedido de entrega ha sido creado exitosamente.",
      className: "bg-green-100 border-green-300 text-green-800",
    })
    form.reset()
    setCompletion(null)
  }

  function applySuggestion() {
    if (completion?.validatedAddress) {
      form.setValue("customerAddress", completion.validatedAddress)
      setCompletion(null)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="customerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Cliente</FormLabel>
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
                  <FormLabel>Teléfono del Cliente</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="customerAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Dirección del Cliente</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Empieza a escribir una dirección para ver sugerencias..."
                    className="resize-none"
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

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="orderId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID de Pedido (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., #12345" {...field} />
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
                  <FormLabel>Notas (Opcional)</FormLabel>
                  <FormControl>
                    <Input placeholder="ej., dejar en la puerta principal" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit" size="lg" className="btn-gradient w-full sm:w-auto">
            Crear Pedido
          </Button>
        </form>
      </Form>
      <div className="w-full h-80 lg:h-full rounded-lg overflow-hidden glass-card p-2">
         <MapComponent center={mapCenter} />
      </div>
    </div>
  )
}
