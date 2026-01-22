# Frontend Deployment Qo'llanmasi

## 🚀 Tezkor Deployment

### 1. To'liq Deployment (HTTP + SSL)

Bu skript frontend'ni domain'ga deploy qiladi va SSL o'rnatadi:

```bash
cd /home/azureuser/frontend
./deploy-with-ssl.sh
```

Bu skript:
- ✅ Application'ni build qiladi
- ✅ Docker container'ni ishga tushiradi (HTTP bilan)
- ✅ SSL certificate o'rnatadi (Let's Encrypt)
- ✅ SSL bilan qayta ishga tushiradi
- ✅ Barcha narsani tekshiradi

### 2. Tezkor Deployment (SSL mavjud bo'lsa)

Agar SSL allaqachon o'rnatilgan bo'lsa:

```bash
cd /home/azureuser/frontend
./scripts/quick-deploy.sh
```

### 3. Oddiy Deployment (HTTP)

Agar faqat HTTP kerak bo'lsa:

```bash
cd /home/azureuser/frontend
./scripts/deploy.sh production
```

## 📋 Talablar

1. **DNS sozlash:**
   - `uzcall.uzbek-talim.uz` domain'i server IP'ga ko'rsatishi kerak
   - A Record: `uzcall` → `<SERVER_IP>`

2. **Portlar:**
   - Port 80 (HTTP) - ochiq bo'lishi kerak
   - Port 443 (HTTPS) - SSL uchun ochiq bo'lishi kerak

3. **Environment variables:**
   - `.env.production` fayli mavjud bo'lishi kerak
   - Yoki avtomatik yaratiladi

## 🔒 SSL Certificate

SSL certificate avtomatik o'rnatiladi `deploy-with-ssl.sh` skripti orqali.

Agar qo'lda o'rnatish kerak bo'lsa:

```bash
sudo ./scripts/setup-ssl-webroot.sh
```

Keyin:
```bash
docker-compose -f docker-compose-ssl.yml up -d
```

## 🌐 Domain

**Production domain:** `uzcall.uzbek-talim.uz`

- HTTP: http://uzcall.uzbek-talim.uz
- HTTPS: https://uzcall.uzbek-talim.uz (SSL o'rnatilgandan keyin)

## 🔍 Tekshirish

```bash
# Health check
curl http://uzcall.uzbek-talim.uz/health
curl https://uzcall.uzbek-talim.uz/health

# Container loglari
docker logs ai-call-center-frontend

# Container status
docker ps | grep ai-call-center-frontend
```

## 🛠️ Muammo hal qilish

### SSL certificate o'rnatilmayapti

1. DNS sozlanganligini tekshiring:
   ```bash
   nslookup uzcall.uzbek-talim.uz
   dig uzcall.uzbek-talim.uz
   ```

2. Port 80 ochiqligini tekshiring:
   ```bash
   curl -I http://uzcall.uzbek-talim.uz
   ```

3. Firewall sozlamalarini tekshiring:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```

### Container ishlamayapti

```bash
# Loglarni ko'rish
docker logs ai-call-center-frontend

# Container'ni qayta ishga tushirish
docker restart ai-call-center-frontend

# Container'ni to'liq qayta yaratish
docker-compose down
docker-compose up -d --build
```

### Build muvaffaqiyatsiz

```bash
# Dependencies'ni tozalash
rm -rf node_modules package-lock.json
npm install

# Build qayta urinish
npm run build
```

## 📝 Fayllar

- `deploy-with-ssl.sh` - To'liq deployment (HTTP + SSL)
- `scripts/quick-deploy.sh` - Tezkor deployment (SSL mavjud bo'lsa)
- `scripts/deploy.sh` - Oddiy deployment (HTTP)
- `docker-compose.yml` - HTTP konfiguratsiyasi
- `docker-compose-ssl.yml` - HTTPS konfiguratsiyasi
- `config/nginx.conf` - HTTP nginx config
- `config/nginx-ssl.conf` - HTTPS nginx config

## ✅ Deployment muvaffaqiyatli bo'lgandan keyin

1. Browser'da oching: https://uzcall.uzbek-talim.uz
2. Login sahifasini tekshiring: https://uzcall.uzbek-talim.uz/login
3. Health check: https://uzcall.uzbek-talim.uz/health
