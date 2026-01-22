import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter } from "react-router-dom"

import App from "@/App"
import { ErrorBoundary } from "@/components/ErrorBoundary"
import { ThemeSync } from "@/components/providers/ThemeSync"
import "./index.css"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

// Debug logging
console.log("🚀 Frontend starting...")
console.log("Root element:", document.getElementById("root"))

const rootElement = document.getElementById("root")
if (!rootElement) {
  console.error("❌ Root element not found!")
  document.body.innerHTML = `
    <div style="display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 2rem; font-family: system-ui;">
      <div style="max-width: 500px; text-align: center;">
        <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #dc2626;">Root element not found</h1>
        <p style="color: #6b7280;">Please check the HTML structure.</p>
      </div>
    </div>
  `
  throw new Error("Root element not found")
}

console.log("✅ Root element found, rendering app...")

try {
  createRoot(rootElement).render(
    <StrictMode>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ThemeSync />
            <App />
          </BrowserRouter>
        </QueryClientProvider>
      </ErrorBoundary>
    </StrictMode>,
  )
  console.log("✅ App rendered successfully!")
} catch (error) {
  console.error("❌ Failed to render app:", error)
  rootElement.innerHTML = `
    <div style="display: flex; min-height: 100vh; align-items: center; justify-content: center; padding: 2rem; font-family: system-ui; background: #f3f4f6;">
      <div style="max-width: 500px; text-align: center; background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
        <h1 style="font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #dc2626;">Failed to load application</h1>
        <p style="color: #6b7280; margin-bottom: 1rem;">${error instanceof Error ? error.message : "Unknown error"}</p>
        <button onclick="window.location.reload()" style="padding: 0.5rem 1rem; background: #3b82f6; color: white; border: none; border-radius: 0.375rem; cursor: pointer;">
          Reload Page
        </button>
        <details style="margin-top: 1rem; text-align: left;">
          <summary style="cursor: pointer; color: #6b7280; font-size: 0.875rem;">Error Details</summary>
          <pre style="margin-top: 0.5rem; padding: 0.5rem; background: #f3f4f6; border-radius: 0.25rem; overflow: auto; font-size: 0.75rem;">${error instanceof Error ? error.stack : String(error)}</pre>
        </details>
      </div>
    </div>
  `
}
