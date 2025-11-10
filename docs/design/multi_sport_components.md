# Multi-Sport Data Feeds: Components Design Document

## Overview

Документ описывает компоненты для реализации мультиспортивного фида данных (Comprehensive Multi-Sport Data Feeds) на основе интеграции с Sportradar, SportsDataIO, API-Sports и другими источниками.

**Цель:** Преобразовать дашборд в единый источник информации для live scores, статистики, расписаний и коэффициентов по множеству видов спорта.

---

## 1. Core Components (Основные компоненты)

### 1.1 DataSourceAggregator
**Назначение:** Агрегация данных из множественных API источников

**Функциональность:**
- Нормализация данных из разных источников (Sportradar, SportsDataIO, API-Sports)
- Мерж данных в единый формат
- Определение приоритета источников
- Обработка конфликтов данных
- Кэширование и обновление в реальном времени

**Реализация на Shadcn UI:**
```typescript
// Контекст для управления источниками данных
import { createContext } from 'react';

interface DataSource {
  id: string;
  name: 'Sportradar' | 'SportsDataIO' | 'API-Sports' | 'TheSportsDB';
  status: 'active' | 'delayed' | 'offline';
  latency: number;
  priority: number;
  lastUpdate: Date;
}

// UI компонент на базе Shadcn
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

<Card className="terminal-card">
  <CardHeader>
    <CardTitle>Data Source Aggregator</CardTitle>
  </CardHeader>
  <CardContent>
    {sources.map(source => (
      <div key={source.id} className="flex items-center justify-between">
        <span>{source.name}</span>
        <Badge variant={source.status === 'active' ? 'default' : 'secondary'}>
          {source.status}
        </Badge>
      </div>
    ))}
  </CardContent>
</Card>
```

---

### 1.2 UnifiedSportsFeed
**Назначение:** Единый фид для всех видов спорта

**Функциональность:**
- Отображение live scores из всех источников
- Переключение между видами спорта (Football, NBA, MLB, NHL, Tennis, E-sports)
- Фильтрация по лигам и турнирам
- Сортировка по важности, времени, популярности
- Индикация источника данных для каждого матча

**Компоненты Shadcn UI:**
- `Tabs` — переключение видов спорта
- `Select` — выбор лиги
- `Table` — отображение матчей
- `Badge` — статус матча (Live/Scheduled/Finished)
- `Tooltip` — информация об источнике данных

**Структура:**
```typescript
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

<div className="terminal-card p-4">
  <Tabs defaultValue="football">
    <TabsList>
      <TabsTrigger value="football">Football</TabsTrigger>
      <TabsTrigger value="nba">NBA</TabsTrigger>
      <TabsTrigger value="tennis">Tennis</TabsTrigger>
      <TabsTrigger value="esports">E-sports</TabsTrigger>
    </TabsList>
    
    <TabsContent value="football">
      <div className="mb-3">
        <Select>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select league" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="premier-league">Premier League</SelectItem>
            <SelectItem value="la-liga">La Liga</SelectItem>
            <SelectItem value="bundesliga">Bundesliga</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Match</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {/* Match rows */}
        </TableBody>
      </Table>
    </TabsContent>
  </Tabs>
</div>
```

---

### 1.3 LiveScoreCard (Enhanced)
**Назначение:** Карточка live матча с агрегированными данными

**Функциональность:**
- Отображение счета в реальном времени
- Индикация источника данных (Sportradar/SportsDataIO/API-Sports)
- Визуализация разницы данных между источниками
- Метаданные: лига, турнир, время
- Статистика матча (при наличии)
- Клик для детального просмотра

**Компоненты Shadcn UI:**
- `Card` — контейнер
- `Badge` — статус и источник
- `Progress` — владение мячом, статистика
- `Dialog` — детальная информация
- `Tooltip` — подсказки

