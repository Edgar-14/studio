"use client"

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
import { Logo } from "@/components/Logo"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    router.push("/dashboard")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-sm shadow-2xl glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto my-4">
            <Logo className="h-20 w-auto" />
          </div>
          <CardTitle className="font-headline text-3xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
            BeFast Delivery
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Accede a tu panel de socio
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4 p-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@ejemplo.com"
                required
                defaultValue="partner@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input id="password" type="password" required defaultValue="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 p-6 pt-0">
            <Button type="submit" className="w-full btn-gradient" size="lg">
              Iniciar Sesión
            </Button>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="#" className="underline text-primary/90 hover:text-primary">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
