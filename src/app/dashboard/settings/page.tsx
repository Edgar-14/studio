import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

const BusinessDetail = ({ label, value }: { label: string; value: string }) => (
  <div className="grid gap-2">
    <Label className="text-muted-foreground">{label}</Label>
    <p className="text-lg font-medium text-foreground">
      {value}
    </p>
  </div>
);

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-headline">Detalles del Negocio</CardTitle>
          <CardDescription>
            Esta es la información de tu negocio utilizada para las recogidas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8">
            <BusinessDetail label="Nombre de Recogida" value="BeFast HQ" />
            <BusinessDetail label="Teléfono de Recogida" value="(555) 987-6543" />
            <BusinessDetail label="Dirección de Recogida" value="123 Innovation Drive, Tech City, 12345" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
