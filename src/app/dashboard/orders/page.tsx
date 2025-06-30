import { Badge } from "@/components/ui/badge"
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

const orders = [
  {
    orderId: "ORD001",
    customer: "Liam Johnson",
    date: "2023-11-23",
    status: "Delivered",
    total: "$250.00",
  },
  {
    orderId: "ORD002",
    customer: "Olivia Smith",
    date: "2023-11-24",
    status: "In Transit",
    total: "$150.00",
  },
  {
    orderId: "ORD003",
    customer: "Noah Williams",
    date: "2023-11-24",
    status: "Pending",
    total: "$350.00",
  },
  {
    orderId: "ORD004",
    customer: "Emma Brown",
    date: "2023-11-25",
    status: "Delivered",
    total: "$450.00",
  },
  {
    orderId: "ORD005",
    customer: "Ava Jones",
    date: "2023-11-26",
    status: "Canceled",
    total: "$550.00",
  },
]

const statusVariant: { [key: string]: "default" | "secondary" | "outline" | "destructive" } = {
    Delivered: "default",
    "In Transit": "secondary",
    Pending: "outline",
    Canceled: "destructive",
}

export default function OrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Order Status</CardTitle>
        <CardDescription>
          Track the real-time status of your deliveries.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="font-medium">{order.orderId}</TableCell>
                <TableCell>{order.customer}</TableCell>
                <TableCell>{order.date}</TableCell>
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
  )
}
