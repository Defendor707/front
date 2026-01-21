# Deployment Status

## ✅ Frontend ishga tushdi!

**Domain:** `uzcall.uzbek-talim.uz`
**Status:** ✅ Ishlayapti
**Port:** 80 (HTTP)

### Tekshirish

```bash
# Health check
curl http://uzcall.uzbek-talim.uz/health

# Browser'da
http://uzcall.uzbek-talim.uz
```

### SSL (HTTPS)

SSL certificate o'rnatish:

```bash
cd /home/azureuser/frontend
sudo ./setup-ssl.sh
```

Keyin HTTPS bilan ishga tushirish:

```bash
# Container'ni to'xtatish
sudo docker stop ai-call-center-frontend

# SSL bilan qayta ishga tushirish
docker-compose -f docker-compose-ssl.yml up -d
```

### To'xtatilgan xizmatlar

✅ Barcha eski call-center xizmatlari to'xtatildi:
- callcenter-admin
- callcenter-backend
- callcenter-redis
- callcenter-db
- callcenter-chromadb
- callcenter-nginx

### Faqat frontend ishlayapti

✅ `ai-call-center-frontend` container ishlayapti

### Keyingi qadamlar

1. SSL certificate o'rnatish (agar kerak bo'lsa)
2. Backend API'ni ulash
3. Domain DNS sozlash (agar hali bo'lmasa)
