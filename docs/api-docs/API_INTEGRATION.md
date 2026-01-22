# API Integratsiya Qo'llanmasi

## ✅ Barcha API'lar integratsiya qilindi!

### 📋 Integratsiya qilingan API'lar:

1. **VoIP Routes** (`/api/voip`)
   - ✅ `configureTTS()` - TTS sozlash va qo'ng'iroq boshlash
   - ✅ `uploadFile()` - Fayl yuklash
   - ✅ `getAllFiles()` - Barcha fayllar
   - ✅ `getFileById()` - Fayl olish
   - ✅ `deleteFile()` - Fayl o'chirish
   - ✅ `deleteCallHistory()` - Qo'ng'iroq tarixini o'chirish

2. **Call Routes** (`/api/voip/calls`)
   - ✅ `getAllCalls()` - Barcha qo'ng'iroqlar (filter bilan)
   - ✅ **Calls page'da ishlatiladi**

3. **QA Routes** (`/api/qa`)
   - ✅ `createQA()` - QA yaratish
   - ✅ `getAllQAs()` - Barcha QA'lar
   - ✅ `getQAById()` - QA olish
   - ✅ `updateQA()` - QA yangilash
   - ✅ `deleteQA()` - QA o'chirish
   - ✅ **Settings page'da ishlatiladi**

4. **Topic Routes** (`/api/topics`)
   - ✅ `createTopic()` - Topic yaratish
   - ✅ `getAllTopics()` - Barcha topic'lar
   - ✅ `getTopicById()` - Topic olish
   - ✅ `deleteTopic()` - Topic o'chirish
   - ✅ **Settings page'da ishlatiladi**

5. **Statistics Routes** (`/api/statistics`)
   - ✅ `getStatistics()` - Statistika (days, months parametrlar bilan)
   - ✅ **Analytics page'da ishlatiladi**

## 🚀 Local Development'da Ishlatish

### 1. Development Server Ishga Tushirish

```bash
cd /home/azureuser/frontend
npm run dev
```

Server `http://localhost:5173` da ishga tushadi.

### 2. Real API'ga Ulash

Agar backend API `http://localhost:3001/api` da ishlayotgan bo'lsa:

**Variant 1: Environment variable orqali**
```bash
export VITE_API_BASE_URL=http://localhost:3001/api
export VITE_FORCE_REAL_API=true
npm run dev
```

**Variant 2: .env fayl yaratish**
```bash
# .env.local fayl yarating
echo "VITE_API_BASE_URL=http://localhost:3001/api" > .env.local
echo "VITE_FORCE_REAL_API=true" >> .env.local
npm run dev
```

### 3. Mock Mode (Backend API yo'q bo'lsa)

Agar backend API ishlamayotgan bo'lsa, frontend avtomatik mock data bilan ishlaydi:
- Barcha sahifalar demo ma'lumotlar bilan ishlaydi
- "Demo" badge ko'rinadi
- API chaqiruvlari mock data'ga fallback qiladi

## 📝 Qo'llaniladigan Fayllar

### API Services
- `src/services/voipApi.ts` - Barcha VoIP API funksiyalari
- `src/services/api.ts` - Asosiy API funksiyalari (Calls, Analytics integratsiya qilingan)

### Pages
- `src/pages/Calls.tsx` - VoIP API'dan qo'ng'iroqlarni ko'rsatadi
- `src/pages/Analytics.tsx` - Statistics API'dan statistika ko'rsatadi
- `src/pages/Settings.tsx` - QA va Topic management

### Configuration
- `src/lib/apiConfig.ts` - API base URL va sozlamalar

## 🔧 API Endpoint Mapping

### Calls
- **Frontend:** `listCalls()` → **Backend:** `GET /api/voip/calls`
- Filter: `number`, `status` (processing/completed)

### Analytics
- **Frontend:** `getAnalytics()` → **Backend:** `GET /api/statistics`
- Parameters: `days`, `months`

### QA Management
- **Frontend:** `createQA()`, `getAllQAs()`, `updateQA()`, `deleteQA()`
- **Backend:** `POST /api/qa`, `GET /api/qa`, `PUT /api/qa/:id`, `DELETE /api/qa/:id`

### Topic Management
- **Frontend:** `createTopic()`, `getAllTopics()`, `deleteTopic()`
- **Backend:** `POST /api/topics`, `GET /api/topics`, `DELETE /api/topics/:id`

## 🎯 Keyingi Qadamlar

1. **Backend API'ni ishga tushiring:**
   ```bash
   # Backend server'ni http://localhost:3001/api da ishga tushiring
   ```

2. **Environment variable'larni sozlang:**
   ```bash
   export VITE_API_BASE_URL=http://localhost:3001/api
   export VITE_FORCE_REAL_API=true
   ```

3. **Frontend'ni qayta ishga tushiring:**
   ```bash
   npm run dev
   ```

4. **Test qiling:**
   - Calls page'da qo'ng'iroqlarni ko'ring
   - Analytics page'da statistikani ko'ring
   - Settings page'da QA va Topic'larni boshqaring

## 📌 Eslatmalar

- Agar backend API ishlamayotgan bo'lsa, frontend avtomatik mock mode'ga o'tadi
- Barcha API chaqiruvlari error handling bilan qo'llangan
- Real API ishlayotganda "Demo" badge yo'qoladi
- Settings page'da QA va Topic management faqat real API ishlayotganda ko'rinadi
