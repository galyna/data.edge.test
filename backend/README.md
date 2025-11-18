# Data Edge Backend - Stage 1

Backend API aggregator для спортивных данных.

## Установка

```bash
cd backend
npm install
```

## Конфигурация

Создайте файл `.env` на основе `.env.example`:

```bash
# Server
PORT=3001
NODE_ENV=development

# API Keys
THESPORTSDB_API_KEY=your_key_here
APISPORTS_API_KEY=your_key_here
THEODDS_API_KEY=your_key_here

# Settings
API_TIMEOUT=5000
ENABLE_CORS=true
```

### Получение API ключей

1. **TheSportsDB** - https://www.thesportsdb.com/api.php
   - Free tier: 1 доступен для тестирования
   - Paid tier: $3/month для полного доступа

2. **API-Sports** - https://api-sports.io
   - Free tier: 100 requests/day
   - Paid: от $10/month

3. **The Odds API** - https://the-odds-api.com
   - Free tier: 500 requests/month
   - Paid: от $10/month

## Запуск

### Development (с hot reload)
```bash
npm run dev
```

### Production
```bash
npm start
```

Сервер запустится на `http://localhost:3001`

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-01-18T10:00:00.000Z",
  "uptime": 123.45,
  "environment": "development"
}
```

### `GET /api/initial`
Получить данные от всех источников параллельно

**Response:**
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
      "events": [...],
      "error": null
    },
    {
      "name": "API-Sports",
      "available": true,
      "configured": true,
      "duration": "678ms",
      "eventsCount": 15,
      "events": [...],
      "error": null
    },
    {
      "name": "TheOddsAPI",
      "available": true,
      "configured": true,
      "duration": "890ms",
      "eventsCount": 8,
      "events": [...],
      "error": null
    }
  ],
  "summary": {
    "totalSources": 3,
    "availableSources": 3,
    "totalEvents": 33
  }
}
```

### `GET /api/initial/source/:sourceName`
Получить данные от конкретного источника

**Параметры:**
- `sourceName`: `sportsdb` | `apisports` | `odds`

**Response:**
```json
{
  "timestamp": "2025-01-18T10:00:00.000Z",
  "source": {
    "name": "TheSportsDB",
    "available": true,
    "events": [...]
  }
}
```

## Структура проекта

```
backend/
├── src/
│   ├── server.js              # Главный файл сервера
│   ├── config.js              # Конфигурация
│   ├── routes/
│   │   └── initialRoute.js    # /api/initial endpoint
│   ├── services/
│   │   ├── sportsdbService.js    # TheSportsDB интеграция
│   │   ├── apisportsService.js   # API-Sports интеграция
│   │   └── oddsService.js        # The Odds API интеграция
│   ├── middleware/
│   │   └── errorHandler.js    # Обработка ошибок
│   └── utils/
│       └── fetchWithTimeout.js   # Fetch с таймаутом
├── package.json
└── .env
```

## Особенности Stage 1

✅ **Реализовано:**
- Параллельные запросы ко всем источникам
- Таймауты (5 секунд по умолчанию)
- Graceful degradation (если API недоступно, сервер не падает)
- Нормализация данных из разных источников
- CORS support
- Error handling
- Health check endpoint

⏳ **Для следующих стадий:**
- Stage 2: Кэширование (Redis)
- Stage 3: Real-time updates (SSE/WebSocket)
- Stage 4: Background fetcher service (cron)

## Тестирование

```bash
# Health check
curl http://localhost:3001/health

# Fetch all sources
curl http://localhost:3001/api/initial

# Fetch specific source
curl http://localhost:3001/api/initial/source/sportsdb
curl http://localhost:3001/api/initial/source/apisports
curl http://localhost:3001/api/initial/source/odds
```

## Troubleshooting

### API ключи не работают
- Проверьте `.env` файл
- Убедитесь, что ключи скопированы правильно
- Проверьте лимиты на free tier

### Timeout errors
- Увеличьте `API_TIMEOUT` в `.env`
- Проверьте интернет соединение
- Некоторые API могут быть медленными

### CORS errors
- Установите `ENABLE_CORS=true` в `.env`
- Настройте `FRONTEND_URL` в `.env` если frontend на другом порту

## Требования

- Node.js >= 18.0.0
- npm или yarn

## License

Private project

