export type ID = string

export type ISODateTime = string

export type UserRole = "admin" | "operator" | "supervisor"

export type User = {
  id: ID
  fullName: string
  phone: string
  email?: string
  region?: string
  language?: "uz" | "ru" | "en"
  createdAt: ISODateTime
}

export type Sentiment = "positive" | "neutral" | "negative"

export type ChatStatus = "open" | "resolved" | "escalated"

export type ChatMessage = {
  id: ID
  role: "user" | "ai" | "system"
  text: string
  timestamp: ISODateTime
}

export type Chat = {
  id: ID
  userId: ID
  status: ChatStatus
  createdAt: ISODateTime
  updatedAt: ISODateTime
  topic: string
  tags: string[]
  sentiment: Sentiment
  aiSummary: string
  messages: ChatMessage[]
}

export type CallDirection = "inbound" | "outbound"

export type CallStatus = "completed" | "missed" | "failed"

export type Call = {
  id: ID
  userId: ID
  direction: CallDirection
  status: CallStatus
  startedAt: ISODateTime
  endedAt?: ISODateTime
  durationSec?: number
  operatorName?: string
  recordingUrl?: string | null
  transcript?: string
  aiSummary: string
  sentiment: Sentiment
  tags: string[]
}

export type MetricPoint = {
  t: ISODateTime
  value: number
}

export type AnalyticsSnapshot = {
  range: "24h" | "7d" | "30d"
  callsTotal: number
  callsAnswered: number
  callsMissed: number
  chatsTotal: number
  chatsResolved: number
  avgResponseSec: number
  avgHandleTimeSec: number
  aiSuccessRate: number // 0..1
  topTopics: Array<{ topic: string; count: number }>
  callsSeries: MetricPoint[]
  chatsSeries: MetricPoint[]
}

export type DashboardSummary = {
  callsToday: number
  activeChats: number
  avgResponseSec: number
  aiSuccessRate: number // 0..1
  recentChats: Chat[]
  recentCalls: Call[]
}

