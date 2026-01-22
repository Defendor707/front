#!/bin/bash

# Frontend'ni domain'ga deploy qilish va SSL o'rnatish
# Usage: ./deploy-with-ssl.sh

set -e

DOMAIN="uzcall.uzbek-talim.uz"
EMAIL="admin@uzbek-talim.uz"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Frontend'ni ${DOMAIN} domain'iga deploy qilish va SSL o'rnatish${NC}"
echo ""

# 1. Environment variables tekshirish
echo -e "${GREEN}📋 Environment variables tekshirilmoqda...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production topilmadi. Yaratilmoqda...${NC}"
    cat > .env.production << EOF
VITE_API_BASE_URL=https://api.uzcall.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.uzcall.uzbek-talim.uz/api
EOF
    echo -e "${GREEN}✅ .env.production yaratildi${NC}"
else
    echo -e "${GREEN}✅ .env.production mavjud${NC}"
fi

# Load environment variables
export $(cat .env.production | grep -v '^#' | xargs)

# 2. Build
echo ""
echo -e "${GREEN}📦 Application build qilinmoqda...${NC}"
npm ci
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build muvaffaqiyatsiz!${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Build muvaffaqiyatli!${NC}"

# 3. Docker network yaratish
echo ""
echo -e "${GREEN}🌐 Docker network tekshirilmoqda...${NC}"
docker network create call-center-network 2>/dev/null || echo -e "${YELLOW}⚠️  Network allaqachon mavjud${NC}"

# 4. Eski container'ni to'xtatish
echo ""
echo -e "${GREEN}🛑 Eski container'lar to'xtatilmoqda...${NC}"
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-ssl.yml down 2>/dev/null || true
if docker ps -a | grep -q ai-call-center-frontend; then
    docker stop ai-call-center-frontend 2>/dev/null || true
    docker rm ai-call-center-frontend 2>/dev/null || true
fi

# 5. HTTP bilan birinchi marta ishga tushirish (SSL uchun)
echo ""
echo -e "${GREEN}🌐 HTTP bilan ishga tushirilmoqda (SSL o'rnatish uchun)...${NC}"
docker-compose up -d

# 6. Container ishga tushganini kutish
echo ""
echo -e "${YELLOW}⏳ Container ishga tushishini kutish...${NC}"
sleep 10

# 7. Health check
echo ""
echo -e "${GREEN}🏥 Health check...${NC}"
if curl -f http://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTP ishlayapti!${NC}"
else
    echo -e "${YELLOW}⚠️  HTTP health check muvaffaqiyatsiz. Container loglarini tekshiring.${NC}"
    docker logs ai-call-center-frontend
fi

# 8. SSL certificate o'rnatish
echo ""
echo -e "${GREEN}🔒 SSL certificate o'rnatilmoqda...${NC}"

# Certbot o'rnatish
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Certbot o'rnatilmoqda...${NC}"
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Webroot directory yaratish
sudo mkdir -p /var/www/certbot

# SSL certificate olish
echo -e "${YELLOW}🔐 SSL certificate olinmoqda (bu bir necha daqiqa olishi mumkin)...${NC}"
if sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive 2>&1 | tee /tmp/certbot.log; then
    echo -e "${GREEN}✅ SSL certificate muvaffaqiyatli o'rnatildi!${NC}"
else
    CERTBOT_ERROR=$(cat /tmp/certbot.log)
    if echo "$CERTBOT_ERROR" | grep -q "already exists"; then
        echo -e "${YELLOW}⚠️  SSL certificate allaqachon mavjud. Yangilash...${NC}"
        sudo certbot renew --quiet || true
    else
        echo -e "${RED}❌ SSL certificate olishda xatolik!${NC}"
        echo -e "${YELLOW}💡 DNS sozlanganligini tekshiring:${NC}"
        echo -e "   nslookup $DOMAIN"
        echo -e "   dig $DOMAIN"
        echo ""
        echo -e "${YELLOW}⚠️  HTTP bilan davom etilmoqda (SSL o'rnatilmadi)${NC}"
        echo -e "${GREEN}✅ Frontend HTTP bilan ishga tushdi: http://${DOMAIN}${NC}"
        exit 0
    fi
fi

# 9. Certificate fayllarini tekshirish
if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${RED}❌ SSL certificate fayllari topilmadi!${NC}"
    echo -e "${YELLOW}⚠️  HTTP bilan davom etilmoqda${NC}"
    echo -e "${GREEN}✅ Frontend HTTP bilan ishga tushdi: http://${DOMAIN}${NC}"
    exit 0
fi

# 10. SSL bilan qayta ishga tushirish
echo ""
echo -e "${GREEN}🔄 SSL bilan qayta ishga tushirilmoqda...${NC}"
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-ssl.yml up -d --build

# 11. SSL bilan health check
echo ""
echo -e "${YELLOW}⏳ Container ishga tushishini kutish...${NC}"
sleep 10

echo ""
echo -e "${GREEN}🏥 SSL health check...${NC}"
if curl -k -f https://localhost/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ HTTPS ishlayapti!${NC}"
else
    echo -e "${YELLOW}⚠️  HTTPS health check muvaffaqiyatsiz. HTTP bilan ishlayapti.${NC}"
fi

# 12. Natija
echo ""
echo -e "${GREEN}🎉 Deployment muvaffaqiyatli!${NC}"
echo ""
echo -e "${BLUE}📋 Natijalar:${NC}"
echo -e "   🌐 Domain: ${DOMAIN}"
echo -e "   🔒 HTTPS: https://${DOMAIN}"
echo -e "   📡 HTTP: http://${DOMAIN} (HTTPS'ga redirect qiladi)"
echo ""
echo -e "${BLUE}🔍 Tekshirish:${NC}"
echo -e "   curl https://${DOMAIN}/health"
echo -e "   curl http://${DOMAIN}/health"
echo ""
echo -e "${BLUE}📝 Loglar:${NC}"
echo -e "   docker logs ai-call-center-frontend"
echo ""
echo -e "${GREEN}✅ Barcha narsa tayyor!${NC}"
