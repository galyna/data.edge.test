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
THEODDS_API_KEY=your_key_here

# Settings
API_TIMEOUT=5000
ENABLE_CORS=true
```

### Получение API ключей

1. **The Odds API** - https://the-odds-api.com
   - Free tier: 500 requests/month
   - Paid: от $10/month
   
   **Поддерживаемые спорты:**
   - ⚽ Футбол: EPL, La Liga, Serie A, Bundesliga, Ligue 1, Champions League
   - 🏀 NBA
   - ⚾ MLB  
   - 🏒 NHL
   - 🎾 Tennis
   - 🥊 MMA
   
   **Поддерживаемые маркеты:**
   - `h2h` - Head-to-Head (победитель матча)
   - `spreads` - Форы
   - `totals` - Тоталы (больше/меньше)
   - Для NBA: дополнительно `h2h_q1`, `h2h_h1` (четверти/половины)

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
    "totalSources": 1,
    "availableSources": 1,
    "totalEvents": 8
  }
}
```

### `GET /api/initial/source/:sourceName`
Получить данные от конкретного источника

**Параметры:**
- `sourceName`: `odds`

**Response:**
```json
{
  "timestamp": "2025-01-18T10:00:00.000Z",
  "source": {
    "name": "TheOddsAPI",
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

### Быстрый тест через скрипт
```bash
# Запустите комплексный тест The Odds API
./test-theodds.sh
```

### Ручное тестирование
```bash
# Health check
curl http://localhost:3001/health

# Fetch all football leagues (EPL, La Liga, Serie A, Bundesliga, Ligue 1, UCL)
curl http://localhost:3001/api/initial?sport=football

# Fetch NBA
curl http://localhost:3001/api/initial?sport=nba

# Fetch MLB
curl http://localhost:3001/api/initial?sport=mlb

# Fetch specific source
curl http://localhost:3001/api/initial/source/odds

# С красивым форматированием (если установлен jq)
curl http://localhost:3001/api/initial?sport=football | jq '.'
```

### Тестирование через браузер
Откройте в браузере:
- http://localhost:3001/health
- http://localhost:3001/api/initial?sport=football
- http://localhost:3001/api/initial?sport=nba

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