**Дизайн:**
```typescript
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";

<Card className="terminal-card p-4 hover-lift cursor-pointer">
  <div className="flex items-center justify-between mb-3">
    <div className="flex items-center gap-2">
      <Badge variant="destructive" className="animate-pulse">LIVE</Badge>
      <span className="text-xs text-muted-foreground">45' + 2</span>
    </div>
    <Badge variant="outline" className="text-[10px]">
      Sportradar
    </Badge>
  </div>
  
  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 mb-3">
    <div className="text-right">
      <div className="text-sm font-medium">{homeTeam}</div>
      <span className="text-xs text-muted-foreground">{homeForm}</span>
    </div>
    
    <div className="text-center">
      <div className="text-2xl font-bold font-mono">{homeScore} - {awayScore}</div>
    </div>
    
    <div className="text-left">
      <div className="text-sm font-medium">{awayTeam}</div>
      <span className="text-xs text-muted-foreground">{awayForm}</span>
    </div>
  </div>
  
  {/* Stats */}
  <div className="space-y-2">
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span>Possession</span>
        <span className="font-mono">{homePossession}% - {awayPossession}%</span>
      </div>
      <Progress value={homePossession} className="h-1" />
    </div>
  </div>
</Card>
```

---

### 1.4 MultiSourceComparison
**Назначение:** Сравнение данных из разных источников

**Функциональность:**
- Отображение одного и того же события из разных источников
- Визуализация расхождений (если есть)
- Выбор приоритетного источника
- Индикация качества данных (latency, freshness)
- Временная шкала обновлений

**Компоненты Shadcn UI:**
- `Table` — сравнительная таблица
- `Badge` — индикация качества
- `Alert` — предупреждения о расхождениях
- `Tooltip` — детали источника

**Структура:**
```typescript
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

<div className="terminal-card p-4">
  <h3 className="text-sm font-semibold mb-3 uppercase">
    Multi-Source Comparison: Arsenal vs Chelsea
  </h3>
  
  {discrepancy && (
    <Alert variant="warning" className="mb-3">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Data Discrepancy Detected</AlertTitle>
      <AlertDescription>
        Score mismatch between sources. Sportradar: 2-1, API-Sports: 1-1
      </AlertDescription>
    </Alert>
  )}
  
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Source</TableHead>
        <TableHead>Score</TableHead>
        <TableHead>Status</TableHead>
        <TableHead>Latency</TableHead>
        <TableHead>Last Update</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Sportradar</TableCell>
        <TableCell className="font-mono">2 - 1</TableCell>
        <TableCell><Badge>Primary</Badge></TableCell>
        <TableCell className="font-mono text-xs">120ms</TableCell>
        <TableCell className="text-xs text-muted-foreground">2s ago</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>SportsDataIO</TableCell>
        <TableCell className="font-mono">2 - 1</TableCell>
        <TableCell><Badge variant="outline">Secondary</Badge></TableCell>
        <TableCell className="font-mono text-xs">95ms</TableCell>
        <TableCell className="text-xs text-muted-foreground">3s ago</TableCell>
      </TableRow>
      <TableRow className="bg-destructive/10">
        <TableCell>API-Sports</TableCell>
        <TableCell className="font-mono text-destructive">1 - 1</TableCell>
        <TableCell><Badge variant="secondary">Delayed</Badge></TableCell>
        <TableCell className="font-mono text-xs text-destructive">450ms</TableCell>
        <TableCell className="text-xs text-muted-foreground">12s ago</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>
```

---

### 1.5 ScheduleCalendar
**Назначение:** Расписание матчей из всех источников

**Функциональность:**
- Календарный вид с матчами
- Фильтры по видам спорта, лигам
- Переключение между календарем и списком
- Индикация источника данных
- Напоминания и уведомления

**Компоненты Shadcn UI:**
- `Calendar` — календарь
- `Card` — карточки матчей
- `Tabs` — переключение видов
- `Select` — фильтры
- `Switch` — настройки уведомлений

