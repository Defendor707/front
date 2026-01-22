#!/bin/bash

# Tezkor deployment - SSL o'rnatilgan bo'lsa, SSL bilan, aks holda HTTP bilan
# Usage: ./quick-deploy.sh

set -e

DOMAIN="uzcall.uzbek-talim.uz"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🚀 Tezkor deployment: ${DOMAIN}${NC}"
echo ""

# Environment variables
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  .env.production topilmadi. Yaratilmoqda...${NC}"
    cat > .env.production << EOF
VITE_API_BASE_URL=https://api.uzcall.uzbek-talim.uz/api
VITE_WS_BASE_URL=wss://api.uzcall.uzbek-talim.uz/api
EOF
fi

export $(cat .env.production | grep -v '^#' | xargs)

# Build
echo -e "${GREEN}📦 Build qilinmoqda...${NC}"
npm ci
npm run build

if [ ! -d "dist" ]; then
    echo -e "${RED}❌ Build muvaffaqiyatsiz!${NC}"
    exit 1
fi

# Docker network
docker network create call-center-network 2>/dev/null || true

# Eski container'ni to'xtatish
docker-compose down 2>/dev/null || true
docker-compose -f docker-compose-ssl.yml down 2>/dev/null || true

# SSL certificate mavjudligini tekshirish
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo -e "${GREEN}🔒 SSL certificate topildi. HTTPS bilan ishga tushirilmoqda...${NC}"
    docker-compose -f docker-compose-ssl.yml up -d --build
    echo -e "${GREEN}✅ HTTPS bilan ishga tushdi: https://${DOMAIN}${NC}"
else
    echo -e "${YELLOW}⚠️  SSL certificate topilmadi. HTTP bilan ishga tushirilmoqda...${NC}"
    docker-compose up -d --build
    echo -e "${GREEN}✅ HTTP bilan ishga tushdi: http://${DOMAIN}${NC}"
    echo -e "${YELLOW}💡 SSL o'rnatish uchun: ./deploy-with-ssl.sh${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Deployment muvaffaqiyatli!${NC}"
