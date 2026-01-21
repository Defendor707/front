#!/bin/bash

# Barcha call-center xizmatlarini to'xtatish (faqat frontend qoladi)

echo "🛑 Barcha call-center xizmatlarini to'xtatish..."

# Barcha call-center container'larini topish va to'xtatish
CONTAINERS=$(sudo docker ps --format "{{.Names}}" | grep -i "call" | grep -v "frontend")

if [ -z "$CONTAINERS" ]; then
    echo "ℹ️  To'xtatish kerak bo'lgan container'lar topilmadi"
else
    echo "📋 Topilgan container'lar:"
    echo "$CONTAINERS"
    echo ""
    
    for container in $CONTAINERS; do
        echo "🛑 $container to'xtatilmoqda..."
        sudo docker stop "$container" 2>/dev/null && echo "✅ $container to'xtatildi" || echo "⚠️  $container to'xtatilmadi"
    done
fi

echo ""
echo "✅ Barcha xizmatlar to'xtatildi. Faqat frontend qoldi."
