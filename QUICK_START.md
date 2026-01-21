# Tezkor Boshlash Qo'llanmasi

## 1. Development (Local)

```bash
npm install
npm run dev
```

Brauzerda: `http://localhost:5173`

## 2. Production Deployment (call-center.uzbek-talim.uz)

### Variant A: Docker (Tavsiya etiladi)

```bash
# 1. Environment variables
cat > .env.production << EOF
VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.call-center.uzbek-talim.uz/api
EOF

# 2. Deploy
./deploy.sh production
```

### Variant B: Manual

```bash
# 1. Build
npm run build

# 2. Nginx'ga yuklash
sudo cp -r dist/* /var/www/call-center-frontend/
sudo systemctl reload nginx
```

## 3. Backend Integratsiya

1. `BACKEND_API.md` faylini o'qing
2. `src/services/api.ts` faylida comment qilingan kodlarni oching
3. Backend API endpoint'larini ulang

## 4. Tekshirish

- Health check: `curl http://call-center.uzbek-talim.uz/health`
- Logs: `docker logs ai-call-center-frontend`

## Muammo?

- `DEPLOYMENT.md` - Batafsil deployment qo'llanmasi
- `BACKEND_API.md` - Backend API dokumentatsiya
- `API_INTEGRATION_GUIDE.md` - Qisqa integratsiya qo'llanmasi