**Дизайн:**
```typescript
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";

<div className="terminal-card p-4">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-sm font-semibold uppercase">Match Schedule</h3>
    <div className="flex gap-2">
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Sports" />
        </SelectTrigger>
      </Select>
      <Select>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="All Leagues" />
        </SelectTrigger>
      </Select>
    </div>
  </div>
  
  <Tabs defaultValue="calendar">
    <TabsList>
      <TabsTrigger value="calendar">Calendar</TabsTrigger>
      <TabsTrigger value="list">List</TabsTrigger>
    </TabsList>
    
    <TabsContent value="calendar">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="rounded-md border"
      />
    </TabsContent>
    
    <TabsContent value="list">
      <div className="space-y-2">
        {matches.map(match => (
          <Card key={match.id} className="p-3 hover-lift">
            {/* Match info */}
          </Card>
        ))}
      </div>
    </TabsContent>
  </Tabs>
</div>
```

---

### 1.6 OddsAggregator
**Назначение:** Агрегация коэффициентов из разных источников

**Функциональность:**
- Отображение коэффициентов из всех источников
- Выявление лучших коэффициентов
- Движение линий во времени
- Индикация value ставок
- Алерты при значительных изменениях

**Компоненты Shadcn UI:**
- `Table` — таблица коэффициентов
- `Badge` — лучший коэффициент
- `Alert` — алерты изменений
- `ChartContainer` + Recharts — график движения

**Структура:**
```typescript
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/components/ui/alert";
import { ChartContainer } from "@/components/ui/chart";
import { LineChart, Line } from "recharts";

<div className="terminal-card p-4">
  <h3 className="text-sm font-semibold mb-3 uppercase">
    Odds Comparison: Arsenal vs Chelsea
  </h3>
  
  <Table>
    <TableHeader>
      <TableRow>
        <TableHead>Source</TableHead>
        <TableHead>Home</TableHead>
        <TableHead>Draw</TableHead>
        <TableHead>Away</TableHead>
        <TableHead>Best</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Sportradar</TableCell>
        <TableCell className="font-mono">2.15</TableCell>
        <TableCell className="font-mono">3.40</TableCell>
        <TableCell className="font-mono">3.20</TableCell>
        <TableCell><Badge className="text-[10px]">Home</Badge></TableCell>
      </TableRow>
      <TableRow>
        <TableCell>SportsDataIO</TableCell>
        <TableCell className="font-mono text-signal">2.25</TableCell>
        <TableCell className="font-mono">3.35</TableCell>
        <TableCell className="font-mono">3.15</TableCell>
        <TableCell><Badge variant="default" className="text-[10px]">Best Home</Badge></TableCell>
      </TableRow>
    </TableBody>
  </Table>
  
  <div className="mt-4">
    <ChartContainer config={chartConfig} className="h-[200px]">
      <LineChart data={oddsHistory}>
        <Line dataKey="home" stroke="var(--color-home)" />
        <Line dataKey="away" stroke="var(--color-away)" />
      </LineChart>
    </ChartContainer>
  </div>
</div>
```

---

### 1.7 SportSpecificWidgets
**Назначение:** Специализированные виджеты для разных видов спорта

**Football Widget:**
- Live commentary
- Formations (4-3-3, 4-4-2)
- Heat maps
- Player positions

**NBA Widget:**
- Quarter scores
- Player stats
- Team comparisons
- Play-by-play

**Tennis Widget:**
- Set scores
- Game-by-game
- Serve statistics
- Head-to-head

**Компоненты Shadcn UI:**
- `Card` — контейнер виджета
- `Tabs` — переключение секций
- `Progress` — статистика
- `Table` — детальные данные

---

### 1.8 DataQualityIndicator
**Назначение:** Индикация качества данных из источников

**Функциональность:**
- Визуализация latency
- Показ freshness данных
- Индикация coverage (какие виды спорта покрывает источник)
- Рейтинг надежности
- История аптайма

**Компоненты Shadcn UI:**
- `Badge` — статус источника
- `Progress` — метрики качества
- `Tooltip` — детали
- `Alert` — предупреждения

