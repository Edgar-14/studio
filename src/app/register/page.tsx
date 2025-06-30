"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Logo } from "@/components/Logo"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  businessName: z.string().min(2, "El nombre del negocio es requerido."),
  businessPhone: z.string().min(10, "El teléfono debe tener al menos 10 dígitos."),
  businessAddress: z.string().min(10, "La dirección es requerida."),
  email: z.string().email("Por favor ingresa un email válido."),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres."),
  terms: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar los términos y condiciones.",
  }),
  privacy: z.boolean().refine((val) => val === true, {
    message: "Debes aceptar las políticas de privacidad.",
  }),
})

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: "",
      businessPhone: "",
      businessAddress: "",
      email: "",
      password: "",
      terms: false,
      privacy: false,
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values)
    toast({
      title: "¡Registro Exitoso!",
      description: "Tu cuenta ha sido creada. Ahora puedes iniciar sesión.",
      className: "bg-green-100 border-green-300 text-green-800",
    })
    router.push("/login")
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center p-4 bg-secondary">
      <Card className="w-full max-w-lg shadow-2xl glass-card">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <Logo className="h-20 w-auto" />
          </div>
          <CardTitle className="font-headline text-3xl">Únete a BeFast</CardTitle>
          <CardDescription>
            Crea una cuenta para empezar a gestionar tus entregas.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4 p-6">
              <h3 className="font-semibold text-lg text-foreground">Detalles del Negocio</h3>
              <FormField
                control={form.control}
                name="businessName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Negocio</FormLabel>
                    <FormControl>
                      <Input placeholder="Mi Negocio Inc." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono de Contacto</FormLabel>
                    <FormControl>
                      <Input placeholder="(555) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="businessAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Dirección de Recogida</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Calle Principal, Ciudad" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <h3 className="font-semibold text-lg text-foreground pt-4">Detalles de la Cuenta</h3>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="tu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                  control={form.control}
                  name="terms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md pt-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Acepto los{" "}
                          <Link href="#" className="underline text-primary/90 hover:text-primary">
                            términos y condiciones
                          </Link>
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="privacy"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          He leído y acepto la{" "}
                          <Link href="#" className="underline text-primary/90 hover:text-primary">
                            política de privacidad
                          </Link>
                        </FormLabel>
                         <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

            </CardContent>
            <CardFooter className="flex flex-col gap-4 p-6 pt-2">
              <Button type="submit" className="w-full btn-gradient" size="lg">
                Crear Cuenta
              </Button>
              <div className="text-center text-sm">
                ¿Ya tienes una cuenta?{" "}
                <Link href="/login" className="underline text-primary/90 hover:text-primary">
                  Inicia sesión aquí
                </Link>
              </div>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
