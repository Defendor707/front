import { useEffect } from "react"

import { useSettingsStore } from "@/stores/settingsStore"

function isSystemDark() {
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false
}

export function ThemeSync() {
  const theme = useSettingsStore((s) => s.theme)

  useEffect(() => {
    const root = document.documentElement

    const apply = (dark: boolean) => {
      root.classList.toggle("dark", dark)
      root.style.colorScheme = dark ? "dark" : "light"
    }

    if (theme === "dark") {
      apply(true)
      return
    }
    if (theme === "light") {
      apply(false)
      return
    }

    // system
    apply(isSystemDark())

    const mq = window.matchMedia?.("(prefers-color-scheme: dark)")
    const handler = (e: MediaQueryListEvent) => apply(e.matches)

    try {
      mq?.addEventListener("change", handler)
      return () => mq?.removeEventListener("change", handler)
    } catch {
      // Safari fallback
      mq?.addListener(handler)
      return () => mq?.removeListener(handler)
    }
  }, [theme])

  return null
}