**Дизайн:**
```typescript
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

<div className="space-y-2">
  {sources.map(source => (
    <div key={source.id} className="flex items-center justify-between p-2 border border-border">
      <div className="flex items-center gap-2">
        <Badge variant={source.quality > 90 ? 'default' : 'secondary'}>
          {source.name}
        </Badge>
        <Tooltip>
          <TooltipTrigger>
            <span className="text-xs font-mono text-muted-foreground">
              {source.latency}ms
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>Average latency: {source.latency}ms</p>
            <p>Uptime: {source.uptime}%</p>
          </TooltipContent>
        </Tooltip>
      </div>
      
      <div className="flex items-center gap-2">
        <Progress value={source.quality} className="w-20 h-2" />
        <span className="text-xs font-mono">{source.quality}%</span>
      </div>
    </div>
  ))}
</div>
```

---

## 2. Dashboard Transformation (Преобразование дашборда)

### 2.1 New Layout Structure

**Hero Section:**
- `UnifiedSportsFeed` как главный компонент (full width)
- Быстрое переключение между видами спорта
- Live updates counter

**Main Grid (12 columns):**

```
┌─────────────────────────────────────────────┐
│     UnifiedSportsFeed (12 cols)             │
│     [Football] [NBA] [Tennis] [E-sports]    │
└─────────────────────────────────────────────┘

┌──────────────────────────┬─────────────────┐
│  MultiSourceComparison   │  OddsAggregator │
│  (8 cols)                │  (4 cols)       │
│                          │                 │
└──────────────────────────┴─────────────────┘

┌──────────────────────────┬─────────────────┐
│  ScheduleCalendar        │  DataQuality    │
│  (8 cols)                │  Indicator      │
│                          │  (4 cols)       │
└──────────────────────────┴─────────────────┘
```

**Sidebar Navigation (Enhanced):**
- All Sports (новая секция)
- Live Matches
- Schedule
- Odds Comparison
- Data Sources
- Settings

### 2.2 Page Structure

```typescript
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";
import { UnifiedSportsFeed } from "@/components/UnifiedSportsFeed";
import { MultiSourceComparison } from "@/components/MultiSourceComparison";
import { OddsAggregator } from "@/components/OddsAggregator";
import { ScheduleCalendar } from "@/components/ScheduleCalendar";
import { DataQualityIndicator } from "@/components/DataQualityIndicator";

const MultiSportDashboard = () => {
  return (
    <div className="min-h-screen bg-background grid-pattern flex">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Header />
        
        <main className="flex-1 p-3 overflow-auto">
          <div className="max-w-[2000px] mx-auto space-y-3">
            
            {/* Hero: Unified Sports Feed */}
            <div className="col-span-12">
              <UnifiedSportsFeed />
            </div>
            
            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-3">
              
              {/* Multi-Source Comparison */}
              <div className="col-span-8">
                <MultiSourceComparison />
              </div>
              
              {/* Odds Aggregator */}
              <div className="col-span-4">
                <OddsAggregator />
              </div>
              
              {/* Schedule Calendar */}
              <div className="col-span-8">
                <ScheduleCalendar />
              </div>
              
              {/* Data Quality Indicator */}
              <div className="col-span-4">
                <DataQualityIndicator />
              </div>
              
            </div>
            
          </div>
        </main>
      </div>
    </div>
  );
};

export default MultiSportDashboard;
```

---

## 3. Data Integration Layer

### 3.1 API Service Structure

```typescript
// services/dataSourceService.ts

interface DataSourceConfig {
  sportradar: {
    apiKey: string;
    baseUrl: string;
    coverage: string[]; // ['football', 'nba', 'tennis', ...]
    priority: number;
  };
  sportsDataIO: {
    apiKey: string;
    baseUrl: string;
    coverage: string[];
    priority: number;
  };
  apiSports: {
    apiKey: string;
    baseUrl: string;
    coverage: string[];
    priority: number;
  };
}

class DataSourceService {
  async fetchLiveScores(sport: string): Promise<Match[]> {
    // 1. Fetch from all sources in parallel
    const results = await Promise.allSettled([
      this.fetchFromSportradar(sport),
      this.fetchFromSportsDataIO(sport),
      this.fetchFromApiSports(sport),
    ]);
    
    // 2. Normalize data
    const normalized = results
      .filter(r => r.status === 'fulfilled')
      .map(r => this.normalizeData(r.value));
    
    // 3. Merge and resolve conflicts
    return this.mergeData(normalized);
  }
  
  private normalizeData(data: any): Match[] {
    // Convert to unified format
  }
  
  private mergeData(sources: Match[][]): Match[] {
    // Merge by match ID, resolve conflicts by priority
  }
}
```

