import { create } from "zustand"
import { persist } from "zustand/middleware"

export type ThemePreference = "system" | "light" | "dark"

export type AppSettingsState = {
  theme: ThemePreference
  notificationsEnabled: boolean
  aiAssistEnabled: boolean

  twilioToken: string

  setTheme: (theme: ThemePreference) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setAiAssistEnabled: (enabled: boolean) => void
  setTwilioToken: (token: string) => void
  clearTwilioToken: () => void
}

export const useSettingsStore = create<AppSettingsState>()(
  persist(
    (set) => ({
      theme: "system",
      notificationsEnabled: true,
      aiAssistEnabled: true,
      twilioToken: "",

      setTheme: (theme) => set({ theme }),
      setNotificationsEnabled: (notificationsEnabled) => set({ notificationsEnabled }),
      setAiAssistEnabled: (aiAssistEnabled) => set({ aiAssistEnabled }),
      setTwilioToken: (twilioToken) => set({ twilioToken }),
      clearTwilioToken: () => set({ twilioToken: "" }),
    }),
    {
      name: "ai_call_center.settings",
      partialize: (state) => ({
        theme: state.theme,
        notificationsEnabled: state.notificationsEnabled,
        aiAssistEnabled: state.aiAssistEnabled,
        twilioToken: state.twilioToken,
      }),
    },
  ),
)

