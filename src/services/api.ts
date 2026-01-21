import { analytics, calls, chats, users } from "@/mock/data"
import { API_BASE_URL, USE_REAL_API, FORCE_REAL_API } from "@/lib/apiConfig"
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

// Real API mavjudligini tekshirish
const isRealAPIEnabled = USE_REAL_API || FORCE_REAL_API

// Backend API chaqiruvlari uchun helper (backend tayyor bo'lganda ishlatiladi)
export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  // Token'ni header'ga qo'shish
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("ai_call_center.token") 
    : null

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: response.statusText }))
    throw new Error(error.message || `HTTP ${response.status}`)
  }

  return response.json()
}

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
  // Real API'ga ulanadi agar production'da va API URL sozlangan bo'lsa
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<DashboardSummary>("/dashboard/summary")
    } catch (error) {
      console.error("Failed to fetch dashboard from API, falling back to mock:", error)
      // Fallback to mock if API fails
    }
  }

  // Mock data (development yoki API mavjud emas bo'lsa)
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
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      const queryParams = new URLSearchParams()
      if (params.query) queryParams.append("query", params.query)
      if (params.status && params.status !== "all") queryParams.append("status", params.status)
      queryParams.append("page", String(params.page || 1))
      queryParams.append("pageSize", String(params.pageSize || 20))
      
      return await apiRequest<{ page: number; pageSize: number; total: number; items: Chat[] }>(
        `/chats?${queryParams.toString()}`
      )
    } catch (error) {
      console.error("Failed to fetch chats from API, falling back to mock:", error)
    }
  }

  // Mock data
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
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<Chat>(`/chats/${id}`)
    } catch (error) {
      console.error("Failed to fetch chat from API, falling back to mock:", error)
    }
  }

  // Mock data
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
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      const queryParams = new URLSearchParams()
      if (params.query) queryParams.append("query", params.query)
      if (params.status && params.status !== "all") queryParams.append("status", params.status)
      queryParams.append("page", String(params.page || 1))
      queryParams.append("pageSize", String(params.pageSize || 20))
      
      return await apiRequest<{ page: number; pageSize: number; total: number; items: Call[] }>(
        `/calls?${queryParams.toString()}`
      )
    } catch (error) {
      console.error("Failed to fetch calls from API, falling back to mock:", error)
    }
  }

  // Mock data
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
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<Call>(`/calls/${id}`)
    } catch (error) {
      console.error("Failed to fetch call from API, falling back to mock:", error)
    }
  }

  // Mock data
  await latency(180)
  return calls.find((c) => c.id === id) ?? null
}

export async function getUserById(id: ID): Promise<User | null> {
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<User>(`/users/${id}`)
    } catch (error) {
      console.error("Failed to fetch user from API, falling back to mock:", error)
    }
  }

  // Mock data
  await latency(120)
  return users.find((u) => u.id === id) ?? null
}

export async function listUsers(): Promise<User[]> {
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<User[]>("/users")
    } catch (error) {
      console.error("Failed to fetch users from API, falling back to mock:", error)
    }
  }

  // Mock data
  await latency(150)
  return [...users]
}

export async function getAnalytics(
  range: AnalyticsSnapshot["range"] = "7d",
): Promise<AnalyticsSnapshot> {
  // Real API'ga ulanadi
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<AnalyticsSnapshot>(`/analytics?range=${range}`)
    } catch (error) {
      console.error("Failed to fetch analytics from API, falling back to mock:", error)
    }
  }

  // Mock data
  await latency()
  return { ...analytics, range }
}

// AI Chat API
export type SendChatMessageParams = {
  chatId?: string
  userId: string
  message: string
  userContext?: {
    name?: string
    phone?: string
    language?: string
  }
}

export type ChatMessageResponse = {
  messageId: string
  chatId: string
  response: string
  contextUpdated?: boolean
  suggestedActions?: string[]
}

