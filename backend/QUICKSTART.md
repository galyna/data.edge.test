# Quick Start Guide - Stage 1

## Шаг 1: Установка зависимостей

```bash
cd backend
npm install
```

## Шаг 2: Настройка .env

Создайте файл `.env`:

```bash
cp env.template .env
```

Откройте `.env` и вставьте свои API ключи.

### Где получить ключи:

**TheSportsDB** (можно использовать тестовый ключ `3`):
- Сайт: https://www.thesportsdb.com/api.php
- Free tier: для тестирования используйте `3`
- Paid: $3/month для полного доступа

**API-Sports** (нужна регистрация):
- Сайт: https://api-sports.io
- Free: 100 requests/day
- Dashboard: https://dashboard.api-sports.io

**The Odds API** (нужна регистрация):
- Сайт: https://the-odds-api.com
- Free: 500 requests/month
- Dashboard: https://the-odds-api.com/account

## Шаг 3: Запуск сервера

```bash
npm run dev
```

Вы увидите:
```
🚀 Data Edge Backend Server
📡 Running on: http://localhost:3001
🌍 Environment: development

📋 Available endpoints:
   GET  /health              - Health check
   GET  /api/initial         - Fetch all sources
   GET  /api/initial/source/:name - Fetch specific source

⚙️  API Configuration:
   TheSportsDB: ✅ Configured
   API-Sports:  ❌ Not configured
   The Odds:    ❌ Not configured
```

## Шаг 4: Тестирование

### Health Check
```bash
curl http://localhost:3001/health
```

### Получить данные от всех источников
```bash
curl http://localhost:3001/api/initial | jq
```

### Получить данные от конкретного источника
```bash
# TheSportsDB
curl http://localhost:3001/api/initial/source/sportsdb | jq

# API-Sports
curl http://localhost:3001/api/initial/source/apisports | jq

# The Odds API
curl http://localhost:3001/api/initial/source/odds | jq
```

## Ожидаемый результат

```json
{
  "timestamp": "2025-01-18T10:00:00.000Z",
  "duration": "1234ms",
  "sources": [
    {
      "name": "TheSportsDB",
      "available": true,
      "configured": true,
      "duration": "456ms",
      "eventsCount": 10,
      "events": [
        {
          "id": "123456",
          "sport": "Soccer",
          "league": "Premier League",
          "homeTeam": "Arsenal",
          "awayTeam": "Chelsea",
          "homeScore": 2,
          "awayScore": 1,
          "status": "FT",
          "source": "TheSportsDB"
        }
      ]
    },
    {
      "name": "API-Sports",
      "available": false,
      "configured": false,
      "error": "API key not configured"
    },
    {
      "name": "TheOddsAPI",
      "available": false,
      "configured": false,
      "error": "API key not configured"
    }
  ],
  "summary": {
    "totalSources": 3,
    "availableSources": 1,
    "totalEvents": 10
  }
}
```

## Troubleshooting

### Проблема: "API key not configured"
**Решение:** Добавьте ключ в `.env` файл и перезапустите сервер

### Проблема: "Request timeout"
**Решение:** Увеличьте `API_TIMEOUT` в `.env` (по умолчанию 5000ms)

### Проблема: Empty events array
**Решение:** 
- Проверьте, есть ли живые матчи в данный момент
- TheSportsDB бесплатный ключ может иметь ограничения
- Попробуйте другой источник данных

### Проблема: CORS errors
**Решение:** Установите `ENABLE_CORS=true` в `.env`

## Минимальная рабочая конфигурация

Для быстрого тестирования достаточно только TheSportsDB с тестовым ключом `3`:

```env
PORT=3001
NODE_ENV=development
THESPORTSDB_API_KEY=3
API_TIMEOUT=5000
ENABLE_CORS=true
```

Остальные источники можно добавить позже.

## Следующие шаги

После успешного запуска Stage 1:
- ✅ Все 3 источника интегрированы
- ✅ Параллельные запросы работают
- ✅ Graceful degradation настроен
- ⏳ Stage 2: Добавить кэширование (Redis)
- ⏳ Stage 3: Real-time updates (SSE/WebSocket)
- ⏳ Stage 4: Background fetcher service

