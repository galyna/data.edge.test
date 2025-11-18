# TheSportsDB Integration Guide

## ✅ Что сделано

### 1. Backend интеграция (готова в `backend/`)
- ✅ TheSportsDB service создан
- ✅ API-Sports service создан  
- ✅ The Odds API service создан
- ✅ Endpoint `/api/initial` готов к использованию

### 2. Frontend интеграция
- ✅ API route `/api/live-data` создан (проксирует запросы к backend)
- ✅ Hook `useLiveSportsData` создан (автоматическое обновление каждые 30 сек)
- ✅ `app/page.tsx` обновлена (использует реальные данные вместо моков)
- ✅ `src/components/Header.tsx` обновлен (показывает статус источников и время обновления)

## 🚀 Как запустить

### Шаг 1: Запустить Backend

```bash
# В отдельном терминале
cd backend
npm install
cp env.template .env
```

Отредактируйте `.env`:
```env
PORT=3001
NODE_ENV=development

# TheSportsDB - бесплатный ключ для тестирования
THESPORTSDB_API_KEY=3

# Остальные можно оставить пустыми пока
APISPORTS_API_KEY=
THEODDS_API_KEY=

API_TIMEOUT=5000
ENABLE_CORS=true
```

Запустите backend:
```bash
npm run dev
```

Вы увидите:
```
🚀 Data Edge Backend Server
📡 Running on: http://localhost:3001
⚙️  API Configuration:
   TheSportsDB: ✅ Configured
   API-Sports:  ❌ Not configured
   The Odds:    ❌ Not configured
```

### Шаг 2: Запустить Frontend

```bash
# В другом терминале, в корне проекта
npm run dev
```

Откройте http://localhost:3000

## 🎯 Что вы увидите

### В Header (правый верхний угол):
- **"X/3 Sources Live"** - показывает сколько источников данных активно
  - Зеленый индикатор = есть активные источники
  - Серый индикатор = нет активных источников
  
- **"Last sync: Xs ago"** - время с последнего обновления данных
  - Обновляется автоматически каждые 30 секунд

### На главной странице:
- **Unified Sports Feed** - живые матчи из TheSportsDB
- **Analyst Comparison** - сравнение данных из разных источников
- **Odds Aggregator** - коэффициенты (если источники активны)
- **Value Signals** - сигналы (пока мок-данные)

### Во время загрузки:
- Скелетоны вместо контента
- После загрузки данных появятся реальные матчи

## 🔧 Как это работает

### 1. Поток данных

```
TheSportsDB API
     ↓
Backend (localhost:3001)
  /api/initial
     ↓
Frontend API Route
  /api/live-data
     ↓
useLiveSportsData hook
     ↓
app/page.tsx + Header.tsx
```

### 2. Автообновление

```typescript
// В app/page.tsx
const { matches, sources, isLoading, lastUpdate } = useLiveSportsData(30000);
//                                                                      ↑
//                                        Автообновление каждые 30 секунд
```

Измените `30000` на другое значение (в миллисекундах) или `0` чтобы отключить автообновление.

### 3. API Response Format

Backend возвращает:
```json
{
  "timestamp": "2025-01-18T...",
  "duration": "567ms",
  "sources": [
    {
      "name": "TheSportsDB",
      "available": true,
      "eventsCount": 10,
      "events": [...]
    },
    {
      "name": "API-Sports",
      "available": false,
      "error": "API key not configured"
    },
    {
      "name": "TheOddsAPI",
      "available": false,
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

## 🧪 Тестирование

### Тест 1: Backend работает
```bash
curl http://localhost:3001/health
```

Ожидаемый ответ:
```json
{
  "status": "ok",
  "timestamp": "...",
  "uptime": 123.45
}
```

### Тест 2: TheSportsDB подключен
```bash
curl http://localhost:3001/api/initial/source/sportsdb | jq
```

Ожидаемый ответ:
```json
{
  "timestamp": "...",
  "source": {
    "name": "TheSportsDB",
    "available": true,
    "eventsCount": 10,
    "events": [...]
  }
}
```

### Тест 3: Frontend получает данные
Откройте DevTools в браузере:
1. Network tab
2. Фильтр: `live-data`
3. Должны видеть запросы каждые 30 секунд
4. Status: 200 OK
5. Response: данные от backend

## 📝 Что можно улучшить дальше

### 1. Добавить API-Sports и The Odds API
Получите ключи и добавьте в `backend/.env`:
```env
APISPORTS_API_KEY=your_key_here
THEODDS_API_KEY=your_key_here
```

Перезапустите backend - теперь будет "3/3 Sources Live"

### 2. Настроить интервал обновления
В `app/page.tsx`:
```typescript
// Для production: реже обновления чтобы не исчерпать квоты API
useLiveSportsData(60000) // каждую минуту

// Для testing: чаще обновления
useLiveSportsData(10000) // каждые 10 секунд

// Без автообновления (только при загрузке страницы)
useLiveSportsData(0)
```

### 3. Добавить обработку ошибок в UI
Сейчас если backend недоступен, данные просто не загружаются. Можно добавить:
```typescript
const { matches, sources, isLoading, error } = useLiveSportsData(30000);

if (error) {
  return <div>Error: {error}</div>
}
```

### 4. Добавить кэширование (Stage 2)
- Redis для кэширования ответов
- Меньше запросов к API
- Быстрее загрузка данных

### 5. Добавить WebSocket (Stage 3)
- Real-time обновления без polling
- Меньше нагрузка на сервер
- Instant updates

## ⚠️ Важные замечания

### Rate Limits
- **TheSportsDB Free (ключ "3")**: ~1 request/sec
- **API-Sports Free**: 100 requests/day
- **The Odds API Free**: 500 requests/month (~16/day)

С автообновлением каждые 30 секунд:
- 2 requests/min
- 120 requests/hour
- 2,880 requests/day

**Вывод:** Free tier API-Sports и The Odds API быстро исчерпаются!

**Решение:** 
1. Увеличить интервал обновления до 5-10 минут для production
2. Добавить кэширование (Stage 2)
3. Использовать платные планы

### Backend должен быть запущен
Frontend не работает без backend. Убедитесь что:
- Backend запущен на `localhost:3001`
- CORS включен (`ENABLE_CORS=true` в backend/.env)
- Нет файрвола блокирующего порт 3001

### HTTPS в production
Для production нужно:
1. Backend на отдельном сервере (Heroku, Railway, Vercel Functions)
2. HTTPS connection
3. Environment variables через UI хостинга

## 🎉 Результат

✅ TheSportsDB подключен к главной странице  
✅ Header показывает статус источников  
✅ Автообновление каждые 30 секунд  
✅ Graceful degradation если API недоступно  
✅ Скелетоны во время загрузки  
✅ Ready для добавления других источников  

**Stage 1 интеграция завершена!** 🚀

