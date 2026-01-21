#!/bin/bash

# SSL certificate o'rnatish va sozlash

set -e

DOMAIN="uzcall.uzbek-talim.uz"
EMAIL="admin@uzbek-talim.uz"  # O'zgartiring

echo "🔒 SSL certificate o'rnatish: $DOMAIN"

# Certbot o'rnatish (agar yo'q bo'lsa)
if ! command -v certbot &> /dev/null; then
    echo "📦 Certbot o'rnatilmoqda..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# SSL certificate olish
echo "🔐 SSL certificate olinmoqda..."
sudo certbot certonly --standalone \
    --preferred-challenges http \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive || {
    echo "⚠️  SSL certificate olishda xatolik. DNS sozlanganligini tekshiring."
    exit 1
}

echo "✅ SSL certificate o'rnatildi!"

# Certificate path'ni tekshirish
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✅ Certificate fayllari topildi:"
    echo "   /etc/letsencrypt/live/$DOMAIN/fullchain.pem"
    echo "   /etc/letsencrypt/live/$DOMAIN/privkey.pem"
else
    echo "❌ Certificate fayllari topilmadi!"
    exit 1
fi

echo ""
echo "✅ SSL tayyor! Endi frontend'ni HTTPS bilan ishga tushirishingiz mumkin."
