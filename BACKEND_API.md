# Backend API Integratsiya Qo'llanmasi

Bu dokumentatsiya backend developer uchun frontend bilan integratsiya qilish uchun kerakli barcha ma'lumotlarni o'z ichiga oladi.

## Base URL

Production: `https://api.call-center.uzbek-talim.uz/api`  
Development: `http://localhost:8000/api`

Frontend environment variable orqali sozlanadi: `VITE_API_BASE_URL`

---

## 1. Authentication API

### POST /api/auth/login

Operator login qilish uchun.

**Request:**
```json
{
  "email": "operator@demo.uz",
  "password": "password",
  "remember": true
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "u_demo_operator",
    "name": "Demo Operator",
    "email": "operator@demo.uz",
    "role": "operator" // "admin" | "operator" | "supervisor"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Error (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

**Frontend fayl:** `src/stores/authStore.ts` - `login()` funksiyasini yangilang.

---

## 2. Dashboard API

### GET /api/dashboard/summary

Dashboard uchun umumiy statistika.

**Response (200 OK):**
```json
{
  "callsToday": 45,
  "activeChats": 12,
  "avgResponseSec": 3.2,
  "aiSuccessRate": 0.87,
  "recentChats": [
    {
      "id": "chat_001",
      "userId": "u_1001",
      "status": "open",
      "createdAt": "2026-01-21T10:30:00Z",
      "updatedAt": "2026-01-21T11:15:00Z",
      "topic": "Ta'lim haqida savol",
      "tags": ["education", "question"],
      "sentiment": "positive",
      "aiSummary": "Foydalanuvchi ta'lim dasturlari haqida ma'lumot so'radi...",
      "messages": []
    }
  ],
  "recentCalls": [
    {
      "id": "call_001",
      "userId": "u_1001",
      "direction": "inbound",
      "status": "completed",
      "startedAt": "2026-01-21T10:00:00Z",
      "endedAt": "2026-01-21T10:05:30Z",
      "durationSec": 330,
      "sentiment": "positive",
      "aiSummary": "Qo'ng'iroq muvaffaqiyatli yakunlandi...",
      "tags": []
    }
  ]
}
```

**Frontend fayl:** `src/services/api.ts` - `getDashboardSummary()` funksiyasini yangilang.

---

## 3. Chats API

### GET /api/chats

Chatlar ro'yxatini olish (pagination, filter, search).

**Query Parameters:**
- `query` (string, optional) - Qidiruv so'zi
- `status` (string, optional) - "open" | "resolved" | "escalated" | "all"
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response (200 OK):**
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 150,
  "items": [
    {
      "id": "chat_001",
      "userId": "u_1001",
      "status": "open",
      "createdAt": "2026-01-21T10:30:00Z",
      "updatedAt": "2026-01-21T11:15:00Z",
      "topic": "Ta'lim haqida savol",
      "tags": ["education"],
      "sentiment": "positive",
      "aiSummary": "Foydalanuvchi ta'lim dasturlari haqida ma'lumot so'radi.",
      "messages": []
    }
  ]
}
```

### GET /api/chats/:chatId

Bitta chat'ning to'liq ma'lumotlari.

**Response (200 OK):**
```json
{
  "id": "chat_001",
  "userId": "u_1001",
  "status": "open",
  "createdAt": "2026-01-21T10:30:00Z",
  "updatedAt": "2026-01-21T11:15:00Z",
  "topic": "Ta'lim haqida savol",
  "tags": ["education"],
  "sentiment": "positive",
  "aiSummary": "Foydalanuvchi ta'lim dasturlari haqida ma'lumot so'radi.",
  "messages": [
    {
      "id": "msg_001",
      "role": "user",
      "text": "Salom, men ta'lim dasturlari haqida ma'lumot olishni xohlayman.",
      "timestamp": "2026-01-21T10:30:00Z"
    },
    {
      "id": "msg_002",
      "role": "ai",
      "text": "Assalomu alaykum! Qaysi ta'lim dasturi haqida ma'lumot kerak?",
      "timestamp": "2026-01-21T10:30:05Z"
    }
  ]
}
```

**Frontend fayl:** `src/services/api.ts` - `listChats()`, `getChatById()` funksiyalarini yangilang.

---

## 4. AI Chat API

### POST /api/ai/chat

AI'ga chat message yuborish va javob olish.

**Request:**
```json
{
  "chatId": "chat_001", // optional, yangi chat bo'lsa yuborilmaydi
  "userId": "u_1001",
  "message": "Mening ismim Moychechak",
  "userContext": {
    "name": "Moychechak", // optional, oldingi kontekstdan
    "phone": "+998901112233",
    "language": "uz"
  }
}
```

