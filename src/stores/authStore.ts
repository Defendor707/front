import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserRole = "admin" | "operator" | "supervisor"

export type AuthUser = {
  id: string
  name: string
  email: string
  role: UserRole
}

export type AuthState = {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (args: { email: string; password: string; remember: boolean }) => Promise<void>
  logout: () => void
}

const DEMO_USER: AuthUser = {
  id: "u_demo_operator",
  name: "Demo Operator",
  email: "operator@demo.uz",
  role: "operator",
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,

      async login({ email, password, remember }) {
        // Mock auth: accept any non-empty credentials.
        if (!email || !password) {
          throw new Error("Email and password are required.")
        }

        await sleep(600)

        const user: AuthUser = {
          ...DEMO_USER,
          email,
          name: email.split("@")[0]?.replaceAll(".", " ") || DEMO_USER.name,
        }

        set({ user, isAuthenticated: true })

        // If not remembering, clear persisted storage on next tick.
        if (!remember) {
          queueMicrotask(() => {
            try {
              localStorage.removeItem("ai_call_center.auth")
            } catch {
              // ignore
            }
          })
        }
      },

      logout() {
        set({ user: null, isAuthenticated: false })
        try {
          localStorage.removeItem("ai_call_center.auth")
        } catch {
          // ignore
        }
      },
    }),
    {
      name: "ai_call_center.auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)

