# DNS Sozlash Qo'llanmasi

## uzcall.uzbek-talim.uz Domain'i uchun

### 1. DNS Record'lar

Domain provider'da (masalan, Cloudflare, Namecheap, yoki boshqa) quyidagi record'larni qo'shing:

#### A Record (IPv4)
```
Type: A
Name: uzcall
Value: <SERVER_IP_ADDRESS>
TTL: 3600 (yoki Auto)
```

#### AAAA Record (IPv6) - ixtiyoriy
```
Type: AAAA
Name: uzcall
Value: <SERVER_IPv6_ADDRESS>
TTL: 3600
```

#### CNAME Record (API subdomain uchun) - ixtiyoriy
```
Type: CNAME
Name: api.uzcall
Value: uzcall.uzbek-talim.uz
TTL: 3600
```

Yoki alohida API server bo'lsa:
```
Type: A
Name: api.uzcall
Value: <API_SERVER_IP>
TTL: 3600
```

### 2. Portlar

- **Port 80 (HTTP)** - ochiq bo'lishi kerak
- **Port 443 (HTTPS)** - ochiq bo'lishi kerak

### 3. Tekshirish

DNS sozlanganidan keyin (bir necha daqiqa kutish kerak):

```bash
# DNS tekshirish
nslookup uzcall.uzbek-talim.uz
dig uzcall.uzbek-talim.uz

# Ping tekshirish
ping uzcall.uzbek-talim.uz

# Port tekshirish
curl -I http://uzcall.uzbek-talim.uz
curl -I https://uzcall.uzbek-talim.uz
```

### 4. SSL Certificate (Let's Encrypt)

DNS sozlanganidan keyin SSL certificate o'rnatish:

```bash
# Certbot o'rnatish (agar yo'q bo'lsa)
sudo apt update
sudo apt install certbot python3-certbot-nginx

# SSL certificate olish
sudo certbot --nginx -d uzcall.uzbek-talim.uz

# Auto-renewal
sudo certbot renew --dry-run
```

### 5. Firewall Sozlash

Agar firewall ishlatilsa:

```bash
# UFW
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw reload

# Yoki iptables
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
```

### 6. Nginx Sozlash

Agar Docker ishlatilmasa, Nginx'ni to'g'ridan-to'g'ri sozlash:

```nginx
# /etc/nginx/sites-available/uzcall
server {
    listen 80;
    server_name uzcall.uzbek-talim.uz;
    
    location / {
        proxy_pass http://localhost:80;
        # yoki
        root /var/www/uzcall/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

Keyin:
```bash
sudo ln -s /etc/nginx/sites-available/uzcall /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. Docker Compose bilan

Agar Docker Compose ishlatilsa:

```bash
# .env fayl
cat > .env << EOF
VITE_API_BASE_URL=https://api.uzcall.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.uzcall.uzbek-talim.uz/api
EOF

# Deploy
docker-compose up -d
```

### 8. Muammo Tuzatish

#### DNS ishlamayapti
- DNS propagation vaqti: 5 daqiqadan 48 soatgacha
- `nslookup` yoki `dig` bilan tekshiring
- DNS provider'da record'lar to'g'ri qo'shilganligini tekshiring

#### Port ochiq emas
```bash
# Port tekshirish
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# Firewall tekshirish
sudo ufw status
sudo iptables -L -n
```

#### SSL xatolik
- Certbot log'larni tekshiring: `sudo certbot certificates`
- Certificate path'ni tekshiring: `/etc/letsencrypt/live/uzcall.uzbek-talim.uz/`
- Nginx config'ni tekshiring: `sudo nginx -t`

### 9. Test Qilish

Deployment'dan keyin:

```bash
# HTTP
curl http://uzcall.uzbek-talim.uz/health

# HTTPS
curl https://uzcall.uzbek-talim.uz/health

# Browser'da
# http://uzcall.uzbek-talim.uz
# https://uzcall.uzbek-talim.uz
```

### 10. Production Checklist

- [ ] DNS A record qo'shilgan
- [ ] Port 80 ochiq
- [ ] Port 443 ochiq
- [ ] SSL certificate o'rnatilgan
- [ ] Nginx/Docker ishlamoqda
- [ ] Health check ishlayapti
- [ ] Browser'da sayt ochiladi
- [ ] HTTPS redirect ishlayapti