**Response (200 OK):**
```json
{
  "messageId": "msg_123456",
  "chatId": "chat_001",
  "response": "Tushunarli! Sizning ismingiz Moychechak. Yaxshi, Moychechak, sizga qanday yordam bera olaman?",
  "contextUpdated": true, // AI foydalanuvchi ismini eslab qoldimi?
  "suggestedActions": [
    "Foydalanuvchiga ta'lim dasturlari haqida ma'lumot berish",
    "Qo'ng'iroq qilish taklif qilish"
  ]
}
```

**Muhim:** 
- Agar foydalanuvchi "Mening ismim X" deb yozsa, `contextUpdated: true` qaytarilishi kerak
- Keyingi chat'larda AI foydalanuvchi ismini eslab qolishi kerak
- `userContext` har safar yuboriladi, backend uni saqlab qolishi kerak

**Frontend fayl:** `src/services/api.ts` - `sendChatMessage()` funksiyasini yangilang.

---

## 5. Calls API

### GET /api/calls

Qo'ng'iroqlar ro'yxati.

**Query Parameters:**
- `query` (string, optional)
- `status` (string, optional) - "completed" | "missed" | "failed" | "all"
- `page` (number, default: 1)
- `pageSize` (number, default: 20)

**Response (200 OK):**
```json
{
  "page": 1,
  "pageSize": 20,
  "total": 89,
  "items": [
    {
      "id": "call_001",
      "userId": "u_1001",
      "direction": "inbound",
      "status": "completed",
      "startedAt": "2026-01-21T10:00:00Z",
      "endedAt": "2026-01-21T10:05:30Z",
      "durationSec": 330,
      "operatorName": "Demo Operator",
      "recordingUrl": "https://recordings.example.com/call_001.mp3",
      "transcript": "Operator: Salom...\nUser: Salom...",
      "aiSummary": "Qo'ng'iroq muvaffaqiyatli yakunlandi...",
      "sentiment": "positive",
      "tags": ["education", "question"]
    }
  ]
}
```

### GET /api/calls/:callId

Bitta call'ning to'liq ma'lumotlari.

**Response (200 OK):** Yuqoridagi kabi, lekin bitta call object.

**Frontend fayl:** `src/services/api.ts` - `listCalls()`, `getCallById()` funksiyalarini yangilang.

---

## 6. AI Call API

### POST /api/ai/call/start

AI call boshlash (Twilio call boshlanganda).

**Request:**
```json
{
  "userId": "u_1001",
  "phoneNumber": "+998901112233",
  "direction": "outbound", // "inbound" | "outbound"
  "userContext": {
    "name": "Moychechak", // optional, oldingi kontekstdan
    "phone": "+998901112233",
    "previousInteractions": [
      "Ta'lim dasturlari haqida savol berdi",
      "Qo'ng'iroq qilishni so'radi"
    ]
  }
}
```

**Response (200 OK):**
```json
{
  "callId": "call_123456",
  "sessionId": "session_789012",
  "aiGreeting": "Assalomu alaykum, Moychechak! Yana siz bilan gaplashishdan xursandman.",
  "contextLoaded": true
}
```

**Frontend fayl:** `src/services/api.ts` - `startAICall()` funksiyasini yangilang.

### POST /api/ai/call/:callId/transcript

Real-time call transcript yuborish va AI javobini olish.

**Request:**
```json
{
  "sessionId": "session_789012",
  "transcript": "Operator: Salom, qanday yordam bera olaman?\nUser: Men ta'lim dasturlari haqida ma'lumot olishni xohlayman.",
  "audioChunk": "<base64 encoded audio>" // optional
}
```

**Response (200 OK):**
```json
{
  "aiResponse": "Tushunarli. Qaysi ta'lim dasturi haqida ma'lumot kerak?",
  "suggestedActions": [
    "Ta'lim dasturlari ro'yxatini ko'rsatish",
    "Qo'shimcha ma'lumot berish"
  ],
  "shouldTransfer": false, // operatorga o'tkazish kerakmi?
  "sentiment": "positive" // "positive" | "neutral" | "negative"
}
```

**Frontend fayl:** `src/services/api.ts` - `sendCallTranscript()` funksiyasini yangilang.

---

## 7. Users API

### GET /api/users

Barcha foydalanuvchilar ro'yxati.

**Response (200 OK):**
```json
[
  {
    "id": "u_1001",
    "fullName": "Moychechak Toshmatov",
    "phone": "+998901112233",
    "email": "moychechak@example.uz",
    "region": "Toshkent",
    "language": "uz",
    "createdAt": "2026-01-15T08:00:00Z"
  }
]
```

### GET /api/users/:userId

Bitta foydalanuvchi ma'lumotlari.

**Response (200 OK):** Yuqoridagi kabi, lekin bitta user object.

**Frontend fayl:** `src/services/api.ts` - `listUsers()`, `getUserById()` funksiyalarini yangilang.

---

## 8. Analytics API

