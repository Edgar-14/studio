import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Building, Phone, MapPin } from "lucide-react"

const BusinessDetail = ({ icon, label, value }: { icon: React.ReactNode, label: string; value: string }) => (
  <div className="flex items-start gap-4">
    <div className="text-primary pt-1">{icon}</div>
    <div className="grid gap-1">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-lg text-foreground">
        {value}
      </p>
    </div>
  </div>
);

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-headline">Detalles del Negocio</CardTitle>
          <CardDescription>
            Esta es la información de tu negocio utilizada para las recogidas y la facturación. Estos datos se configuran durante el registro.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            <BusinessDetail icon={<Building className="h-5 w-5" />} label="Nombre del Negocio" value="BeFast HQ" />
            <BusinessDetail icon={<Phone className="h-5 w-5" />} label="Teléfono de Contacto" value="(555) 987-6543" />
            <BusinessDetail icon={<MapPin className="h-5 w-5" />} label="Dirección de Recogida" value="123 Innovation Drive, Tech City, 12345" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
