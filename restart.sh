#!/bin/bash

# 🔄 Data Edge - Restart Script
# Останавливает и перезапускает backend и frontend

echo "🔄 Restarting Data Edge..."
echo "=========================="
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Находим и останавливаем процессы
echo -e "${YELLOW}Stopping existing processes...${NC}"

# Останавливаем процессы на портах 3000 и 3001
if lsof -ti:3000 > /dev/null 2>&1; then
    echo "Killing process on port 3000 (Frontend)..."
    kill -9 $(lsof -ti:3000) 2>/dev/null
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo "Killing process on port 3001 (Backend)..."
    kill -9 $(lsof -ti:3001) 2>/dev/null
fi

# Останавливаем node процессы с нашими приложениями
pkill -f "next dev" 2>/dev/null
pkill -f "nodemon.*server.js" 2>/dev/null

echo -e "${GREEN}✅ Processes stopped${NC}"
echo ""

# Небольшая пауза
sleep 1

# Запускаем снова
echo -e "${GREEN}Starting services...${NC}"
echo ""

# Запускаем dev.sh
./dev.sh





