# Production Deployment Qo'llanmasi

Bu qo'llanma `https://call-center.uzbek-talim.uz` domain'ida frontend'ni ishga tushirish uchun.

## 1. Environment Variables

`.env.production` fayl yarating:

```env
VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.call-center.uzbek-talim.uz/api
```

## 2. Docker orqali Deployment

### Build va Run

```bash
# Build image
docker build \
  --build-arg VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api \
  --build-arg VITE_WS_BASE_URL=wss://api.call-center.uzbek-talim.uz/api \
  -t ai-call-center-frontend:latest .

# Run container
docker run -d \
  --name ai-call-center-frontend \
  --restart unless-stopped \
  -p 80:80 \
  ai-call-center-frontend:latest
```

### Docker Compose

```bash
# .env fayl yarating
cat > .env << EOF
VITE_API_BASE_URL=https://api.call-center.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.call-center.uzbek-talim.uz/api
EOF

# Network yaratish (agar yo'q bo'lsa)
docker network create call-center-network

# Run
docker-compose up -d
```

## 3. Nginx orqali Deployment (Docker'siz)

### Build

```bash
npm install
npm run build
```

### Nginx Config

`/etc/nginx/sites-available/call-center-frontend`:

```nginx
server {
    listen 80;
    server_name call-center.uzbek-talim.uz;

    root /var/www/call-center-frontend/dist;
    index index.html;

    # Gzip
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json application/javascript;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/call-center-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 4. SSL Certificate (Let's Encrypt)

```bash
sudo certbot --nginx -d call-center.uzbek-talim.uz
```

## 5. Systemd Service (Docker uchun)

`/etc/systemd/system/call-center-frontend.service`:

```ini
[Unit]
Description=AI Call Center Frontend
After=docker.service
Requires=docker.service

[Service]
Type=oneshot
RemainAfterExit=yes
WorkingDirectory=/home/azureuser/frontend
ExecStart=/usr/bin/docker-compose up -d
ExecStop=/usr/bin/docker-compose down
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

### Enable Service

```bash
sudo systemctl enable call-center-frontend
sudo systemctl start call-center-frontend
```

## 6. Monitoring

### Health Check

```bash
curl http://call-center.uzbek-talim.uz/health
```

### Logs

```bash
# Docker logs
docker logs -f ai-call-center-frontend

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

## 7. Auto-restart Script

`restart.sh`:

```bash
#!/bin/bash
cd /home/azureuser/frontend
git pull origin main
docker-compose build --no-cache
docker-compose up -d
docker system prune -f
```

Chmod:
```bash
chmod +x restart.sh
```

## 8. Troubleshooting

### Container ishlamayapti

```bash
docker ps -a
docker logs ai-call-center-frontend
docker restart ai-call-center-frontend
```

### Nginx 502 Bad Gateway

```bash
# Nginx config tekshirish
sudo nginx -t

# Container status
docker ps

# Port tekshirish
netstat -tulpn | grep 80
```

### Build Error

```bash
# Cache tozalash
docker system prune -a
npm cache clean --force
rm -rf node_modules dist
npm install
npm run build
```

## 9. Backup

```bash
# Build artifacts backup
tar -czf frontend-backup-$(date +%Y%m%d).tar.gz dist/
```

## 10. Updates

```bash
# Git'dan yangilash
git pull origin main
npm install
npm run build

# Docker rebuild
docker-compose build --no-cache
docker-compose up -d
```

---

## Production Checklist

- [ ] Environment variables sozlangan
- [ ] Docker image build qilingan
- [ ] Container ishlamoqda
- [ ] Health check ishlayapti
- [ ] SSL certificate o'rnatilgan
- [ ] Nginx config to'g'ri
- [ ] Backend API ulangan
- [ ] Monitoring sozlangan
- [ ] Auto-restart sozlangan
- [ ] Backup strategiyasi tayyor
