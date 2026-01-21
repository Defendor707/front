# Backend API Integratsiya Qo'llanmasi (Qisqa)

Bu qo'llanma backend developer uchun frontend bilan integratsiya qilish uchun asosiy ma'lumotlarni o'z ichiga oladi.

## Tezkor Boshlash

1. **Backend API Base URL sozlash:**
   - `.env.production` fayl yarating
   - `VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api` qo'shing

2. **API funksiyalarini real backend'ga ulash:**
   - `src/services/api.ts` faylini oching
   - Har bir funksiyada comment qilingan `apiRequest()` kodini oching
   - Mock kodni o'chiring yoki comment qiling

## Asosiy API Endpoint'lar

### 1. Authentication
- `POST /api/auth/login` - Operator login

### 2. Dashboard
- `GET /api/dashboard/summary` - Dashboard statistika

### 3. Chats
- `GET /api/chats` - Chatlar ro'yxati (pagination, filter, search)
- `GET /api/chats/:chatId` - Bitta chat ma'lumotlari
- `POST /api/ai/chat` - AI'ga message yuborish ⭐ **MUHIM**

### 4. Calls
- `GET /api/calls` - Qo'ng'iroqlar ro'yxati
- `GET /api/calls/:callId` - Bitta call ma'lumotlari
- `POST /api/ai/call/start` - AI call boshlash ⭐ **MUHIM**
- `POST /api/ai/call/:callId/transcript` - Call transcript yuborish ⭐ **MUHIM**

### 5. Analytics
- `GET /api/analytics?range=7d` - Analitika ma'lumotlari

### 6. Users
- `GET /api/users` - Foydalanuvchilar ro'yxati
- `GET /api/users/:userId` - Bitta foydalanuvchi

## ⭐ Muhim: AI Integratsiya

### User Context (Foydalanuvchi ismini eslab qolish)

**Frontend qanday ishlaydi:**
1. Foydalanuvchi chat'da yozadi: "Mening ismim Moychechak"
2. Frontend `POST /api/ai/chat` ga so'rov yuboradi:
   ```json
   {
     "userId": "u_1001",
     "message": "Mening ismim Moychechak",
     "userContext": { "phone": "+998901112233" }
   }
   ```
3. Backend javob qaytaradi:
   ```json
   {
     "response": "Tushunarli! Sizning ismingiz Moychechak...",
     "contextUpdated": true
   }
   ```
4. Keyingi safar foydalanuvchi "Salom" deb yozganda, frontend yana so'rov yuboradi:
   ```json
   {
     "userId": "u_1001",
     "message": "Salom",
     "userContext": { "name": "Moychechak", "phone": "+998901112233" }
   }
   ```
5. Backend javob qaytaradi:
   ```json
   {
     "response": "Assalomu alaykum, Moychechak! Yana siz bilan gaplashishdan xursandman."
   }
   ```

**Backend'da qilish kerak:**
- `userContext.name` ni database'da saqlash
- Keyingi so'rovlarda `userContext.name` ni o'qib, AI'ga context sifatida yuborish
- `contextUpdated: true` qaytarish agar ism yangi aniqlangan bo'lsa

## Kod O'zgartirish

### 1. `src/services/api.ts` - `sendChatMessage()`

**Hozirgi (Mock):**
```typescript
export async function sendChatMessage(params) {
  // Mock code...
}
```

**Backend'ga ulash:**
```typescript
export async function sendChatMessage(params) {
  return await apiRequest<ChatMessageResponse>("/ai/chat", {
    method: "POST",
    body: JSON.stringify(params),
  })
}
```

### 2. Boshqa funksiyalar

Xuddi shu tarzda:
- `getDashboardSummary()` → `GET /api/dashboard/summary`
- `listChats()` → `GET /api/chats`
- `getChatById()` → `GET /api/chats/:chatId`
- `listCalls()` → `GET /api/calls`
- `startAICall()` → `POST /api/ai/call/start`
- `sendCallTranscript()` → `POST /api/ai/call/:callId/transcript`
- `getAnalytics()` → `GET /api/analytics`

## To'liq Dokumentatsiya

Batafsil ma'lumot uchun `BACKEND_API.md` faylini ko'ring.

## Test Qilish

1. Backend'ni ishga tushiring
2. `.env.production` faylida `VITE_API_BASE_URL` ni backend URL'ga o'zgartiring
3. `npm run build` qiling
4. Frontend'ni ochib, API chaqiruvlarini tekshiring

## Xatoliklar

Agar API xatolik bo'lsa:
- Browser Console'da error'lar ko'rinadi
- Network tab'da API so'rovlarini ko'rish mumkin
- `src/services/api.ts` faylida `apiRequest()` funksiyasida error handling bor
