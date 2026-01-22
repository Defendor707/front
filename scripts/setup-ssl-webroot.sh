#!/bin/bash

# SSL certificate o'rnatish (webroot usuli - container ishlayotganda)

set -e

DOMAIN="uzcall.uzbek-talim.uz"
EMAIL="admin@uzbek-talim.uz"  # O'zgartiring

echo "🔒 SSL certificate o'rnatish: $DOMAIN (webroot usuli)"

# Certbot o'rnatish (agar yo'q bo'lsa)
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot o'rnatilmoqda..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Webroot directory yaratish
sudo mkdir -p /var/www/certbot

# SSL certificate olish (webroot usuli)
echo "🔐 SSL certificate olinmoqda..."
sudo certbot certonly --webroot \
    -w /var/www/certbot \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive || {
    echo "⚠️  SSL certificate olishda xatolik."
    echo "💡 DNS sozlanganligini va domain ishlayotganligini tekshiring."
    exit 1
}

echo "✅ SSL certificate o'rnatildi!"

# Certificate path'ni tekshirish
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificate fayllari topildi:"
    echo "   /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo "   /etc/letsencrypt/live/$DOMAIN/privkey.pem"
    
    # Nginx config'ni yangilash (webroot qo'shish)
    echo ""
    echo "📝 Nginx config'ni yangilash..."
    echo "💡 Keyin docker-compose-ssl.yml bilan qayta ishga tushiring"
else
    echo "❌ Certificate fayllari topilmadi!"
    exit 1
fi

echo ""
echo "✅ SSL tayyor! Keyingi qadam:"
echo "   1. docker-compose -f docker-compose-ssl.yml up -d"
echo "   2. curl https://uzcall.uzbek-talim.uz/health"
