import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { DollarSign, Package, CreditCard, Activity } from "lucide-react"

const orders = [
  {
    orderId: "ORD001",
    customer: "Liam Johnson",
    date: "hace 2 horas",
    status: "En Tránsito",
    total: "$150.00",
  },
  {
    orderId: "ORD002",
    customer: "Olivia Smith",
    date: "hace 5 horas",
    status: "Pendiente",
    total: "$350.00",
  },
  {
    orderId: "ORD003",
    customer: "Noah Williams",
    date: "ayer",
    status: "Entregado",
    total: "$450.00",
  },
  {
    orderId: "ORD004",
    customer: "Emma Brown",
    date: "ayer",
    status: "Entregado",
    total: "$250.00",
  },
]

const statusVariant: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
    "Entregado": "default",
    "En Tránsito": "secondary",
    "Pendiente": "outline",
    "Cancelado": "destructive",
}

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">+20.1% desde el mes pasado</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+12</div>
            <p className="text-xs text-muted-foreground">3 en tránsito, 9 pendientes</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas de Hoy</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+1,234</div>
            <p className="text-xs text-muted-foreground">+19% desde ayer</p>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Entrega</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.2%</div>
            <p className="text-xs text-muted-foreground">En los últimos 30 días</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-1">
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>
              Los últimos pedidos procesados.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {orders.map((order) => (
                    <TableRow key={order.orderId}>
                        <TableCell>
                        <div className="font-medium">{order.customer}</div>
                        <div className="text-sm text-muted-foreground">{order.date}</div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={statusVariant[order.status] || 'default'}>{order.status}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{order.total}</TableCell>
                    </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
