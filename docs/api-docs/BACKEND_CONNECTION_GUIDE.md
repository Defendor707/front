# Backend API Ulanishi Qo'llanmasi

## ✅ integ.md'da Mavjud Ma'lumotlar

### 1. Base URL
- ✅ **Base URL**: `http://localhost:3001/api`
- ✅ Barcha endpoint'lar aniq ko'rsatilgan

### 2. API Endpoint'lar
- ✅ **VoIP Routes** (`/api/voip`)
  - POST `/api/voip/call` - Qo'ng'iroq boshlash
  - POST `/api/voip/file` - Fayl yuklash
  - GET `/api/voip/file` - Barcha fayllar
  - GET `/api/voip/file/:fileId` - Fayl olish
  - DELETE `/api/voip/file/:fileId` - Fayl o'chirish
  - DELETE `/api/voip/history/:targetNumber` - Qo'ng'iroq tarixini o'chirish

- ✅ **Call Routes** (`/api/voip/calls`)
  - GET `/api/voip/calls` - Barcha qo'ng'iroqlar (filter bilan)

- ✅ **QA Routes** (`/api/qa`)
  - POST `/api/qa` - QA yaratish
  - GET `/api/qa` - Barcha QA'lar
  - GET `/api/qa/:id` - QA olish
  - PUT `/api/qa/:id` - QA yangilash
  - DELETE `/api/qa/:id` - QA o'chirish

- ✅ **Topic Routes** (`/api/topics`)
  - POST `/api/topics` - Topic yaratish
  - GET `/api/topics` - Barcha topic'lar
  - GET `/api/topics/:id` - Topic olish
  - DELETE `/api/topics/:id` - Topic o'chirish

- ✅ **Statistics Routes** (`/api/statistics`)
  - GET `/api/statistics` - Statistika (days, months parametrlar bilan)

### 3. Request/Response Format'lari
- ✅ Barcha endpoint'lar uchun request body format'lari
- ✅ Response format'lari va misollar
- ✅ Status code'lar (200, 400, 401, 404, 409, 500)

### 4. Error Handling
- ✅ Error response format'i ko'rsatilgan
- ✅ Umumiy status code'lar tushuntirilgan

### 5. Qo'shimcha Ma'lumotlar
- ✅ Phone number format'i (+998901234567)
- ✅ Date format'i (ISO 8601 UTC)
- ✅ Duration (seconds)

---

## ❌ integ.md'da Yo'q Ma'lumotlar

### 1. Authentication/Authorization
- ❌ **Login endpoint yo'q** - Token qanday olinishi ko'rsatilmagan
- ❌ **Token format'i** - JWT yoki boshqa format?
- ❌ **Token validation** - Qanday tekshiriladi?
- ⚠️ **Eslatma**: integ.md'da "Some endpoints require `authToken`" deyilgan, lekin qaysi endpoint'lar va qanday format'da ko'rsatilmagan

### 2. CORS (Cross-Origin Resource Sharing)
- ❌ CORS sozlamalari ko'rsatilmagan
- ❌ Qaysi origin'lar ruxsat etilgan?

### 3. Rate Limiting
- ❌ Rate limit'lar ko'rsatilmagan
- ❌ Qancha so'rov yuborish mumkin?

### 4. WebSocket
- ❌ WebSocket endpoint'i yo'q
- ❌ Real-time ma'lumotlar uchun WebSocket kerak bo'lishi mumkin

### 5. File Upload Limits
- ❌ Fayl hajmi limit'i ko'rsatilmagan
- ❌ Qanday format'lar qabul qilinadi?

---

## 🔧 Frontend'da Qo'llanilgan Authentication

Frontend kodida quyidagilar ishlatilgan:

### Token Storage
```typescript
// Token localStorage'da saqlanadi
localStorage.getItem("ai_call_center.token")
```

### Authorization Header
```typescript
// Barcha API so'rovlarida Bearer token qo'shiladi
headers.Authorization = `Bearer ${token}`
```

### Token Olish (Hozircha yo'q)
Frontend'da login endpoint'i hali integratsiya qilinmagan. Agar backend'da login endpoint'i bo'lsa, quyidagicha qo'shish kerak:

```typescript
// src/stores/authStore.ts
async function login(email: string, password: string) {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  })
  
  const data = await response.json()
  localStorage.setItem("ai_call_center.token", data.token)
  return data
}
```

---

## 📝 Backend Developer'ga Savollar

Agar backend API'ni to'liq ulash uchun quyidagi ma'lumotlar kerak:

1. **Authentication:**
   - Login endpoint'i bormi? (`POST /api/auth/login`)
   - Token qanday format'da? (JWT, Bearer token, etc.)
   - Token qancha vaqt davomida amal qiladi?
   - Refresh token bormi?

2. **CORS:**
   - Qaysi origin'lar ruxsat etilgan?
   - Development va production uchun alohida sozlamalar bormi?

3. **Rate Limiting:**
   - Qancha so'rov yuborish mumkin?
   - Qaysi endpoint'lar limit'ga ega?

4. **File Upload:**
   - Maksimal fayl hajmi?
   - Qanday format'lar qabul qilinadi?

5. **WebSocket:**
   - Real-time ma'lumotlar uchun WebSocket endpoint'i bormi?
   - Qanday ulanish kerak?

---

## 🚀 Hozirgi Holat

### Frontend'da Qo'llanilgan
- ✅ Barcha API endpoint'lar integratsiya qilingan
- ✅ Token localStorage'da saqlanadi
- ✅ Authorization header avtomatik qo'shiladi
- ✅ Error handling qo'llanilgan

### Yetishmayotgan
- ❌ Login endpoint'i integratsiya qilinmagan
- ❌ Token refresh mexanizmi yo'q
- ❌ CORS sozlamalari noma'lum

---

## 💡 Tavsiyalar

1. **Backend developer bilan bog'laning** va quyidagilarni so'rang:
   - Authentication endpoint'i
   - Token format'i va validation
   - CORS sozlamalari

2. **Test qiling:**
   ```bash
   # Backend API'ni ishga tushiring
   # Keyin frontend'da test qiling:
   export VITE_API_BASE_URL=http://localhost:3001/api
   export VITE_FORCE_REAL_API=true
   npm run dev
   ```

3. **Browser Console'da tekshiring:**
   - Network tab'da API so'rovlarini ko'ring
   - CORS xatoliklari bormi?
   - 401 Unauthorized xatoliklari bormi?
