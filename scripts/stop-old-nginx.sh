#!/bin/bash

# Eski call-center nginx container'ini to'xtatish
# Port 80 va 443 ni bo'shatish uchun

echo "🛑 Eski call-center nginx container'ini to'xtatish..."

if sudo docker ps | grep -q "callcenter-nginx"; then
    echo "✅ callcenter-nginx topildi, to'xtatilmoqda..."
    sudo docker stop callcenter-nginx
    echo "✅ callcenter-nginx to'xtatildi"
else
    echo "ℹ️  callcenter-nginx allaqachon to'xtatilgan yoki mavjud emas"
fi

# Port tekshirish
echo ""
echo "📊 Port holati:"
sudo ss -tulpn | grep -E ":80|:443" || echo "✅ Port 80 va 443 bo'sh"

echo ""
echo "✅ Tayyor! Endi frontend'ni ishga tushirishingiz mumkin."
