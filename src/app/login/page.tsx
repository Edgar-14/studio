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
    router.push("/dashboard/new-order")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-transparent p-4">
      <Card className="w-full max-w-sm shadow-2xl">
        <CardHeader className="bg-primary text-center text-primary-foreground">
          <div className="mx-auto my-4 h-16 w-16 rounded-full bg-primary-foreground/20 p-2">
            <Logo className="h-full w-full" />
          </div>
          <CardTitle className="font-headline text-3xl">
            BeFast Market
          </CardTitle>
          <CardDescription className="text-primary-foreground/80">
            Accede a tu panel de pedidos
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
            <Button type="submit" className="w-full" size="lg">
              Iniciar Sesión
            </Button>
            <div className="text-center text-sm">
              ¿No tienes una cuenta?{" "}
              <Link href="#" className="underline">
                Regístrate aquí
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
