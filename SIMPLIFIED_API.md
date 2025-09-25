# 🎯 Simplified API Architecture

## ✅ Architecture Changes Implemented

Based on your requirements, I've simplified the API to have:

### 📋 **Form Schema - Single Hardcoded Version**
- **Only 1 endpoint**: `GET /api/form-schemas`
- **Hardcoded schema** in `/src/config/wellnessFormSchema.ts`
- **No API modifications** - schema is read-only
- **Current data structure maintained** - existing interviews with different schemas still work

### 🗣️ **Interview Prompts - Simple Map**
- **Only 1 endpoint**: `GET /api/prompts`  
- **Returns simple map** of 5 stage prompts
- **Hardcoded prompts** in `/src/config/wellnessPrompts.ts`
- **No versioning complexity** - just returns the prompt object

### 💾 **Interview Data Flow**
- `PUT /api/interviews/:id` - `wellness_data` follows current schema from `GET /api/form-schemas`
- **Backwards compatible** - old interviews can have different schema structure
- **No breaking changes** to existing data

## 🔧 Implementation Details

### 1. Form Schema Endpoint
```javascript
GET /api/form-schemas
```
**Response:**
```json
{
  "success": true,
  "data": {
    "id": "wellness_intake",
    "name": "wellness_intake", 
    "version": "1.0.0",
    "locale": "en-US",
    "fields": [/* 17 wellness fields */],
    "stages": [/* 5 interview stages */]
  }
}
```

### 2. Prompts Endpoint  
```javascript
GET /api/prompts
```
**Response:**
```json
{
  "success": true,
  "data": {
    "demographics_baseline": {
      "main_prompt": "Let's get acquainted! 😊 Tell me about yourself...",
      "follow_up_prompt": "Could you also share your {missing_fields}?...",
      "validation_prompt": "I want to make sure I have the correct {field_name}...", 
      "completion_prompt": "Perfect! Now I have your basic info..."
    },
    "biometrics_habits": {
      "main_prompt": "Excellent! Now let's talk about your habits 📊...",
      // ... other prompts
    },
    // ... 3 more stages
  }
}
```

## 📁 Files Structure

### Created/Modified Files:
```
src/config/
├── wellnessFormSchema.ts    # Single hardcoded form schema
└── wellnessPrompts.ts       # Map of 5 stage prompts

src/routes/
├── formSchemas.ts          # Simplified to 1 endpoint
└── prompts.ts              # Simplified to 1 endpoint
```

### Removed Complexity:
- ❌ Database-dependent form schema management  
- ❌ Form schema versioning and CRUD operations
- ❌ Prompt versioning system
- ❌ Multiple prompt endpoints  
- ❌ Dynamic schema creation/updates

## 🎯 Benefits

### ✅ **Simplicity**
- Only 2 endpoints instead of 15+
- No database dependencies for schemas/prompts
- No complex versioning logic
- Hardcoded = predictable and fast

### ✅ **Maintainability** 
- Schema changes via code updates (controlled)
- Easy to understand and debug
- No dynamic complexity
- Version control for all changes

### ✅ **Performance**
- No database queries for schemas/prompts
- Instant responses from memory
- No caching complexity needed

### ✅ **Backwards Compatibility**
- Existing interviews unchanged
- `wellness_data` structure evolution supported
- No breaking changes to clients

## 🔄 Usage Examples

### Bot Integration
```typescript
// Get prompts for interview
const prompts = await fetch('/api/prompts').then(r => r.json());

// Use prompts for each stage  
const stage1Prompts = prompts.data.demographics_baseline;
await bot.sendMessage(stage1Prompts.main_prompt);

// Get current form schema
const schema = await fetch('/api/form-schemas').then(r => r.json());
const formFields = schema.data.fields;
```

### Interview Update
```typescript
// wellness_data should match current schema structure
const currentSchema = await fetch('/api/form-schemas').then(r => r.json());

// Update interview with data matching current schema
await fetch(`/api/interviews/${interviewId}`, {
  method: 'PUT',
  body: JSON.stringify({
    email: 'user@example.com',
    wellness_data: {
      age: 30,
      gender: 'male', 
      weight: 75,
      // ... matches current schema fields
    }
  })
});
```

## 📊 Current Schema Structure

### Form Fields (17 total):
- **Demographics**: age, gender, weight, height, location
- **Biometrics**: sleep_duration, sleep_quality, daily_steps, resting_heart_rate, stress_level  
- **Lifestyle**: work_schedule, nutrition_habits
- **Goals**: health_goals, activity_preferences
- **Medical**: chronic_conditions, medications, contraindications

### Interview Stages (5 total):
1. **demographics_baseline** - Basic information
2. **biometrics_habits** - Daily habits and metrics
3. **lifestyle_context** - Work and lifestyle factors  
4. **medical_history** - Health conditions and medications
5. **goals_preferences** - Goals and activity preferences

## ✅ Ready to Use

The simplified API is now:
- **Fully functional** with hardcoded schema and prompts
- **Backwards compatible** with existing interviews
- **Easy to maintain** via code updates
- **Fast and reliable** with no database dependencies

You can start using it immediately - the bot will get consistent prompts and schema structure for new interviews while maintaining compatibility with historical data! 🚀
