# FormSpec v2 - Quick Start

## What is this?

FormSpec v2 - A versioned form schema management system integrated into WLNX API Server. Allows clients to retrieve form schemas via API and render UI based on them.

## In 3 minutes

### 1. Start server
```bash
# If you have Docker
docker-compose -f docker-compose.dev.yml up -d postgres-dev
npm run migrate
npm run dev

# Or without Docker (PostgreSQL required)
npm run setup
```

### 2. Import wellness schema
```bash
curl -X POST http://localhost:3000/api/form-schemas/import/wellness
```

### 3. Get schema for client
```bash
curl http://localhost:3000/api/form-schemas/wellness_intake
```

## Response structure

```json
{
  "success": true,
  "data": {
    "name": "wellness_intake",
    "version": "1.0.0",
    "fields": [
      {
        "key": "age",
        "type": "number",
        "required": true,
        "validation": { "min": 16, "max": 100 },
        "ui": {
          "label": "Age",
          "group": "demographics",
          "widget": "number"
        }
      }
    ],
    "stages": [
      {
        "id": "S1_demographics", 
        "name": "Basic Information",
        "targets": ["age", "gender", "weight", "height"]
      }
    ]
  }
}
```

## Usage in client

```typescript
// Get schema
const schema = await fetch('/api/form-schemas/wellness_intake').then(r => r.json());

// Render fields by groups
const groups = groupBy(schema.data.fields, 'ui.group');
groups.demographics.forEach(field => renderField(field));

// Dialog stages for telegram bot
schema.data.stages.forEach(stage => {
  console.log(`Stage: ${stage.name}`);
  console.log(`Fields: ${stage.targets.join(', ')}`);
});
```

## Main endpoints

- `GET /api/form-schemas` - all schemas
- `GET /api/form-schemas/wellness_intake` - wellness form
- `POST /api/form-schemas/import/wellness` - import wellness schema

## For telegram bot

Bot can retrieve schemas and use `stages` field for 5-stage dialog:
1. S1_demographics - age, gender, weight, height
2. S2_lifestyle - sleep, stress, activity
3. S3_health_goals - goals and preferences  
4. S4_medical - medical information
5. S5_additional - additional data

Ready! 🚀
