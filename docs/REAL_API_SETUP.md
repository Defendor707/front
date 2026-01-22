# Real API'ga Avtomatik Ulanish Qo'llanmasi

## Qanday Ishlaydi?

Frontend **avtomatik** real API'ga ulanadi agar:
1. **Production build** bo'lsa (`npm run build`)
2. **Environment variable** sozlangan bo'lsa: `VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api`

Agar real API mavjud bo'lsa:
- ✅ **Demo ma'lumotlar o'chiriladi** - barcha API chaqiruvlari real backend'ga ketadi
- ✅ **"Demo" badge'lar ko'rinmaydi** - UI'da real ma'lumotlar ko'rsatiladi
- ✅ **Mock data ishlatilmaydi** - faqat real API javoblari ko'rsatiladi

Agar real API mavjud bo'lmasa yoki xatolik bo'lsa:
- ⚠️ **Fallback to mock** - avtomatik mock data'ga qaytadi
- ⚠️ **"Demo" badge ko'rinadi** - foydalanuvchiga demo mode ekanligi ko'rsatiladi

## Production Deployment

### 1. Environment Variables

`.env.production` fayl yarating:

```env
VITE_API_BASE_URL=https://api.uzcall.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.uzcall.uzbek-talim.uz/api
```

### 2. Build va Deploy

```bash
# Build (real API'ga avtomatik ulanadi)
npm run build

# Yoki Docker orqali
./scripts/deploy.sh production
```

### 3. Tekshirish

1. **Browser Console'da tekshiring:**
   - Agar real API ishlayotgan bo'lsa: `Failed to fetch...` xatoliklari bo'lmaydi
   - Network tab'da real API so'rovlarini ko'rasiz

2. **UI'da tekshiring:**
   - "Demo" badge ko'rinmaydi → Real API ishlayapti ✅
   - "Demo" badge ko'rinadi → Mock data ishlatilmoqda ⚠️

## Development'da Test Qilish

Development'da ham real API'ni test qilish uchun:

```env
# .env fayl
VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api
VITE_FORCE_REAL_API=true
```

Keyin:
```bash
npm run dev
```

## API Endpoint'lar

Frontend quyidagi endpoint'larni chaqiradi:

- `POST /api/auth/login` - Login
- `GET /api/dashboard/summary` - Dashboard
- `GET /api/chats` - Chatlar ro'yxati
- `GET /api/chats/:id` - Bitta chat
- `POST /api/ai/chat` - AI chat message
- `GET /api/calls` - Qo'ng'iroqlar ro'yxati
- `GET /api/calls/:id` - Bitta call
- `POST /api/ai/call/start` - AI call boshlash
- `GET /api/users` - Foydalanuvchilar
- `GET /api/analytics?range=7d` - Analitika

Batafsil: `BACKEND_API.md`

## Xatoliklar

### API xatolik bo'lsa

Frontend avtomatik mock data'ga qaytadi va console'da xatolik ko'rsatiladi:

```
Failed to fetch dashboard from API, falling back to mock: Error: ...
```

### API mavjud emas

Agar backend hali tayyor bo'lmasa:
- Frontend mock data ishlatadi
- "Demo" badge ko'rinadi
- Hech qanday muammo bo'lmaydi

## Qo'shimcha

- **Backend API dokumentatsiya:** `BACKEND_API.md`
- **Deployment qo'llanmasi:** `DEPLOYMENT.md`
- **Qisqa qo'llanma:** `API_INTEGRATION_GUIDE.md`
