import {
  BarChart3,
  Headphones,
  LayoutDashboard,
  MessageSquare,
  PhoneCall,
  Settings,
} from "lucide-react"
import type { ComponentType } from "react"

export type NavItem = {
  title: string
  href: string
  icon: ComponentType<{ className?: string }>
  exact?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, exact: true },
  { title: "AI Chats", href: "/chats", icon: MessageSquare },
  { title: "Calls", href: "/calls", icon: PhoneCall },
  { title: "Live Call", href: "/call", icon: Headphones },
  { title: "Analytics", href: "/analytics", icon: BarChart3 },
  { title: "Settings", href: "/settings", icon: Settings },
]

export function getPageTitle(pathname: string): string {
  const match = NAV_ITEMS.find((i) =>
    i.exact ? i.href === pathname : pathname.startsWith(i.href),
  )
  return match?.title ?? "AI Call Center"
}

