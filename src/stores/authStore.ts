import { create } from "zustand"
import { persist } from "zustand/middleware"
import { API_BASE_URL, USE_REAL_API, FORCE_REAL_API } from "@/lib/apiConfig"

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

const isRealAPIEnabled = USE_REAL_API || FORCE_REAL_API

async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      // Avtomatik demo user bilan initialized (login panel olib tashlangan)
      user: DEMO_USER,
      isAuthenticated: true,

      async login({ email, password, remember }) {
        if (!email || !password) {
          throw new Error("Email and password are required.")
        }

        // Real API'ga ulanadi (production'da avtomatik)
        if (isRealAPIEnabled) {
          try {
            const response = await apiRequest<{
              user: AuthUser
              token: string
              expiresIn: number
            }>("/auth/login", {
              method: "POST",
              body: JSON.stringify({ email, password, remember }),
            })

            // Token'ni localStorage'ga saqlash
            if (response.token) {
              try {
                localStorage.setItem("ai_call_center.token", response.token)
              } catch {
                // ignore
              }
            }

            set({ user: response.user, isAuthenticated: true })
            return
          } catch (error) {
            console.error("Login error:", error)
            // API mavjud emas bo'lsa, mock mode'ga o'tkazish
            const errorMessage = error instanceof Error ? error.message : String(error)
            if (
              errorMessage.includes("fetch") ||
              errorMessage.includes("Failed to fetch") ||
              errorMessage.includes("NetworkError") ||
              errorMessage.includes("Could not resolve") ||
              errorMessage.includes("ERR_NAME_NOT_RESOLVED")
            ) {
              console.warn("API server is not available, falling back to mock mode")
              // Mock mode'ga o'tish - quyidagi kodga o'tadi
            } else {
              // Boshqa xatolar (401, 403, etc.) - foydalanuvchiga ko'rsatish
              throw new Error(
                errorMessage.includes("401") || errorMessage.includes("Unauthorized")
                  ? "Invalid email or password"
                  : errorMessage.includes("403") || errorMessage.includes("Forbidden")
                    ? "Access denied"
                    : "Login failed. Please try again."
              )
            }
          }
        }

        // Mock auth (development yoki API mavjud emas bo'lsa)
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
      // Hydration'da agar user bo'lmasa, avtomatik demo user qo'shish
      onRehydrateStorage: () => (state) => {
        if (!state || !state.user || !state.isAuthenticated) {
          return { user: DEMO_USER, isAuthenticated: true }
        }
        return state
      },
    },
  ),
)

