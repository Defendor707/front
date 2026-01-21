import { ChevronLeft, ChevronRight } from "lucide-react"
import { NavLink } from "react-router-dom"

import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { NAV_ITEMS } from "@/lib/navigation"
import { cn } from "@/lib/utils"

export type SidebarProps = {
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
  className?: string
}

export function Sidebar({
  collapsed,
  onCollapsedChange,
  className,
}: SidebarProps) {
  return (
    <aside
      className={cn(
        "no-print fixed inset-y-0 left-0 z-40 hidden h-full flex-col border-r bg-background md:flex",
        collapsed ? "w-[72px]" : "w-[280px]",
        className,
      )}
    >
      <div
        className={cn(
          "flex h-14 items-center justify-between px-4",
          collapsed && "px-3",
        )}
      >
        <div className={cn("flex items-center gap-2", collapsed && "mx-auto")}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-semibold text-primary-foreground">
            AI
          </div>
          {!collapsed && (
            <div className="leading-tight">
              <div className="text-sm font-semibold">AI Call Center</div>
              <div className="text-xs text-muted-foreground">
                Operator Console
              </div>
            </div>
          )}
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className={cn("shrink-0", collapsed && "absolute right-2")}
          onClick={() => onCollapsedChange(!collapsed)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <TooltipProvider delayDuration={0}>
        <nav className="flex-1 space-y-1 px-2 py-2">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon
            const link = (
              <NavLink
                key={item.href}
                to={item.href}
                end={item.exact}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground",
                    isActive && "bg-accent text-accent-foreground",
                    collapsed && "justify-center px-2",
                  )
                }
                aria-label={item.title}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="truncate">{item.title}</span>}
              </NavLink>
            )

            if (!collapsed) return link

            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>{link}</TooltipTrigger>
                <TooltipContent side="right">{item.title}</TooltipContent>
              </Tooltip>
            )
          })}
        </nav>
      </TooltipProvider>
    </aside>
  )
}

