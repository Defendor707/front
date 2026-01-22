import { useEffect } from "react"
import { Outlet } from "react-router-dom"

import { useAuthStore } from "@/stores/authStore"

const DEMO_USER = {
  id: "u_demo_operator",
  name: "Demo Operator",
  email: "operator@demo.uz",
  role: "operator" as const,
}

export function RequireAuth() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)

  // Avtomatik login (login panel olib tashlangan)
  useEffect(() => {
    if (!isAuthenticated || !user) {
      // Avtomatik demo user bilan login qilish
      useAuthStore.setState({
        user: DEMO_USER,
        isAuthenticated: true,
      })
    }
  }, [isAuthenticated, user])

  // Agar hali initialized bo'lmasa, loading ko'rsatish
  if (!isAuthenticated || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return <Outlet />
}

