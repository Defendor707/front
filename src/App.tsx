import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"

import { MainLayout } from "@/components/layout/MainLayout"
import { LoginPage } from "@/pages/Login"
import { RequireAuth } from "@/routes/RequireAuth"

// Lazy load pages for better performance
const DashboardPage = lazy(() => import("@/pages/Dashboard").then(m => ({ default: m.DashboardPage })))
const ChatsPage = lazy(() => import("@/pages/Chats").then(m => ({ default: m.ChatsPage })))
const ChatDetailPage = lazy(() => import("@/pages/ChatDetail").then(m => ({ default: m.ChatDetailPage })))
const CallsPage = lazy(() => import("@/pages/Calls").then(m => ({ default: m.CallsPage })))
const CallDetailPage = lazy(() => import("@/pages/CallDetail").then(m => ({ default: m.CallDetailPage })))
const LiveCallPage = lazy(() => import("@/pages/LiveCall").then(m => ({ default: m.LiveCallPage })))
const AnalyticsPage = lazy(() => import("@/pages/Analytics").then(m => ({ default: m.AnalyticsPage })))
const SettingsPage = lazy(() => import("@/pages/Settings").then(m => ({ default: m.SettingsPage })))
const NotFoundPage = lazy(() => import("@/pages/NotFound").then(m => ({ default: m.NotFoundPage })))

// Loading component
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
        <p className="mt-4 text-sm text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route
            index
            element={
              <Suspense fallback={<PageLoader />}>
                <DashboardPage />
              </Suspense>
            }
          />
          <Route
            path="chats"
            element={
              <Suspense fallback={<PageLoader />}>
                <ChatsPage />
              </Suspense>
            }
          />
          <Route
            path="chats/:chatId"
            element={
              <Suspense fallback={<PageLoader />}>
                <ChatDetailPage />
              </Suspense>
            }
          />
          <Route
            path="calls"
            element={
              <Suspense fallback={<PageLoader />}>
                <CallsPage />
              </Suspense>
            }
          />
          <Route
            path="calls/:callId"
            element={
              <Suspense fallback={<PageLoader />}>
                <CallDetailPage />
              </Suspense>
            }
          />
          <Route
            path="call"
            element={
              <Suspense fallback={<PageLoader />}>
                <LiveCallPage />
              </Suspense>
            }
          />
          <Route
            path="analytics"
            element={
              <Suspense fallback={<PageLoader />}>
                <AnalyticsPage />
              </Suspense>
            }
          />
          <Route
            path="settings"
            element={
              <Suspense fallback={<PageLoader />}>
                <SettingsPage />
              </Suspense>
            }
          />
          <Route
            path="*"
            element={
              <Suspense fallback={<PageLoader />}>
                <NotFoundPage />
              </Suspense>
            }
          />
        </Route>
      </Route>
    </Routes>
  )
}
