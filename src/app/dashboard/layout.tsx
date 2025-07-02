"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext" // Import useAuth
import { DashboardNav } from "@/components/DashboardNav"
import { Logo } from "@/components/Logo"
import { UserNav } from "@/components/UserNav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { PanelLeft, Globe, Facebook, Instagram, Store, Phone, Mail, Loader2 } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

const Footer = () => (
    <footer className="w-full mt-auto py-8 px-6 text-center text-muted-foreground text-xs md:text-sm">
      <div className="flex justify-center items-center gap-4 md:gap-6 mb-4">
        <a href="https://befastmarket.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300" aria-label="BeFast Market Website">
          <Globe className="w-5 h-5 md:w-6 md:h-6" />
        </a>
        <a href="https://www.facebook.com/befastmarket1/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300" aria-label="Facebook">
          <Facebook className="w-5 h-5 md:w-6 md:h-6" />
        </a>
        <a href="https://www.instagram.com/befastmarket/" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300" aria-label="Instagram">
          <Instagram className="w-5 h-5 md:w-6 md:h-6" />
        </a>
        <a href="https://play.google.com/store/apps/details?id=mercado.befast" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors duration-300" aria-label="Google Play Store">
          <Store className="w-5 h-5 md:w-6 md:h-6" />
        </a>
      </div>
      <div className="space-y-1">
        <p>BeFast Market es una empresa hermana.</p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="mailto:soporte@befastapp.com.mx" className="flex items-center gap-1 hover:text-primary transition-colors duration-300">
            <Mail className="w-4 h-4"/>
            soporte@befastapp.com.mx
          </a>
          <a href="tel:3121905494" className="flex items-center gap-1 hover:text-primary transition-colors duration-300">
            <Phone className="w-4 h-4"/>
            312 190 5494
          </a>
        </div>
      </div>
    </footer>
);


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading || !user) {
    // Muestra un loader mientras se verifica el estado o si no hay usuario (antes de la redirección)
    // Esto evita un parpadeo del contenido del dashboard si el usuario no está autenticado
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    )
  }

  // Si el usuario está autenticado, renderiza el layout del dashboard
  return (
    <div className="flex min-h-screen w-full flex-col bg-background/95">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-background/80 backdrop-blur-xl transition-all duration-300 sm:flex",
          isCollapsed ? "w-16" : "w-60"
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b px-4",
            isCollapsed ? "justify-center" : "px-6"
          )}
        >
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="h-8 w-auto" />
            <span className={cn("font-bold text-lg", isCollapsed && "hidden")}>
              BeFast
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto py-4">
          <DashboardNav isCollapsed={isCollapsed} />
        </div>
      </aside>
      <div
        className={cn(
          "flex flex-col flex-1 sm:gap-4 sm:py-4 transition-all duration-300",
          isCollapsed ? "sm:pl-16" : "sm:pl-60"
        )}
      >
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
          <div className="flex items-center gap-2">
            <Sheet>
              <SheetTrigger asChild>
                <Button size="icon" variant="outline" className="sm:hidden">
                  <PanelLeft className="h-5 w-5" />
                  <span className="sr-only">Alternar Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="sm:max-w-xs bg-background/80 backdrop-blur-xl p-0">
                <div className="flex h-16 items-center border-b px-4">
                  <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <Logo className="h-8 w-auto" />
                    <span className="font-bold text-lg">BeFast</span>
                  </Link>
                </div>
                <div className="overflow-auto py-4">
                  <DashboardNav isCollapsed={false} />
                </div>
              </SheetContent>
            </Sheet>
            <Button
              variant="outline"
              size="icon"
              className="hidden sm:flex"
              onClick={() => setIsCollapsed(!isCollapsed)}
            >
              <PanelLeft className="h-5 w-5" />
              <span className="sr-only">Alternar Barra Lateral</span>
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <UserNav />
          </div>
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  )
}
