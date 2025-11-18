# Frontend Architecture Guide

## Overview

Краткий обзор архитектуры фронтенда Data Edge. Документ описывает основные принципы, паттерны и правила организации кода.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI Library**: React 18
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Zustand
- **Data Fetching**: React Query (TanStack Query)
- **Type Safety**: TypeScript
- **Form Handling**: React Hook Form + Zod

## Directory Structure

```
/app                      # Next.js App Router pages
  /[route]                # Page routes
    page.tsx              # Page component (Client component)
  layout.tsx              # Root layout
  providers.tsx           # Global providers wrapper
  globals.css             # Global styles

/src
  /components             # React components
    /ui                   # shadcn/ui primitives
    /[Feature]Component   # Feature-specific components
  /hooks                  # Custom React hooks
  /store                  # Zustand stores
  /lib                    # Utility functions
  /types                  # TypeScript type definitions
  /data                   # Mock data & constants
```

## State Management

### Типы состояния

**1. Global State (Zustand)**

- Используется для состояния, разделяемого между несвязанными компонентами
- Текущие store: `matchStore` (выбранный матч, состояние диалога)
- Правило: одна ответственность на store

**2. Server State (React Query)**

- Для всех запросов к API
- Автоматическое кэширование и рефетч
- Управление loading/error состояниями

**3. Local State (useState/useReducer)**

- UI-состояние внутри компонента
- Формы, тогглы, временные данные
- Не требует персистентности

**4. URL State (searchParams)**

- Для шарабельных фильтров, пагинации, сортировки
- Должно быть в URL если пользователь может захотеть поделиться ссылкой

## Архитектурные паттерны

### Container/Presenter Pattern

- **Container (Smart)**: управляет данными и state, содержит бизнес-логику
- **Presenter (Dumb)**: получает props, отвечает только за UI, без логики

### Дерево решений для State

```
Используется в нескольких routes?
├─ Да → Zustand store
└─ Нет → Используется в 3+ несвязанных компонентах?
    ├─ Да → Zustand store
    └─ Нет → Серверные данные?
        ├─ Да → React Query
        └─ Нет → useState
```

### Иерархия данных

1. **URL State** → shareable, bookmarkable
2. **Zustand Store** → глобальное UI состояние
3. **React Query** → кэш серверных данных
4. **Props** → передача сверху вниз
5. **Local State** → внутри компонента

## Naming Conventions

### Компоненты и файлы

- **Components**: `PascalCase` (`MatchCard`, `UnifiedSportsFeed`)
- **Hooks**: `camelCase` + `use` префикс (`useMatches`, `useRealtimeData`)
- **Stores**: `camelCase` + `use` + `Store` (`useMatchStore`)
- **Types**: `PascalCase` (`Match`, `ValueSignal`)
- **Props**: Component + `Props` (`MatchCardProps`)

### Event Handlers

- В компоненте: `handle` префикс (`handleClick`, `handleSubmit`)
- В props: `on` префикс (`onClick`, `onSubmit`)

### Структура компонента

1. Imports (external → UI → hooks → types → utils)
2. Types/Interfaces
3. Component function
4. Hooks
5. Event handlers
6. Derived state
7. Effects
8. Return JSX

## Custom Hooks

### Типы кастомных хуков

**1. Data Fetching Hooks**

- Обертки над React Query
- Расположение: `src/hooks/use[Entity].ts`
- Возвращают `{ data, isLoading, error }`

**2. Store Selector Hooks**

- Селекторы из Zustand stores
- Оптимизация re-renders
- Инкапсуляция логики доступа к store

**3. Composite Hooks**

- Комбинируют несколько хуков
- Содержат переиспользуемую логику
- Возвращают набор данных и функций

## Performance

### Оптимизация производительности

**1. Memoization**

- `useMemo` для дорогих вычислений
- `useCallback` для коллбеков в props
- `memo()` для компонентов

**2. Code Splitting**

- `lazy()` для тяжелых компонентов
- `Suspense` с fallback
- Динамические импорты

**3. Zustand Selectors**

- Используй селекторы вместо деструктуризации
- Подписывайся только на нужные части store
- Избегай лишних re-renders

## Error Handling

### Стратегия обработки ошибок

**1. Error Boundaries**

- Next.js `error.tsx` для route-level errors
- Custom ErrorBoundary для компонентов
- Graceful fallback UI

**2. React Query Errors**

- Проверка `isError` состояния
- Отображение `error` message
- Retry стратегия в конфигурации

**3. Validation**

- Zod схемы для форм
- TypeScript для compile-time проверок
- Runtime валидация API responses

## Best Practices

### Do's ✅

- Используй TypeScript strict mode
- Типизируй все props и state
- Следуй принципу single responsibility
- Извлекай переиспользуемую логику в хуки
- Оптимизируй только при необходимости
- Используй semantic HTML
- Добавляй ARIA атрибуты для a11y

### Don'ts ❌

- Не мутируй state напрямую
- Не используй `any` тип
- Не делай prop drilling (используй store/context)
- Не забывай про loading/error состояния
- Не используй `console.log` в production
- Не смешивай бизнес-логику с UI

## Development Workflow

### Перед коммитом

1. `npm run lint` - проверка линтера
2. `npm run format` - форматирование
3. `npx tsc --noEmit` - проверка типов
4. Проверь, что нет warnings

### Создание компонента

1. Определи тип компонента (Container/Presenter)
2. Создай TypeScript интерфейс для props
3. Выбери правильный тип state management
4. Добавь обработку loading/error
5. Оптимизируй при необходимости

## Ресурсы

- [React Documentation](https://react.dev) - официальная документация React
- [Next.js Documentation](https://nextjs.org/docs) - App Router guide
- [Zustand Documentation](https://docs.pmnd.rs/zustand) - state management
- [TanStack Query](https://tanstack.com/query) - server state
- [shadcn/ui](https://ui.shadcn.com) - UI компоненты
- [Tailwind CSS](https://tailwindcss.com) - utility-first CSS
