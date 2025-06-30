"use client"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { APIProvider } from "@vis.gl/react-google-maps"
import { SettingsForm } from "./SettingsForm"

export default function SettingsPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      return (
         <div className="mx-auto grid w-full max-w-6xl flex-1 auto-rows-max gap-4">
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
        <div className="grid gap-6">
            <Card className="glass-card">
                <CardHeader>
                <CardTitle>Ajustes del Negocio</CardTitle>
                <CardDescription>
                    Actualiza la información de tu negocio. Estos datos se usarán para las recogidas y la facturación.
                </CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm />
                </CardContent>
            </Card>
        </div>
    </APIProvider>
  )
}
