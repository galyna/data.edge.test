# Инструкция по синхронизации ветки dev между origin и test

## Проблема

Ветка `dev` может быть изменена в двух репозиториях:

- `origin` (https://github.com/galyna/data.edge.git)
- `test` (https://github.com/galyna/data.edge.test.git)

Нужно синхронизировать изменения между ними.

## Решения

### 1. Автоматическая синхронизация (после каждого push)

**Настроено:** Git hooks автоматически синхронизируют оба remote при push в любой из них для ветки `dev`.

**Как работает:**

```bash
git push origin dev   # Автоматически запушит и в test/dev
git push test dev    # Автоматически запушит и в origin/dev
```

**Рекомендуемый способ (пушить в оба одновременно):**

```bash
git push-dev          # Пуш в оба remote одновременно
# или
git push-both dev     # Пуш указанной ветки в оба remote
```

### 2. Ручная синхронизация (скрипт)

**Команда:**

```bash
git sync-remotes
```

или

```bash
./sync-remotes.sh
```

**Что делает скрипт:**

1. ✅ Получает изменения из обоих remote
2. ✅ Проверяет, есть ли новые коммиты в test/dev
3. ✅ Мерджит изменения из test, если они есть
4. ✅ Пушит локальные изменения в оба remote

### 3. Ручная синхронизация (команды)

**Получить изменения из обоих remote:**

```bash
git fetch origin dev
git fetch test dev
```

**Проверить различия:**

```bash
# Что есть в test, но нет локально
git log HEAD..test/dev

# Что есть локально, но нет в test
git log test/dev..HEAD
```

**Синхронизировать:**

```bash
# 1. Если в test есть новые коммиты - мерджим
git merge test/dev

# 2. Пушим в оба remote
git push origin dev
git push test dev
```

## Рекомендуемый workflow

### Ежедневная работа:

1. **Перед началом работы:**

   ```bash
   git sync-remotes  # Получить все изменения
   ```

2. **После коммита:**

   ```bash
   git push origin dev  # Автоматически синхронизируется с test
   ```

3. **Если нужно проверить статус:**
   ```bash
   git fetch origin dev && git fetch test dev
   git log --oneline --graph --all --decorate -10
   ```

### Если кто-то сделал изменения в test:

```bash
# 1. Получить изменения
git fetch test dev

# 2. Мерджить
git merge test/dev

# 3. Разрешить конфликты, если есть
# 4. Запушить в оба remote
git push origin dev
git push test dev
```

## Проверка статуса

**Быстрая проверка:**

```bash
git fetch origin dev && git fetch test dev
git log --oneline --graph origin/dev test/dev HEAD -10
```

**Детальная проверка:**

```bash
./sync-remotes.sh
```

## Troubleshooting

### Конфликты при мердже

Если есть конфликты между origin/dev и test/dev:

```bash
git merge test/dev
# Разрешить конфликты вручную
git add .
git commit -m "Merge test/dev into dev"
git push origin dev
git push test dev
```

### Ветка dev не существует в test

Если ветка dev не существует в test, скрипт попытается создать её:

```bash
git push test dev:dev  # или
git push test dev:main  # если в test используется main вместо dev
```

### Откатить автоматическую синхронизацию

Если hook мешает, можно временно отключить:

```bash
mv .git/hooks/post-push .git/hooks/post-push.disabled
```

Включить обратно:

```bash
mv .git/hooks/post-push.disabled .git/hooks/post-push
chmod +x .git/hooks/post-push
```
