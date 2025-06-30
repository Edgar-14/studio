"use client"

import { APIProvider } from "@vis.gl/react-google-maps"
import Link from "next/link"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Logo } from "@/components/Logo"
import { RegisterForm } from "./RegisterForm"

export default function RegisterPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    return (
        <div className="flex min-h-screen w-full items-center justify-center p-4 bg-secondary">
            <Card className="w-full max-w-4xl shadow-2xl glass-card">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex justify-center">
                        <Logo className="h-20 w-auto" />
                    </div>
                    <CardTitle className="text-3xl font-bold">Únete a BeFast</CardTitle>
                    <CardDescription>
                        Crea una cuenta para empezar a gestionar tus entregas.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                {!apiKey ? (
                    <div className="text-center text-destructive">
                        <p>La clave de API de Google Maps no está configurada.</p>
                        <p>Por favor, añade NEXT_PUBLIC_GOOGLE_MAPS_API_KEY a tu archivo .env para continuar.</p>
                    </div>
                ) : (
                    <APIProvider apiKey={apiKey}>
                        <RegisterForm />
                    </APIProvider>
                )}
                </CardContent>
                <div className="text-center text-sm p-6 pt-2">
                    ¿Ya tienes una cuenta?{" "}
                    <Link href="/login" className="underline text-primary/90 hover:text-primary">
                        Inicia sesión aquí
                    </Link>
                </div>
            </Card>
        </div>
    )
}
