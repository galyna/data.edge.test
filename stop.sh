#!/bin/bash

# 🛑 Data Edge - Stop Script
# Останавливает все процессы backend и frontend

echo "🛑 Stopping Data Edge Services..."
echo "================================="
echo ""

# Цвета
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

stopped=0

# Останавливаем процессы на портах
if lsof -ti:3000 > /dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Frontend (port 3000)...${NC}"
    kill -9 $(lsof -ti:3000) 2>/dev/null
    stopped=$((stopped + 1))
fi

if lsof -ti:3001 > /dev/null 2>&1; then
    echo -e "${YELLOW}Stopping Backend (port 3001)...${NC}"
    kill -9 $(lsof -ti:3001) 2>/dev/null
    stopped=$((stopped + 1))
fi

# Останавливаем node процессы
if pgrep -f "next dev" > /dev/null; then
    echo -e "${YELLOW}Stopping Next.js processes...${NC}"
    pkill -f "next dev" 2>/dev/null
    stopped=$((stopped + 1))
fi

if pgrep -f "nodemon.*server.js" > /dev/null; then
    echo -e "${YELLOW}Stopping Nodemon processes...${NC}"
    pkill -f "nodemon.*server.js" 2>/dev/null
    stopped=$((stopped + 1))
fi

echo ""
if [ $stopped -eq 0 ]; then
    echo -e "${GREEN}✅ No running services found${NC}"
else
    echo -e "${GREEN}✅ Stopped $stopped service(s)${NC}"
fi