export async function sendChatMessage(
  params: SendChatMessageParams,
): Promise<ChatMessageResponse> {
  // Real API'ga ulanadi (production'da avtomatik)
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<ChatMessageResponse>("/ai/chat", {
        method: "POST",
        body: JSON.stringify(params),
      })
    } catch (error) {
      console.error("AI chat error:", error)
      throw error
    }
  }

  // Mock mode (development yoki API mavjud emas bo'lsa)
  await latency(800)

  const mockResponse: ChatMessageResponse = {
    messageId: `msg_${Date.now()}`,
    chatId: params.chatId || `chat_${Date.now()}`,
    response: generateMockAIResponse(params),
    contextUpdated: params.message.toLowerCase().includes("mening ismim") || params.message.toLowerCase().includes("men"),
  }

  return mockResponse
}

function generateMockAIResponse(params: SendChatMessageParams): string {
  const msg = params.message.toLowerCase()

  // Ismni aniqlash
  if (msg.includes("mening ismim") || msg.includes("men")) {
    const nameMatch = params.message.match(/(?:mening ismim|men)\s+(\w+)/i)
    if (nameMatch) {
      const name = nameMatch[1]
      return `Tushunarli! Sizning ismingiz ${name}. Yaxshi, ${name}, sizga qanday yordam bera olaman?`
    }
  }

  // Kontekstni eslash
  const context = params.userContext
  if (context?.name) {
    if (msg.includes("salom") || msg.includes("assalomu alaykum")) {
      return `Assalomu alaykum, ${context.name}! Yana siz bilan gaplashishdan xursandman. Nima bilan yordam beraman?`
    }
  }

  // Umumiy javob
  return `Tushunarli. Sizga qanday yordam bera olaman?`
}

// AI Call API (real-time voice conversation)
export type StartAICallParams = {
  userId: string
  phoneNumber: string
  direction: "inbound" | "outbound"
  userContext?: {
    name?: string
    phone?: string
    previousInteractions?: string[]
  }
}

export type AICallResponse = {
  callId: string
  sessionId: string
  aiGreeting?: string
  contextLoaded: boolean
}

export async function startAICall(
  params: StartAICallParams,
): Promise<AICallResponse> {
  // Real API'ga ulanadi (production'da avtomatik)
  if (isRealAPIEnabled) {
    try {
      return await apiRequest<AICallResponse>("/ai/call/start", {
        method: "POST",
        body: JSON.stringify(params),
      })
    } catch (error) {
      console.error("Start AI call error:", error)
      throw error
    }
  }

  // Mock mode
  await latency(600)

  const greeting = params.userContext?.name
    ? `Assalomu alaykum, ${params.userContext.name}! Yana siz bilan gaplashishdan xursandman.`
    : "Assalomu alaykum! AI yordamchi bilan gaplashyapsiz."

  return {
    callId: `call_${Date.now()}`,
    sessionId: `session_${Date.now()}`,
    aiGreeting: greeting,
    contextLoaded: Boolean(params.userContext?.name),
  }
}

export type SendCallTranscriptParams = {
  callId: string
  sessionId: string
  transcript: string
  audioChunk?: Blob
}

export type AICallTranscriptResponse = {
  aiResponse?: string
  suggestedActions?: string[]
  shouldTransfer?: boolean
  sentiment?: "positive" | "neutral" | "negative"
}

export async function sendCallTranscript(
  _params: SendCallTranscriptParams,
): Promise<AICallTranscriptResponse> {
  // Backend tayyor bo'lganda:
  // const formData = new FormData()
  // formData.append("transcript", params.transcript)
  // if (params.audioChunk) formData.append("audio", params.audioChunk)
  // return apiRequest<AICallTranscriptResponse>(`/ai/call/${params.callId}/transcript`, {
  //   method: "POST",
  //   body: formData,
  // })

  await latency(500)
  return {
    aiResponse: "Tushunarli. Davom etamizmi?",
    sentiment: "neutral",
  }
}

// WebSocket for real-time AI chat
export function createAIChatWebSocket(chatId: string): WebSocket {
  const ws = new WebSocket(`${API_BASE_URL.replace(/^http/, "ws")}/ai/chat/${chatId}/stream`)
  return ws
}

