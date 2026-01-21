import { Route, Routes } from "react-router-dom"

import { MainLayout } from "@/components/layout/MainLayout"
import { AnalyticsPage } from "@/pages/Analytics"
import { CallDetailPage } from "@/pages/CallDetail"
import { CallsPage } from "@/pages/Calls"
import { ChatDetailPage } from "@/pages/ChatDetail"
import { ChatsPage } from "@/pages/Chats"
import { DashboardPage } from "@/pages/Dashboard"
import { LiveCallPage } from "@/pages/LiveCall"
import { LoginPage } from "@/pages/Login"
import { NotFoundPage } from "@/pages/NotFound"
import { SettingsPage } from "@/pages/Settings"
import { RequireAuth } from "@/routes/RequireAuth"

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<RequireAuth />}>
        <Route element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="chats" element={<ChatsPage />} />
          <Route path="chats/:chatId" element={<ChatDetailPage />} />
          <Route path="calls" element={<CallsPage />} />
          <Route path="calls/:callId" element={<CallDetailPage />} />
          <Route path="call" element={<LiveCallPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
