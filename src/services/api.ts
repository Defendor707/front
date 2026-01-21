import { analytics, calls, chats, users } from "@/mock/data"
import type {
  AnalyticsSnapshot,
  Call,
  Chat,
  ChatStatus,
  DashboardSummary,
  ID,
  User,
} from "@/types/models"

const latency = (ms = 300) => new Promise((r) => setTimeout(r, ms))

function byNewest<T extends { updatedAt?: string; createdAt?: string; startedAt?: string }>(
  a: T,
  b: T,
) {
  const aTime = Date.parse(a.updatedAt ?? a.startedAt ?? a.createdAt ?? "0")
  const bTime = Date.parse(b.updatedAt ?? b.startedAt ?? b.createdAt ?? "0")
  return bTime - aTime
}

function includesCI(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase())
}

function paginate<T>(items: T[], page: number, pageSize: number) {
  const safePage = Math.max(1, page)
  const safeSize = Math.min(50, Math.max(1, pageSize))
  const start = (safePage - 1) * safeSize
  const end = start + safeSize
  return {
    page: safePage,
    pageSize: safeSize,
    total: items.length,
    items: items.slice(start, end),
  }
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  await latency()

  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()
  const startOfDay = new Date(y, m, d).getTime()

  const callsToday = calls.filter((c) => Date.parse(c.startedAt) >= startOfDay).length
  const activeChats = chats.filter((c) => c.status === "open").length

  return {
    callsToday,
    activeChats,
    avgResponseSec: analytics.avgResponseSec,
    aiSuccessRate: analytics.aiSuccessRate,
    recentChats: [...chats].sort(byNewest).slice(0, 5),
    recentCalls: [...calls].sort(byNewest).slice(0, 5),
  }
}

export type ListChatsParams = {
  query?: string
  status?: ChatStatus | "all"
  page?: number
  pageSize?: number
}

export async function listChats(params: ListChatsParams = {}) {
  await latency()
  const { query = "", status = "all", page = 1, pageSize = 20 } = params

  let result = [...chats]

  if (status !== "all") {
    result = result.filter((c) => c.status === status)
  }

  if (query.trim()) {
    const q = query.trim()
    result = result.filter((c) => {
      const u = users.find((x) => x.id === c.userId)
      return (
        includesCI(c.topic, q) ||
        c.tags.some((t) => includesCI(t, q)) ||
        includesCI(c.aiSummary, q) ||
        (u ? includesCI(u.fullName, q) || includesCI(u.phone, q) : false)
      )
    })
  }

  result.sort(byNewest)
  return paginate(result, page, pageSize)
}

export async function getChatById(id: ID): Promise<Chat | null> {
  await latency(180)
  return chats.find((c) => c.id === id) ?? null
}

export type ListCallsParams = {
  query?: string
  status?: Call["status"] | "all"
  page?: number
  pageSize?: number
}

export async function listCalls(params: ListCallsParams = {}) {
  await latency()
  const { query = "", status = "all", page = 1, pageSize = 20 } = params

  let result = [...calls]

  if (status !== "all") {
    result = result.filter((c) => c.status === status)
  }

  if (query.trim()) {
    const q = query.trim()
    result = result.filter((c) => {
      const u = users.find((x) => x.id === c.userId)
      return (
        c.tags.some((t) => includesCI(t, q)) ||
        includesCI(c.aiSummary, q) ||
        (u ? includesCI(u.fullName, q) || includesCI(u.phone, q) : false)
      )
    })
  }

  result.sort(byNewest)
  return paginate(result, page, pageSize)
}

export async function getCallById(id: ID): Promise<Call | null> {
  await latency(180)
  return calls.find((c) => c.id === id) ?? null
}

export async function getUserById(id: ID): Promise<User | null> {
  await latency(120)
  return users.find((u) => u.id === id) ?? null
}

export async function listUsers(): Promise<User[]> {
  await latency(150)
  return [...users]
}

export async function getAnalytics(
  range: AnalyticsSnapshot["range"] = "7d",
): Promise<AnalyticsSnapshot> {
  await latency()
  return { ...analytics, range }
}

