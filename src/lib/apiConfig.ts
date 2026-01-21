// Backend API base URL
// Production'da environment variable orqali o'rnatiladi
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api"

export const WS_BASE_URL =
  import.meta.env.VITE_WS_BASE_URL || API_BASE_URL.replace(/^http/, "ws")

// Real API mavjudligini tekshirish (production'da avtomatik real API'ga ulanadi)
export const USE_REAL_API = import.meta.env.PROD && 
  (import.meta.env.VITE_API_BASE_URL?.startsWith("https://") || 
   import.meta.env.VITE_API_BASE_URL?.startsWith("http://api.") ||
   import.meta.env.VITE_API_BASE_URL?.includes("call-center.uzbek-talim.uz"))

// Development'da ham real API'ni test qilish uchun
export const FORCE_REAL_API = import.meta.env.VITE_FORCE_REAL_API === "true"
