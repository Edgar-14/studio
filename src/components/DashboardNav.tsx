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

const links = [
  { href: "/dashboard/new-order", label: "New Order", icon: PlusCircle },
  { href: "/dashboard/orders", label: "Orders", icon: ListOrdered },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  {
    href: "/dashboard/diagnostics",
    label: "Diagnostics",
    icon: HeartPulse,
  },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {links.map((link) => {
        const isActive = pathname.startsWith(link.href)
        const Icon = link.icon
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              isActive ? "bg-accent text-accent-foreground" : "transparent"
            )}
          >
            <Icon className="mr-2 h-4 w-4" />
            <span>{link.label}</span>
            {link.label === "Orders" && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  3
                </Badge>
              )}
          </Link>
        )
      })}
    </nav>
  )
}
