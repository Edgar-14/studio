"use client"

import { useState } from "react"
import Link from "next/link"
import { DashboardNav } from "@/components/DashboardNav"
import { Logo } from "@/components/Logo"
import { UserNav } from "@/components/UserNav"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { PanelLeft } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="flex min-h-screen w-full flex-col bg-transparent">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-10 hidden flex-col border-r bg-secondary/60 backdrop-blur-xl transition-all duration-300 sm:flex",
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
            href="/"
            className="flex items-center gap-2 font-semibold"
          >
            <Logo className="h-8 w-auto" />
            <span className={cn("font-headline text-lg", isCollapsed && "hidden")}>
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
          "flex flex-col sm:gap-4 sm:py-4 transition-all duration-300",
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
              <SheetContent side="left" className="sm:max-w-xs bg-secondary/60 backdrop-blur-xl">
                 <div className="flex h-16 items-center border-b px-4">
                    <Link href="/" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-8 w-auto" />
                        <span className="font-headline text-lg">BeFast</span>
                    </Link>
                </div>
                <div className="flex-1 overflow-auto py-4">
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
          <UserNav />
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  )
}
