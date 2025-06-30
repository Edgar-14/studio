import { Badge } from "@/components/ui/badge"
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
import { Zap, Star } from "lucide-react"

const billingHistory = [
  {
    invoice: "INV001",
    date: "2023-11-20",
    description: "Recarga de Créditos (500)",
    amount: "$650.00 MXN",
  },
  {
    invoice: "INV002",
    date: "2023-10-15",
    description: "Recarga de Créditos (100)",
    amount: "$150.00 MXN",
  },
  {
    invoice: "INV003",
    date: "2023-09-01",
    description: "Plan Mensual",
    amount: "$990.00 MXN",
  },
]

const creditPackages = [
  { credits: 100, price: "$150 MXN", description: "Paquete Básico", bonus: true },
  { credits: 500, price: "$650 MXN", description: "Paquete Estándar", popular: true, bonus: true },
  { credits: 1000, price: "$1200 MXN", description: "Paquete Pro", bonus: true },
]

export default function BillingPage() {
  const availableCredits = 234
  const totalCredits = 500

  return (
    <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
        
        <Card className="sm:col-span-2 glass-card">
          <CardHeader className="pb-3">
            <CardTitle>Tus Créditos</CardTitle>
            <CardDescription className="max-w-lg text-balance leading-relaxed">
              Administra tus créditos para crear nuevos pedidos. Un crédito equivale a un pedido.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <div className="text-4xl font-bold">{availableCredits}</div>
            <div className="ml-2 flex-1 text-sm text-muted-foreground">/ {totalCredits} Créditos</div>
          </CardFooter>
          <CardContent>
             <Progress value={(availableCredits / totalCredits) * 100} aria-label="Uso de crédito" />
          </CardContent>
        </Card>

        {creditPackages.map((pkg, index) => (
            <Card key={index} className="flex flex-col glass-card relative overflow-hidden">
                {pkg.popular && (
                  <Badge className="absolute top-2 right-2 bg-vivid-violet text-white">
                    <Star className="mr-1 h-3 w-3" />
                    Popular
                  </Badge>
                )}
                 <CardHeader className="pb-2">
                    <CardDescription>{pkg.description}</CardDescription>
                    <CardTitle className="text-4xl">{pkg.price}</CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                    <div className="text-sm font-semibold">{pkg.credits} créditos de entrega</div>
                    {pkg.bonus && (
                      <p className="text-xs text-muted-foreground mt-1">+ 50 créditos extra en tus primeras 3 compras.</p>
                    )}
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

      <Card className="glass-card">
        <CardHeader>
          <CardTitle>Historial de Facturación</CardTitle>
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
