import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="grid gap-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="font-headline">Detalles del Negocio</CardTitle>
          <CardDescription>
            Actualiza la información de tu negocio para recogidas precisas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-6">
            <div className="grid gap-3">
              <Label htmlFor="name">Nombre de Recogida</Label>
              <Input
                id="name"
                type="text"
                className="w-full"
                defaultValue="BeFast HQ"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="phone">Teléfono de Recogida</Label>
              <Input
                id="phone"
                type="tel"
                className="w-full"
                defaultValue="(555) 987-6543"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="address">Dirección de Recogida</Label>
              <Input
                id="address"
                type="text"
                className="w-full"
                defaultValue="123 Innovation Drive, Tech City, 12345"
              />
            </div>
          </form>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button className="btn-gradient">Guardar Cambios</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