### GET /api/analytics

Analitika ma'lumotlari.

**Query Parameters:**
- `range` (string, optional) - "24h" | "7d" | "30d" (default: "7d")

**Response (200 OK):**
```json
{
  "range": "7d",
  "callsTotal": 450,
  "callsAnswered": 420,
  "callsMissed": 30,
  "chatsTotal": 320,
  "chatsResolved": 290,
  "avgResponseSec": 3.2,
  "avgHandleTimeSec": 285,
  "aiSuccessRate": 0.87,
  "topTopics": [
    { "topic": "Ta'lim dasturlari", "count": 120 },
    { "topic": "Grantlar", "count": 85 },
    { "topic": "Imtihonlar", "count": 65 }
  ],
  "callsSeries": [
    { "t": "2026-01-15T00:00:00Z", "value": 45 },
    { "t": "2026-01-16T00:00:00Z", "value": 52 }
  ],
  "chatsSeries": [
    { "t": "2026-01-15T00:00:00Z", "value": 38 },
    { "t": "2026-01-16T00:00:00Z", "value": 42 }
  ]
}
```

**Frontend fayl:** `src/services/api.ts` - `getAnalytics()` funksiyasini yangilang.

---

## 9. User Context API (Ixtiyoriy)

### GET /api/users/:userId/context

Foydalanuvchi kontekstini olish (AI eslab qolgan ma'lumotlar).

**Response (200 OK):**
```json
{
  "userId": "u_1001",
  "aiContext": {
    "knownName": "Moychechak",
    "personalityNotes": [
      "Ta'lim dasturlari haqida qiziqadi",
      "Qo'ng'iroq qilishni afzal ko'radi"
    ],
    "conversationHistory": [
      "Ta'lim dasturlari haqida savol berdi (2026-01-20)",
      "Grantlar haqida ma'lumot so'radi (2026-01-21)"
    ]
  }
}
```

### PUT /api/users/:userId/context

Foydalanuvchi kontekstini yangilash.

**Request:**
```json
{
  "aiContext": {
    "knownName": "Moychechak",
    "personalityNotes": ["Yangi note"],
    "conversationHistory": ["Yangi conversation"]
  }
}
```

**Frontend fayl:** `src/stores/userContextStore.ts` - Backend bilan sync qilish uchun.

---

## 10. Twilio Token API

### GET /api/twilio/token

Twilio Voice SDK uchun access token olish.

**Headers:**
```
Authorization: Bearer <operator_token>
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 3600
}
```

**Frontend fayl:** `src/pages/Settings.tsx` - Token'ni avtomatik olish uchun.

---

## Error Handling

Barcha API'lar quyidagi formatda error qaytaradi:

**4xx/5xx Response:**
```json
{
  "error": "Error message",
  "code": "ERROR_CODE", // optional
  "details": {} // optional
}
```

**Frontend:** `src/services/api.ts` - `apiRequest()` funksiyasi error'larni handle qiladi.

---

## WebSocket (Ixtiyoriy)

Real-time chat updates uchun WebSocket.

### WS /api/ai/chat/:chatId/stream

**Connection:**
```javascript
const ws = new WebSocket('wss://api.call-center.uzbek-talim.uz/api/ai/chat/chat_001/stream')
```

**Messages:**
- Client → Server: `{ type: "message", text: "..." }`
- Server → Client: `{ type: "ai_response", text: "...", messageId: "..." }`

**Frontend fayl:** `src/services/api.ts` - `createAIChatWebSocket()` funksiyasi.

---

## Testing

Backend API'ni test qilish uchun:

1. **Postman Collection:** `postman_collection.json` (keyinroq qo'shiladi)
2. **Mock Data:** Frontend hozircha mock data ishlatmoqda
3. **Environment:** `.env` faylida `VITE_API_BASE_URL` ni backend URL'ga o'zgartiring

---

## Qo'shimcha Ma'lumotlar

- **Frontend kod:** `src/services/api.ts` - Barcha API funksiyalari
- **Type definitions:** `src/types/models.ts` - TypeScript type'lar
- **State management:** `src/stores/` - Zustand store'lar
- **Environment:** `.env` faylida `VITE_API_BASE_URL` ni sozlang

---

## Muhim Eslatmalar

1. **CORS:** Backend CORS'ni frontend domain'iga ruxsat berishi kerak
2. **Authentication:** JWT token `Authorization: Bearer <token>` header'da yuboriladi
3. **Rate Limiting:** Backend rate limiting qo'yishi tavsiya etiladi
4. **Error Handling:** Barcha error'lar frontend'da handle qilinadi
5. **User Context:** AI foydalanuvchi ismini va ma'lumotlarini eslab qolishi kerak

---

## Aloqa

Savollar bo'lsa, backend developer bilan bog'laning yoki GitHub issue oching.
