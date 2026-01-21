import { create } from "zustand"
import { persist } from "zustand/middleware"

export type UserContext = {
  userId?: string
  name?: string
  phone?: string
  preferences?: {
    language?: "uz" | "ru" | "en"
    timezone?: string
  }
  aiContext?: {
    // AI'ga foydalanuvchi haqida ma'lumotlar
    knownName?: string // AI'ga aytilgan ism (masalan "Moychechak")
    personalityNotes?: string[] // AI tomonidan eslab qolingan shaxsiy ma'lumotlar
    conversationHistory?: string[] // So'nggi muhokamalar mavzulari
  }
  metadata?: Record<string, unknown>
}

export type UserContextState = {
  contexts: Record<string, UserContext> // userId -> context
  updateContext: (userId: string, updates: Partial<UserContext>) => void
  clearContext: (userId: string) => void
  getContext: (userId: string) => UserContext | null
  updateAIContext: (userId: string, aiUpdates: Partial<UserContext["aiContext"]>) => void
}

export const useUserContextStore = create<UserContextState>()(
  persist(
    (set, get) => ({
      contexts: {},

      updateContext(userId, updates) {
        set((state) => ({
          contexts: {
            ...state.contexts,
            [userId]: {
              ...state.contexts[userId],
              ...updates,
            },
          },
        }))
      },

      updateAIContext(userId, aiUpdates) {
        set((state) => {
          const current = state.contexts[userId] || {}
          return {
            contexts: {
              ...state.contexts,
              [userId]: {
                ...current,
                aiContext: {
                  ...current.aiContext,
                  ...aiUpdates,
                },
              },
            },
          }
        })
      },

      clearContext(userId) {
        set((state) => {
          const next = { ...state.contexts }
          delete next[userId]
          return { contexts: next }
        })
      },

      getContext(userId) {
        return get().contexts[userId] ?? null
      },
    }),
    {
      name: "ai_call_center.user_contexts",
    },
  ),
)
