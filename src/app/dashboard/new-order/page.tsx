import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { AddressAssistantForm } from "./AddressAssistantForm"

export default function NewOrderPage() {
  return (
    <div className="mx-auto grid w-full max-w-4xl flex-1 auto-rows-max gap-4">
      <div className="flex items-center gap-4">
        <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0 font-headline">
          Crear Nuevo Pedido
        </h1>
      </div>
      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Detalles del Pedido</CardTitle>
          <CardDescription>
            Completa los siguientes datos para crear un nuevo pedido de entrega.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddressAssistantForm />
        </CardContent>
      </Card>
    </div>
  )
}
