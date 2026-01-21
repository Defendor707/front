import type { AnalyticsSnapshot, ID } from "@/types/models"
import type { ListCallsParams, ListChatsParams } from "@/services/api"

export const queryKeys = {
  dashboard: ["dashboard"] as const,
  users: ["users"] as const,
  chats: (params: ListChatsParams) => ["chats", params] as const,
  chat: (id: ID) => ["chat", id] as const,
  calls: (params: ListCallsParams) => ["calls", params] as const,
  call: (id: ID) => ["call", id] as const,
  user: (id: ID) => ["user", id] as const,
  analytics: (range: AnalyticsSnapshot["range"]) => ["analytics", range] as const,
}

