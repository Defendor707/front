# Domain Sozlash: uzcall.uzbek-talim.uz

## ✅ Tayyor

Barcha sozlamalar `uzcall.uzbek-talim.uz` domain'i uchun yangilandi.

## Tezkor Deploy

```bash
# 1. Environment variables
cat > .env.production << EOF
VITE_API_BASE_URL=https://api.uzcall.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.uzcall.uzbek-talim.uz/api
EOF

# 2. Deploy
./deploy.sh production
```

## DNS Sozlash

1. **A Record qo'shing:**
   ```
   Type: A
   Name: uzcall
   Value: <SERVER_IP>
   TTL: 3600
   ```

2. **Portlar ochiqligini tekshiring:**
   ```bash
   # Port 80 (HTTP)
   curl -I http://uzcall.uzbek-talim.uz
   
   # Port 443 (HTTPS) - SSL o'rnatilgandan keyin
   curl -I https://uzcall.uzbek-talim.uz
   ```

## SSL Certificate

DNS sozlanganidan keyin:

```bash
sudo certbot --nginx -d uzcall.uzbek-talim.uz
```

Yoki Docker ishlatilsa, `nginx-ssl.conf` faylini ishlatish.

## Tekshirish

```bash
# Health check
curl http://uzcall.uzbek-talim.uz/health

# Browser'da
# http://uzcall.uzbek-talim.uz
# https://uzcall.uzbek-talim.uz
```

## Muammo bo'lsa

- `DNS_SETUP.md` - DNS sozlash qo'llanmasi
- `DEPLOYMENT.md` - To'liq deployment qo'llanmasi
- `nginx-ssl.conf` - SSL config (HTTPS uchun)
