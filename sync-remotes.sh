#!/bin/bash

# Скрипт для синхронизации ветки dev между origin и test

BRANCH="dev"
CURRENT_BRANCH=$(git branch --show-current)

if [ "$CURRENT_BRANCH" != "$BRANCH" ]; then
    echo "⚠️  Текущая ветка: $CURRENT_BRANCH. Переключись на $BRANCH для синхронизации."
    exit 1
fi

echo "🔄 Синхронизация ветки $BRANCH между origin и test..."

# 1. Получаем изменения из обоих remote
echo "📥 Fetching from origin..."
git fetch origin $BRANCH

echo "📥 Fetching from test..."
git fetch test $BRANCH 2>/dev/null || echo "⚠️  Ветка $BRANCH не найдена в test, будет создана"

# 2. Проверяем, есть ли изменения в origin/dev
ORIGIN_COMMITS=$(git rev-list --count origin/$BRANCH..HEAD 2>/dev/null || echo "0")
LOCAL_COMMITS=$(git rev-list --count origin/$BRANCH..HEAD 2>/dev/null || echo "0")

# 3. Проверяем, есть ли изменения в test/dev
TEST_EXISTS=$(git ls-remote --heads test $BRANCH 2>/dev/null | wc -l)
if [ "$TEST_EXISTS" -gt 0 ]; then
    TEST_COMMITS=$(git rev-list --count test/$BRANCH..HEAD 2>/dev/null || echo "0")
    TEST_BEHIND=$(git rev-list --count HEAD..test/$BRANCH 2>/dev/null || echo "0")
else
    TEST_COMMITS="0"
    TEST_BEHIND="0"
fi

echo ""
echo "📊 Статус:"
echo "   Локальные коммиты (не запушенные в origin): $LOCAL_COMMITS"
if [ "$TEST_EXISTS" -gt 0 ]; then
    echo "   Коммиты в test/$BRANCH (не в локальной): $TEST_BEHIND"
    echo "   Локальные коммиты (не запушенные в test): $TEST_COMMITS"
else
    echo "   Ветка $BRANCH не существует в test"
fi

# 4. Если есть изменения в test, которые нет локально - мерджим
if [ "$TEST_EXISTS" -gt 0 ] && [ "$TEST_BEHIND" -gt 0 ]; then
    echo ""
    echo "🔄 Обнаружены изменения в test/$BRANCH. Мерджим..."
    git merge test/$BRANCH --no-edit || {
        echo "❌ Конфликт при мердже! Разреши конфликты вручную."
        exit 1
    }
fi

# 5. Пушим в origin
if [ "$LOCAL_COMMITS" -gt 0 ]; then
    echo ""
    echo "⬆️  Pushing to origin/$BRANCH..."
    git push origin $BRANCH || {
        echo "❌ Ошибка при push в origin!"
        exit 1
    }
fi

# 6. Пушим в test
if [ "$TEST_EXISTS" -eq 0 ] || [ "$TEST_COMMITS" -gt 0 ]; then
    echo ""
    echo "⬆️  Pushing to test/$BRANCH..."
    if [ "$TEST_EXISTS" -eq 0 ]; then
        # Ветка не существует - создаем
        git push test $BRANCH:$BRANCH || {
            echo "❌ Не удалось создать ветку $BRANCH в test"
            exit 1
        }
    else
        # Ветка существует - пушим
        git push test $BRANCH || {
            echo "❌ Ошибка при push в test/$BRANCH"
            echo "💡 Возможно, нужно сначала получить изменения: git fetch test $BRANCH && git merge test/$BRANCH"
            exit 1
        }
    fi
fi

echo ""
echo "✅ Синхронизация завершена!"

