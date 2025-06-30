import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { CheckCircle2, AlertCircle, Server } from "lucide-react"

const integrations = [
  {
    name: "Stripe",
    description: "Payment processing and credit recharges.",
    status: "Connected",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
  {
    name: "Shipday",
    description: "Delivery tracking and status updates.",
    status: "Connected",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
  {
    name: "Firebase Admin",
    description: "User authentication and database.",
    status: "Connected",
    icon: <CheckCircle2 className="h-6 w-6 text-green-500" />,
  },
  {
    name: "Google Maps API",
    description: "Address validation and mapping.",
    status: "Error",
    icon: <AlertCircle className="h-6 w-6 text-destructive" />,
  },
]

export default function DiagnosticsPage() {
  return (
    <div>
        <div className="mb-8">
            <h1 className="text-2xl font-bold font-headline">Integration Diagnostics</h1>
            <p className="text-muted-foreground">
                Check the status of your service integrations.
            </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
        {integrations.map((integration) => (
            <Card key={integration.name} className="transition-all hover:shadow-lg hover:-translate-y-1">
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
