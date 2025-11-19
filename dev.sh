#!/bin/bash

# 🚀 Data Edge - Development Startup Script
# Запускает backend и frontend одновременно

echo "🚀 Starting Data Edge Development Environment"
echo "=============================================="
echo ""

# Цвета для вывода
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Проверка наличия node_modules
echo -e "${YELLOW}Checking dependencies...${NC}"

if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies...${NC}"
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo -e "${YELLOW}📦 Installing backend dependencies...${NC}"
    cd backend && npm install && cd ..
fi

echo -e "${GREEN}✅ Dependencies OK${NC}"
echo ""

# Проверка .env файла
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  No backend/.env file found${NC}"
    echo "Creating from template..."
    cp backend/env.template backend/.env
    echo -e "${YELLOW}⚠️  Please edit backend/.env and add your API keys${NC}"
    echo ""
fi

# Функция для очистки процессов при выходе
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Stopping services...${NC}"
    kill $(jobs -p) 2>/dev/null
    exit 0
}

trap cleanup SIGINT SIGTERM

echo -e "${BLUE}🔧 Starting Backend (Port 3001)...${NC}"
cd backend && npm run dev &
BACKEND_PID=$!

# Ждем 2 секунды перед запуском frontend
sleep 2

echo -e "${BLUE}⚡ Starting Frontend (Port 3000)...${NC}"
npm run dev &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}✨ Services started successfully!${NC}"
echo ""
echo "📡 Backend:  http://localhost:3001"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop all services${NC}"
echo ""

# Ждем завершения любого процесса
wait