### 3.2 Real-time Updates Hook

```typescript
// hooks/useMultiSourceData.ts

import { useState, useEffect } from 'react';

export const useMultiSourceData = (sport: string) => {
  const [data, setData] = useState<Match[]>([]);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const service = new DataSourceService();
      const matches = await service.fetchLiveScores(sport);
      const sourceStatus = await service.getSourcesStatus();
      
      setData(matches);
      setSources(sourceStatus);
      setLastUpdate(new Date());
    }, 5000); // Update every 5 seconds
    
    return () => clearInterval(interval);
  }, [sport]);
  
  return { data, sources, lastUpdate };
};
```

---

## 4. Implementation Checklist

### Phase 1: Core Components (Week 1-2)
- [ ] `DataSourceAggregator` — базовая агрегация
- [ ] `UnifiedSportsFeed` — единый фид
- [ ] `LiveScoreCard` — enhanced версия
- [ ] `DataQualityIndicator` — индикаторы качества

### Phase 2: Comparison & Analysis (Week 3-4)
- [ ] `MultiSourceComparison` — сравнение источников
- [ ] `OddsAggregator` — агрегация коэффициентов
- [ ] `ScheduleCalendar` — расписание

### Phase 3: Sport-Specific Features (Week 5-6)
- [ ] `SportSpecificWidgets` — специализированные виджеты
- [ ] Интеграция с реальными API
- [ ] Обработка ошибок и фоллбеки

### Phase 4: Polish & Optimization (Week 7-8)
- [ ] Оптимизация производительности
- [ ] Кэширование данных
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states

---

## 5. Design Tokens & Styling

### 5.1 Color Scheme (уже есть)

```css
--primary: 150 100% 53%;        /* Зеленый для live и value */
--destructive: 0 100% 63%;       /* Красный для алертов */
--muted: 0 0% 16%;              /* Фон карточек */
--foreground: 0 0% 96%;         /* Основной текст */
```

### 5.2 Custom Utilities (добавить)

```css
/* Для индикации источников данных */
.source-sportradar {
  border-left: 2px solid hsl(220 90% 60%);
}

.source-sportsdata {
  border-left: 2px solid hsl(280 70% 60%);
}

.source-apisports {
  border-left: 2px solid hsl(30 90% 60%);
}

/* Для статусов качества */
.quality-excellent {
  @apply text-primary;
}

.quality-good {
  @apply text-yellow-500;
}

.quality-poor {
  @apply text-destructive;
}
```

---

## 6. Key Recommendations

1. **Приоритет источников:**
   - Sportradar — primary для большинства видов спорта
   - SportsDataIO — secondary, используется для cross-validation
   - API-Sports — tertiary, используется для дополнительных данных

2. **Обработка конфликтов:**
   - При расхождении данных — показывать alert
   - Использовать приоритет источников для разрешения
   - Визуализировать все варианты в MultiSourceComparison

3. **Производительность:**
   - Кэшировать данные на 3-5 секунд
   - Использовать React Query для управления состоянием
   - Lazy loading для тяжелых компонентов

4. **UX:**
   - Всегда показывать источник данных
   - Индикация задержки и качества
   - Плавные переходы при обновлении данных
   - Loading states для всех асинхронных операций

---

## Заключение

Данный дизайн компонентов позволяет:
- Агрегировать данные из множественных источников
- Визуализировать качество и расхождения данных
- Предоставлять единый интерфейс для всех видов спорта
- Масштабироваться при добавлении новых источников

Все компоненты реализуются на базе Shadcn UI без дополнительных UI-библиотек.

