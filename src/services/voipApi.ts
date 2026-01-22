// VoIP API integratsiyasi (integ.md asosida)
import { API_BASE_URL } from "@/lib/apiConfig"

export interface TTSConfig {
  type: "TTS_CONFIG"
  model: string
  targetNumber: string
  clientUUID?: string
  authToken: string
  prompt: string
  noise: number
  noiseGain: number
  speed: number
}

export interface Call {
  number: string
  status: "processing" | "completed"
  summary: string
  chatHistory: string
  duration: number
  topic: string
  createdAt: string
}

export interface QA {
  id: number
  title: string
  answer: string
  createdAt: string
  updatedAt: string
}

export interface Topic {
  id: number
  name: string
}

export interface Statistics {
  totalCalls: number
  averageDuration: number
  dailyCalls: Array<{ date: string; count: number }>
  monthlyCalls: Array<{ month: string; count: number }>
  topicsFrequency: Array<{ topic: string; count: number }>
}

export interface UploadedFile {
  id: string
  name: string
  bytes: number
  created_at: number
}

// Helper function
async function apiRequest<T>(endpoint: string, options?: RequestInit): Promise<T> {
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
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

// VoIP Routes
// Start Call - integ.md'da /api/voip/call ko'rsatilgan
export async function configureTTS(config: TTSConfig) {
  // integ.md'ga muvofiq /voip/call endpoint'iga so'rov yuboramiz
  // Lekin eski /voip/config ham ishlashi mumkin, shuning uchun ikkalasini ham qo'llab-quvvatlaymiz
  try {
    return await apiRequest<{ message: string }>("/voip/call", {
      method: "POST",
      body: JSON.stringify({
        model: config.model,
        targetNumber: config.targetNumber,
        prompt: config.prompt,
        noise: config.noise,
        noiseGain: config.noiseGain,
        speed: config.speed,
      }),
    })
  } catch (error) {
    // Fallback to old endpoint if new one doesn't work
    console.warn("Failed to use /voip/call, trying /voip/config:", error)
    return apiRequest<{ message: string }>("/voip/config", {
      method: "POST",
      body: JSON.stringify(config),
    })
  }
}

export async function uploadFile(file: File) {
  const formData = new FormData()
  formData.append("file", file)

  const token = typeof window !== "undefined" 
    ? localStorage.getItem("ai_call_center.token") 
    : null

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/voip/file`, {
    method: "POST",
    headers,
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }))
    throw new Error(error.error || `HTTP ${response.status}`)
  }

  return response.json()
}

export async function getAllFiles(): Promise<UploadedFile[]> {
  return apiRequest<UploadedFile[]>("/voip/file")
}

export async function getFileById(fileId: string): Promise<Blob> {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("ai_call_center.token") 
    : null

  const headers: Record<string, string> = {}
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE_URL}/voip/file/${fileId}`, {
    headers,
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch file: ${response.statusText}`)
  }

  return response.blob()
}

export async function deleteFile(fileId: string) {
  return apiRequest<{ message: string }>(`/voip/file/${fileId}`, {
    method: "DELETE",
  })
}

export async function deleteCallHistory(targetNumber: string) {
  return apiRequest<{ message: string }>(`/voip/history/${targetNumber}`, {
    method: "DELETE",
  })
}

// Call Routes
export async function getAllCalls(params?: {
  number?: string
  status?: "processing" | "completed"
}): Promise<Call[]> {
  const queryParams = new URLSearchParams()
  if (params?.number) queryParams.append("number", params.number)
  if (params?.status) queryParams.append("status", params.status)

  const query = queryParams.toString()
  return apiRequest<Call[]>(`/voip/calls${query ? `?${query}` : ""}`)
}

// QA Routes
export async function createQA(title: string, answer: string): Promise<QA> {
  return apiRequest<QA>("/qa", {
    method: "POST",
    body: JSON.stringify({ title, answer }),
  })
}

export async function getAllQAs(search?: string): Promise<QA[]> {
  const query = search ? `?search=${encodeURIComponent(search)}` : ""
  return apiRequest<QA[]>(`/qa${query}`)
}

export async function getQAById(id: number): Promise<QA> {
  return apiRequest<QA>(`/qa/${id}`)
}

export async function updateQA(id: number, data: { title?: string; answer?: string }): Promise<QA> {
  return apiRequest<QA>(`/qa/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  })
}

export async function deleteQA(id: number) {
  return apiRequest<{ message: string }>(`/qa/${id}`, {
    method: "DELETE",
  })
}

// Topic Routes
export async function createTopic(name: string): Promise<Topic> {
  return apiRequest<Topic>("/topics", {
    method: "POST",
    body: JSON.stringify({ name }),
  })
}

export async function getAllTopics(): Promise<Topic[]> {
  return apiRequest<Topic[]>("/topics")
}

export async function getTopicById(id: number): Promise<Topic> {
  return apiRequest<Topic>(`/topics/${id}`)
}

export async function deleteTopic(id: number) {
  return apiRequest<{ message: string }>(`/topics/${id}`, {
    method: "DELETE",
  })
}

// Statistics Routes
export async function getStatistics(params?: {
  days?: number
  months?: number
}): Promise<Statistics> {
  const queryParams = new URLSearchParams()
  if (params?.days) queryParams.append("days", String(params.days))
  if (params?.months) queryParams.append("months", String(params.months))

  const query = queryParams.toString()
  return apiRequest<Statistics>(`/statistics${query ? `?${query}` : ""}`)
}
