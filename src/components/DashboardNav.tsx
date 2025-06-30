"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"
import {
  CreditCard,
  HeartPulse,
  ListOrdered,
  PlusCircle,
  Settings,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const links = [
  { href: "/dashboard/new-order", label: "Nuevo Pedido", icon: PlusCircle },
  { href: "/dashboard/orders", label: "Pedidos", icon: ListOrdered },
  { href: "/dashboard/billing", label: "Facturación", icon: CreditCard },
  { href: "/dashboard/settings", label: "Ajustes", icon: Settings },
  {
    href: "/dashboard/diagnostics",
    label: "Diagnóstico",
    icon: HeartPulse,
  },
]

export function DashboardNav({ isCollapsed }: { isCollapsed: boolean }) {
  const pathname = usePathname()

  return (
    <TooltipProvider delayDuration={0}>
      <nav
        className={cn(
          "grid items-start gap-1",
          isCollapsed ? "justify-center px-2" : "px-4"
        )}
      >
        {links.map((link) => {
          const isActive = pathname.startsWith(link.href)
          const Icon = link.icon
          return (
            <Tooltip key={link.href}>
              <TooltipTrigger asChild>
                <Link
                  href={link.href}
                  className={cn(
                    "group flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-colors hover:text-foreground hover:bg-muted",
                    isActive && "bg-primary/20 text-foreground",
                    isCollapsed ? "justify-center" : ""
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className={cn(isCollapsed && "sr-only")}>
                    {link.label}
                  </span>
                  {link.label === "Pedidos" && !isCollapsed && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      3
                    </Badge>
                  )}
                </Link>
              </TooltipTrigger>
              {isCollapsed && (
                <TooltipContent side="right">{link.label}</TooltipContent>
              )}
            </Tooltip>
          )
        })}
      </nav>
    </TooltipProvider>
  )
}
