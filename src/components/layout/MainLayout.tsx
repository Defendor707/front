import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useState } from "react"
import { Outlet, useLocation } from "react-router-dom"

import { Header } from "@/components/layout/Header"
import { Sidebar } from "@/components/layout/Sidebar"
import { cn } from "@/lib/utils"
import { useAuthStore } from "@/stores/authStore"

const SIDEBAR_KEY = "ai_call_center.sidebar_collapsed"

export function MainLayout() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const location = useLocation()
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    try {
      const raw = localStorage.getItem(SIDEBAR_KEY)
      return raw === "true"
    } catch {
      return false
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(SIDEBAR_KEY, String(collapsed))
    } catch {
      // ignore
    }
  }, [collapsed])

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onCollapsedChange={setCollapsed} />

      <div
        className={cn(
          "flex min-h-screen flex-col",
          collapsed ? "md:pl-[72px]" : "md:pl-[280px]",
        )}
      >
        <Header
          userName={user?.name}
          userRole={
            user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : undefined
          }
          onSignOut={logout}
        />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-7xl p-4 md:p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
              >
                <Outlet />
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  )
}

