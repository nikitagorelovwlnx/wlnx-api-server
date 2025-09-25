# 🔄 Fallback Prompts System Implementation

## ✅ Реализовано

Создал фоллбэк систему для промптов с возможностью кастомизации:

### 🎯 **Логика работы:**
1. **По умолчанию** - возвращает захардкоженные промпты из `/src/config/wellnessPrompts.ts`
2. **При кастомизации** - сохраняет только изменения в базу данных
3. **При запросе** - мержит кастомные промпты с дефолтными

### 📊 **API Endpoints:**

#### GET /api/prompts
**Fallback система**: БД → Hardcoded defaults

```bash
curl http://localhost:3000/api/prompts
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "demographics_baseline": {
      "question_prompt": "...",
      "extraction_prompt": "...",
      // ... остальные промпты
    }
    // ... остальные 4 этапа
  },
  "customizations": ["demographics_baseline"],  // этапы с кастомными промптами
  "fallback": false                            // true если БД недоступна
}
```

#### PUT /api/prompts/:stageId  
**Обновление промптов** (сохраняет только изменения)

```bash
curl -X PUT http://localhost:3000/api/prompts/demographics_baseline \
  -H "Content-Type: application/json" \
  -d '{
    "question_prompt": "Custom question prompt",
    "main_prompt": "Custom main prompt"
  }'
```

**Response format:**
```json
{
  "success": true,
  "data": {
    "stage_id": "demographics_baseline",
    "prompts": {
      "question_prompt": "Custom question prompt",
      "extraction_prompt": "Default extraction prompt...",
      "main_prompt": "Custom main prompt",
      // ... остальные промпты (default + custom)
    }
  },
  "message": "Prompts for stage 'demographics_baseline' updated successfully"
}
```

## 🗄️ **Database Structure**

### custom_prompts table:
```sql
CREATE TABLE custom_prompts (
  stage_id VARCHAR PRIMARY KEY,
  question_prompt TEXT,
  extraction_prompt TEXT, 
  main_prompt TEXT,
  follow_up_prompt TEXT,
  validation_prompt TEXT,
  completion_prompt TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

**Особенности:**
- Хранит только измененные промпты (NULL для дефолтных)
- stage_id как первичный ключ (1 запись на этап)
- Автоматические timestamps

## 🔧 **Fallback Logic**

### 1. GET /api/prompts - Алгоритм:
```typescript
1. Загружаем default prompts из WELLNESS_PROMPTS
2. Пытаемся получить custom prompts из БД
3. Если БД доступна:
   - Мержим custom с default (custom перезаписывает default)
   - Возвращаем merged result + список кастомизаций
4. Если БД недоступна:
   - Возвращаем только default prompts + fallback: true
```

### 2. PUT /api/prompts/:stageId - Алгоритм:
```typescript
1. Валидируем stage_id существует в WELLNESS_PROMPTS
2. Фильтруем только валидные поля промптов
3. Если запись есть в БД - UPDATE
4. Если записи нет - INSERT
5. Возвращаем merged результат (default + custom)
```

## 🧪 **Тестирование**

### Изначальное состояние (БД пустая):
```bash
curl -s http://localhost:3000/api/prompts | jq '{customizations, fallback}'
# {"customizations": [], "fallback": null}
```

### Добавляем кастомный промпт:
```bash
curl -X PUT http://localhost:3000/api/prompts/demographics_baseline \
  -H "Content-Type: application/json" \
  -d '{"question_prompt": "CUSTOM: Tell me demographics!"}'
# {"success": true, "message": "...updated successfully"}
```

### Проверяем результат:
```bash
curl -s http://localhost:3000/api/prompts | jq '{customizations}'
# {"customizations": ["demographics_baseline"]}
```

### Проверяем merged данные:
```bash
curl -s http://localhost:3000/api/prompts | \
  jq '.data.demographics_baseline.question_prompt'
# "CUSTOM: Tell me demographics!"
```

## ✅ **Преимущества системы**

### 🎯 **Эффективность**
- Дефолтные промпты не хранятся в БД (экономия места)
- Быстрый фоллбэк при недоступности БД
- Только измененные промпты сохраняются

### 🔧 **Гибкость**
- Можно кастомизировать любой промпт любого этапа
- Partial updates - обновляем только нужные поля
- Сохранение дефолтных значений для не измененных полей

### 🛡️ **Надежность**
- Fallback к захардкоженным промптам если БД недоступна
- Валидация stage_id и полей промптов
- TypeScript type safety

### 📈 **Масштабируемость**
- Легко добавить новые этапы в WELLNESS_PROMPTS
- Система автоматически поддержит новые промпты
- API остается стабильным

## 🚀 **Production Ready**

Система полностью готова к продуктиву:
- ✅ Фоллбэк логика реализована
- ✅ PUT API для кастомизации работает
- ✅ Миграция выполнена
- ✅ TypeScript компиляция успешна
- ✅ Тестирование пройдено

**Использование в боте:**
```typescript
// Получаем промпты (всегда работает благодаря fallback)
const prompts = await fetch('/api/prompts').then(r => r.json());

// Используем question_prompt для генерации вопросов
const questionPrompt = prompts.data.demographics_baseline.question_prompt;

// Кастомизируем промпты если нужно
await fetch('/api/prompts/demographics_baseline', {
  method: 'PUT',
  body: JSON.stringify({
    question_prompt: 'My custom question prompt'
  })
});
```

Система готова! 🎉
