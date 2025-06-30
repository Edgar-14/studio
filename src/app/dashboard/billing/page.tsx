import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Zap } from "lucide-react"

const billingHistory = [
  {
    invoice: "INV001",
    date: "2023-11-20",
    description: "Recarga de Créditos (500)",
    amount: "$50.00",
  },
  {
    invoice: "INV002",
    date: "2023-10-15",
    description: "Recarga de Créditos (200)",
    amount: "$20.00",
  },
  {
    invoice: "INV003",
    date: "2023-09-01",
    description: "Plan Mensual",
    amount: "$99.00",
  },
]

const creditPackages = [
    { credits: 100, price: "$10", description: "Básico" },
    { credits: 500, price: "$45", description: "Estándar" },
    { credits: 1000, price: "$80", description: "Pro" }
]

export default function BillingPage() {
  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="sm:col-span-2 transition-all hover:shadow-lg hover:-translate-y-1 glass-card">
          <CardHeader className="pb-3">
            <CardTitle className="font-headline">Tus Créditos</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Administra tus créditos para crear nuevos pedidos.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="text-4xl font-bold">234</div>
            <div className="ml-2 flex-1 text-sm text-muted-foreground">/ 500 Créditos</div>
          </CardFooter>
          <CardContent>
             <Progress value={234/500 * 100} aria-label="Uso de crédito" />
          </CardContent>
        </Card>
        {creditPackages.map((pkg) => (
            <Card key={pkg.credits} className="transition-all hover:shadow-lg hover:-translate-y-1 glass-card">
                 <CardHeader className="pb-2">
                    <CardDescription>{pkg.description}</CardDescription>
                    <CardTitle className="text-4xl">{pkg.price}</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-xs text-muted-foreground">{pkg.credits} créditos de entrega</div>
                </CardContent>
                <CardFooter>
                    <Button className="w-full btn-gradient">
                        <Zap className="mr-2 h-4 w-4" />
                        Recargar
                    </Button>
                </CardFooter>
            </Card>
        ))}
      </div>
      <Card className="transition-all hover:shadow-lg glass-card">
        <CardHeader>
          <CardTitle className="font-headline">Historial de Facturación</CardTitle>
          <CardDescription>
            Consulta tus transacciones y facturas pasadas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Factura</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-right">Monto</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billingHistory.map((item) => (
                <TableRow key={item.invoice}>
                  <TableCell className="font-medium">{item.invoice}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>{item.description}</TableCell>
                  <TableCell className="text-right">{item.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
