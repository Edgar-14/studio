import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, AlertCircle } from "lucide-react"

const integrations = [
  {
    name: "Stripe",
    description: "Procesamiento de pagos y recargas de crédito.",
    status: "Conectado",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
  {
    name: "Shipday",
    description: "Seguimiento de entregas y actualizaciones de estado.",
    status: "Conectado",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
  {
    name: "Firebase Admin",
    description: "Autenticación de usuarios y base de datos.",
    status: "Conectado",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
  {
    name: "Google Maps API",
    description: "Validación de direcciones y mapas.",
    status: "Error",
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
  },
]

export default function DiagnosticsPage() {
  return (
    <div>
        <div className="mb-8">
            <h1 className="text-2xl font-bold font-headline">Diagnóstico de Integraciones</h1>
            <p className="text-muted-foreground">
                Verifica el estado de las integraciones de tus servicios.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {integrations.map((integration) => (
            <Card key={integration.name} className="transition-all hover:shadow-lg hover:-translate-y-1 glass-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-base font-medium">
                {integration.name}
                </CardTitle>
                {integration.icon}
            </CardHeader>
            <CardContent>
                <p className="text-sm text-muted-foreground">
                {integration.description}
                </p>
                <div className="text-lg font-bold mt-2">{integration.status}</div>
            </CardContent>
            </Card>
        ))}
        </div>
    </div>
  )
}
