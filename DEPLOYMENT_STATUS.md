# Deployment Status

## ✅ Frontend muvaffaqiyatli ishga tushdi!

**Domain:** `uzcall.uzbek-talim.uz`  
**Status:** ✅ Ishlayapti (HTTPS bilan)  
**Port:** 80 (HTTP) va 443 (HTTPS)  
**SSL:** ✅ O'rnatilgan (Let's Encrypt)  
**SSL Expiry:** 2026-04-22

### 🌐 URL'lar

- **HTTPS:** https://uzcall.uzbek-talim.uz ✅
- **HTTP:** http://uzcall.uzbek-talim.uz (HTTPS'ga redirect qiladi) ✅
- **Login:** https://uzcall.uzbek-talim.uz/login ✅
- **Health Check:** https://uzcall.uzbek-talim.uz/health ✅

### 🔍 Tekshirish

```bash
# Health check
curl https://uzcall.uzbek-talim.uz/health
# Javob: healthy

# HTTP'dan HTTPS'ga redirect
curl -I http://uzcall.uzbek-talim.uz
# Javob: HTTP/1.1 301 Moved Permanently

# HTTPS
curl -I https://uzcall.uzbek-talim.uz
# Javob: HTTP/2 200
```

### 🐳 Docker Container

```bash
# Container status
docker ps | grep ai-call-center-frontend

# Loglar
docker logs ai-call-center-frontend

# Container'ni qayta ishga tushirish
docker restart ai-call-center-frontend
```

### 🔒 SSL Certificate

- **Certificate Path:** `/etc/letsencrypt/live/uzcall.uzbek-talim.uz/`
- **Auto-renewal:** ✅ Sozlangan (Certbot)
- **Expiry Date:** 2026-04-22

SSL certificate'ni qo'lda yangilash:
```bash
sudo certbot renew
docker-compose -f docker-compose-ssl.yml restart
```

### 📝 Deployment Scripts

- **`deploy-with-ssl.sh`** - To'liq deployment (HTTP + SSL)
- **`quick-deploy.sh`** - Tezkor deployment (SSL mavjud bo'lsa)
- **`deploy.sh`** - Oddiy deployment (HTTP)

### ✅ Deployment muvaffaqiyatli!

Frontend endi https://uzcall.uzbek-talim.uz domain'ida ishlayapti va SSL bilan himoyalangan.
