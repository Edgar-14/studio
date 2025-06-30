"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddressAssistantForm } from "./AddressAssistantForm"
import { APIProvider } from "@vis.gl/react-google-maps"

export default function NewOrderPage() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
  if (!apiKey) {
    console.error("Google Maps API key is missing.")
    // You could render an error message here
  }

  return (
    <APIProvider apiKey={apiKey!}>
       <div className="mx-auto grid w-full max-w-6xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            Crear Nuevo Pedido
          </h1>
        </div>
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
            <CardDescription>
              Completa los datos para crear un nuevo pedido. El asistente de IA te ayudará a validar la dirección.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AddressAssistantForm />
          </CardContent>
        </Card>
      </div>
    </APIProvider>
  )
}
