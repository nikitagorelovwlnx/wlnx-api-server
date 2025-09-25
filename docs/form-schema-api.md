# Form Schema API

API for managing FormSpec v2 form schemas. Allows clients to retrieve form schemas with metadata for UI rendering.

## Base URL

```
/api/form-schemas
```

## Endpoints

### GET /api/form-schemas

Get all active form schemas.

**Query Parameters:**
- `locale` (optional): Locale (default: `en-US`)

**Response:**
```json
{
  "success": true,
  "data": {
    "schemas": [
      {
        "id": "uuid",
        "name": "wellness_intake",
        "description": "Comprehensive wellness and lifestyle data collection form",
        "version": "1.0.0",
        "locale": "en-US",
        "fields": [...],
        "stages": [...],
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### GET /api/form-schemas/:name

Get specific form schema by name.

**Path Parameters:**
- `name`: Schema name (e.g., `wellness_intake`)

**Query Parameters:**
- `locale` (optional): Locale (default: `en-US`)
- `version` (optional): Schema version (default: latest)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "wellness_intake",
    "description": "Comprehensive wellness and lifestyle data collection form",
    "version": "1.0.0",
    "locale": "en-US",
    "fields": [
      {
        "key": "age",
        "type": "number",
        "required": true,
        "validation": {
          "min": 16,
          "max": 100
        },
        "ui": {
          "label": "Age",
          "placeholder": "Enter your age",
          "group": "demographics",
          "priority": 1,
          "widget": "number"
        }
      }
    ],
    "stages": [
      {
        "id": "S1_demographics",
        "name": "Basic Information",
        "description": "Collect basic demographic data",
        "targets": ["age", "gender", "weight", "height"],
        "order": 1
      }
    ]
  }
}
```

### POST /api/form-schemas

Создать новую схему формы.

**Request Body:**
```json
{
  "name": "custom_form",
  "description": "Описание формы",
  "version": "1.0.0",
  "locale": "ru-RU",
  "fields": [...],
  "stages": [...]
}
```

### POST /api/form-schemas/:name/versions

Создать новую версию существующей схемы.

**Path Parameters:**
- `name`: Имя схемы

**Request Body:**
```json
{
  "version": "1.1.0",
  "description": "Обновленное описание"
}
```

### POST /api/form-schemas/import/wellness

Импортировать схему wellness формы из WELLNESS_FORM_SCHEMA.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "wellness_intake",
    "version": "1.0.0",
    ...
  }
}
```

### DELETE /api/form-schemas/:name

Деактивировать схему формы.

**Path Parameters:**
- `name`: Имя схемы

**Query Parameters:**
- `locale` (optional): Локаль
- `version` (optional): Конкретная версия (иначе все версии)

## Структура данных

### FormSpec

```typescript
interface FormSpec {
  id: string;
  name: string;
  description?: string;
  version: string; // SemVer
  locale: string;
  fields: FieldSpec[];
  stages: StageSpec[];
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}
```

### FieldSpec

```typescript
interface FieldSpec {
  key: string;
  type: "string" | "number" | "boolean" | "date" | "array";
  required?: boolean;
  defaultValue?: any;
  
  // Валидация (для клиента)
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string;
    maxItems?: number; // для массивов
  };
  
  // Значения для select/radio
  enum?: string[];
  
  // UI метаданные для отрисовки клиентом
  ui?: {
    label?: string;
    placeholder?: string;
    description?: string;
    group?: string; // Группировка полей
    priority?: number; // Порядок отображения
    widget?: string; // Тип виджета
    icon?: string;
  };
}
```

### StageSpec

```typescript
interface StageSpec {
  id: string;
  name: string;
  description?: string;
  targets: string[]; // Поля для сбора на этом этапе
  order: number;
}
```

## Группы полей

Поля wellness формы сгруппированы по категориям:

- `demographics` - Демографические данные (возраст, пол, локация)
- `biometrics` - Биометрические данные (вес, рост, пульс)
- `lifestyle` - Образ жизни (сон, стресс, работа)
- `activity` - Физическая активность (шаги, предпочтения)
- `goals` - Цели и предпочтения
- `medical` - Медицинская информация

## Типы виджетов

Клиент может использовать поле `ui.widget` для выбора подходящего компонента:

- `text` - Обычное текстовое поле
- `textarea` - Многострочное текстовое поле
- `number` - Числовое поле
- `select` - Выпадающий список
- `radio` - Радио-кнопки
- `checkbox` - Чекбоксы
- `tags` - Поле для ввода тегов/массивов
- `date` - Поле для ввода даты

## Ошибки

```json
{
  "success": false,
  "error": "Описание ошибки"
}
```

Коды ошибок:
- `400` - Неверные параметры запроса
- `404` - Схема не найдена
- `500` - Внутренняя ошибка сервера
