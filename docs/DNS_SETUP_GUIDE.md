# DNS Sozlash Qo'llanmasi - uzcall.uzbek-talim.uz

## 📋 Hozirgi Holat

**Domain:** `uzcall.uzbek-talim.uz`  
**DNS IP:** `20.79.177.108`  
**Status:** ✅ DNS sozlangan va ishlayapti

## 🔧 DNS Provider'da Sozlash

### 1. Domain Provider'ga Kirish

Domain provider'ingizga kirib (masalan: Cloudflare, Namecheap, GoDaddy, yoki boshqa), DNS sozlamalariga o'ting.

### 2. A Record Qo'shish

Quyidagi A Record'ni qo'shing:

```
Type: A
Name: uzcall
Value: 20.79.177.108
TTL: 3600 (yoki Auto)
Proxy: OFF (agar Cloudflare ishlatilsa)
```

**Eslatma:** Agar `@` yoki root domain uchun ham sozlash kerak bo'lsa:
```
Type: A
Name: @
Value: 20.79.177.108
TTL: 3600
```

### 3. API Subdomain (ixtiyoriy)

Agar API alohida subdomain'da ishlayotgan bo'lsa:

```
Type: A
Name: api.uzcall
Value: 20.79.177.108
TTL: 3600
```

Yoki:
```
Type: CNAME
Name: api.uzcall
Value: uzcall.uzbek-talim.uz
TTL: 3600
```

## ✅ DNS Tekshirish

DNS sozlanganidan keyin (5-30 daqiqadan keyin) tekshiring:

```bash
# DNS tekshirish
nslookup uzcall.uzbek-talim.uz
dig uzcall.uzbek-talim.uz

# Ping tekshirish
ping uzcall.uzbek-talim.uz

# HTTP tekshirish
curl -I http://uzcall.uzbek-talim.uz

# HTTPS tekshirish
curl -I https://uzcall.uzbek-talim.uz
```

## 🔒 SSL Certificate

DNS sozlanganidan keyin SSL certificate o'rnatish:

```bash
cd /home/azureuser/frontend
sudo ./scripts/setup-ssl-webroot.sh
```

Yoki qo'lda:
```bash
sudo certbot certonly --webroot \
  -w /var/www/certbot \
  -d uzcall.uzbek-talim.uz \
  --email admin@uzbek-talim.uz \
  --agree-tos \
  --non-interactive
```

## 🚀 Deployment

DNS va SSL sozlanganidan keyin:

```bash
cd /home/azureuser/frontend
./deploy-with-ssl.sh
```

## 🔍 Tekshirish

### 1. DNS Propagation

```bash
# Turli DNS server'lardan tekshirish
dig @8.8.8.8 uzcall.uzbek-talim.uz
dig @1.1.1.1 uzcall.uzbek-talim.uz
```

### 2. Portlar

```bash
# Port 80 (HTTP)
curl -I http://uzcall.uzbek-talim.uz

# Port 443 (HTTPS)
curl -I https://uzcall.uzbek-talim.uz
```

### 3. Health Check

```bash
curl https://uzcall.uzbek-talim.uz/health
# Javob: healthy
```

## 🛠️ Muammo Hal Qilish

### DNS ishlamayapti

1. **DNS Propagation vaqti:** 5 daqiqadan 48 soatgacha
2. **Tekshirish:**
   ```bash
   nslookup uzcall.uzbek-talim.uz
   dig uzcall.uzbek-talim.uz
   ```
3. **DNS Provider'da tekshiring:**
   - Record to'g'ri qo'shilganligini
   - IP address to'g'ri ekanligini
   - TTL sozlanganligini

### Port ochiq emas

```bash
# Firewall tekshirish
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Port tekshirish
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443
```

### SSL xatolik

```bash
# Certificate tekshirish
sudo certbot certificates

# Certificate path
ls -la /etc/letsencrypt/live/uzcall.uzbek-talim.uz/

# Nginx config
docker exec ai-call-center-frontend nginx -t
```

## 📝 Checklist

- [ ] DNS A Record qo'shildi (uzcall → 20.79.177.108)
- [ ] DNS propagation kutildi (5-30 daqiqa)
- [ ] Port 80 ochiq
- [ ] Port 443 ochiq
- [ ] SSL certificate o'rnatildi
- [ ] Frontend deploy qilindi
- [ ] Health check ishlayapti
- [ ] Browser'da sayt ochiladi

## 🌐 Browser'da Tekshirish

1. **HTTP:** http://uzcall.uzbek-talim.uz (HTTPS'ga redirect qiladi)
2. **HTTPS:** https://uzcall.uzbek-talim.uz
3. **Health:** https://uzcall.uzbek-talim.uz/health

## 📞 Qo'shimcha Yordam

Agar muammo bo'lsa:
1. DNS provider'da record'lar to'g'ri qo'shilganligini tekshiring
2. Server IP to'g'ri ekanligini tekshiring
3. Portlar ochiqligini tekshiring
4. SSL certificate o'rnatilganligini tekshiring
