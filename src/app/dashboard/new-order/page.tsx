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
    // A key is required for the map to work.
    // You can get one from https://console.cloud.google.com/google/maps-apis/
    return (
       <div className="mx-auto grid w-full max-w-6xl flex-1 auto-rows-max gap-4">
        <div className="flex items-center gap-4">
          <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
            Crear Nuevo Pedido
          </h1>
        </div>
        <Card className="glass-card">
          <CardHeader>
             <CardTitle>Error de Configuración</CardTitle>
            <CardDescription>
              La clave de API de Google Maps no está configurada. El mapa no funcionará.
            </CardDescription>
          </CardHeader>
           <CardContent>
             <p className="text-sm text-destructive">Por favor, añade tu NEXT_PUBLIC_GOOGLE_MAPS_API_KEY al archivo .env.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey!}>
       <div className="mx-auto grid w-full flex-1 auto-rows-max gap-4">
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
