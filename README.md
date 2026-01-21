# AI Call Center Frontend

Zamonaviy AI-powered Call Center operator console — Ta'lim vazirligi va boshqa tashkilotlar uchun professional frontend yechimi.

## Xususiyatlar

- 🤖 **AI Chat**: Real-time chat AI yordamchisi bilan (foydalanuvchi konteksti bilan)
- 📞 **Live Calls**: Twilio Voice SDK orqali real-time qo'ng'iroqlar
- 🗣️ **AI Conversation**: Qo'ng'iroq paytida AI konteksti va suggestions
- 👤 **User Context**: AI foydalanuvchi ismini va ma'lumotlarini eslab qoladi
- 📊 **Analytics**: Statistikalar, grafiklar, va hisobotlar
- 🎨 **Modern UI**: Tailwind CSS + shadcn/ui bilan professional dizayn
- 🌓 **Dark Mode**: Light/Dark/System tema

## Texnologiyalar

- React 19 + TypeScript
- Vite (tez build va HMR)
- Tailwind CSS + shadcn/ui
- React Router v6
- TanStack Query (React Query)
- Zustand (state management)
- Twilio Voice SDK
- Recharts (statistikalar)
- Framer Motion (animatsiyalar)

## Quick Start

```bash
npm install
npm run dev
```

### Environment Variables

Create `.env` file:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_WS_BASE_URL=ws://localhost:8000/api
```

### Demo Login

- Email: `operator@demo.uz`
- Password: `password`

### AI Integration

Frontend AI integratsiyasi tayyor. Backend API'ga ulash uchun `src/services/api.ts` faylini yangilang.

#### User Context (Foydalanuvchi ma'lumotlarini eslab qolish)

AI foydalanuvchi ismini va boshqa ma'lumotlarni eslab qoladi:

1. **Chat orqali**: Foydalanuvchi "Mening ismim Moychechak" deb yozsa, AI buni eslab qoladi
2. **Keyingi chat**: "Salom" deb yozganda, AI "Assalomu alaykum, Moychechak!" deb javob beradi
3. **Context saqlash**: `src/stores/userContextStore.ts` orqali localStorage'da saqlanadi

**Backend API endpoint'lar** (backend tayyor bo'lganda):

- `POST /api/ai/chat` - Chat message yuborish va AI javobini olish
  ```json
  {
    "userId": "u_1001",
    "message": "Mening ismim Moychechak",
    "userContext": {
      "name": "Moychechak",
      "phone": "+998901112233",
      "language": "uz"
    }
  }
  ```

- `POST /api/ai/call/{callId}/transcript` - Call transcript yuborish
- `POST /api/ai/call/start` - AI call boshlash
- `GET /api/users/{userId}/context` - Foydalanuvchi kontekstini olish

**Mock mode**: Hozircha mock data ishlatilmoqda. Backend tayyor bo'lganda, `src/services/api.ts` faylida comment qilingan `apiRequest` funksiyasini ishlatib, real API'ga ulash mumkin.

### Twilio Setup

1. Get Twilio access token from your backend
2. Go to Settings → Paste token
3. Go to Live Call → Register device
4. Start making/receiving calls

## Project Structure

```
src/
├── components/     # UI components (shadcn/ui + custom)
├── pages/          # Route pages
├── stores/         # Zustand stores (auth, settings, user context)
├── services/       # API services
├── hooks/          # Custom hooks (Twilio, audio level)
├── lib/            # Utilities
└── types/          # TypeScript types
docs/               # Qo'shimcha qo'llanmalar
```

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # Run ESLint
```

## Production Deployment

```bash
# Tezkor deploy
./deploy.sh production

# Yoki Docker Compose
docker-compose up -d
```

**Domain:** `uzcall.uzbek-talim.uz`

**Qo'shimcha qo'llanmalar:** [docs/](docs/) papkasida

- `docs/DEPLOYMENT.md` - To'liq deployment qo'llanmasi
- `docs/BACKEND_API.md` - Backend API dokumentatsiya
- `docs/DNS_SETUP.md` - DNS sozlash

## Production Deployment

### Tezkor Deployment (Docker)

```bash
# 1. Environment variables sozlash
cp .env.production.example .env.production
# .env.production faylini tahrirlang

# 2. Deploy script ishga tushirish
./deploy.sh production
```

### Batafsil Qo'llanma

- **Deployment:** `DEPLOYMENT.md` - To'liq deployment qo'llanmasi
- **Backend API:** `BACKEND_API.md` - Backend developer uchun to'liq API dokumentatsiya
- **Qisqa Qo'llanma:** `API_INTEGRATION_GUIDE.md` - Tezkor integratsiya uchun

### Docker Compose

```bash
docker-compose up -d
```

### Manual Deployment

```bash
npm run build
# dist/ papkasini web server'ga yuklang
```

---

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
