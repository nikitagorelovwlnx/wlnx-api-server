# Prompts API

API for managing conversation prompts for form interview stages. Allows clients to manage and retrieve prompts for 5-stage wellness interviews.

## Base URL

```
/api/prompts
```

## Endpoints

### GET /api/prompts/wellness-stages
Get wellness stages configuration for telegram bot integration.

**Query Parameters:**
- `locale` (optional): Locale (default: `en-US`)

**Response:**
```json
{
  "success": true,
  "data": {
    "systemPrompt": "You are a wellness data analyst. Extract structured health data...",
    "stages": [
      {
        "stage": "demographics_baseline",
        "systemPrompt": "Validation prompt for this stage",
        "stagePrompt": "STAGE: DEMOGRAPHICS COLLECTION\n\nCollect basic demographic information...",
        "introductionMessage": "Let's get acquainted! 😊 Tell me about yourself...",
        "requiredFields": ["age", "gender"],
        "completionCriteria": "Perfect! Now I have your basic info..."
      }
    ]
  },
  "version": "1.0.0",
  "lastUpdated": "2024-01-01T00:00:00.000Z"
}
```

### GET /api/prompts
Get all prompts with optional filters.

**Query Parameters:**
- `form_name` (optional): Filter by form name (e.g., `wellness_intake`)
- `stage_id` (optional): Filter by stage ID (e.g., `S1_demographics`)
- `locale` (optional): Locale (default: `en-US`)
- `is_active` (optional): Filter by active status (default: `true`)

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": [
      {
        "id": "uuid",
        "name": "Demographics Collection",
        "description": "Collect basic demographic information",
        "stage_id": "S1_demographics",
        "form_name": "wellness_intake",
        "version": "1.0.0",
        "locale": "en-US",
        "content": {
          "main_prompt": "Hello! Let's start with some basic information...",
          "follow_up_prompt": "I still need some information...",
          "validation_prompt": "I notice there might be an issue...",
          "completion_prompt": "Great! I have your basic information..."
        },
        "metadata": {
          "tone": "friendly",
          "style": "conversational",
          "length": "medium",
          "difficulty": "simple"
        },
        "is_active": true,
        "created_at": "2024-01-01T00:00:00.000Z",
        "updated_at": "2024-01-01T00:00:00.000Z"
      }
    ],
    "total": 1
  }
}
```

### GET /api/prompts/forms/:formName
Get all prompts for a specific form (optimized for bot consumption).

**Path Parameters:**
- `formName`: Form name (e.g., `wellness_intake`)

**Query Parameters:**
- `locale` (optional): Locale (default: `en-US`)
- `version` (optional): Prompt version (default: latest)

**Response:**
```json
{
  "success": true,
  "data": {
    "form_name": "wellness_intake",
    "version": "1.0.0",
    "locale": "en-US",
    "stages": [
      {
        "stage_id": "S1_demographics",
        "stage_name": "Demographics Collection",
        "prompts": {
          "stage_id": "S1_demographics",
          "form_name": "wellness_intake",
          "main_prompt": "Hello! Let's start with some basic information...",
          "follow_up_prompt": "I still need some information...",
          "validation_prompt": "I notice there might be an issue...",
          "completion_prompt": "Great! I have your basic information...",
          "metadata": {
            "tone": "friendly",
            "style": "conversational"
          }
        }
      }
    ]
  }
}
```

### GET /api/prompts/forms/:formName/stages/:stageId
Get prompt for a specific form stage (for bot usage).

**Path Parameters:**
- `formName`: Form name (e.g., `wellness_intake`)
- `stageId`: Stage ID (e.g., `S1_demographics`)

**Query Parameters:**
- `locale` (optional): Locale (default: `en-US`)
- `version` (optional): Prompt version (default: latest)

**Response:**
```json
{
  "success": true,
  "data": {
    "stage_id": "S1_demographics",
    "form_name": "wellness_intake",
    "main_prompt": "Hello! Let's start with some basic information about you...",
    "follow_up_prompt": "I still need some information to continue...",
    "validation_prompt": "I notice there might be an issue with the information...",
    "completion_prompt": "Great! I have your basic information...",
    "metadata": {
      "tone": "friendly",
      "style": "conversational",
      "length": "medium"
    }
  }
}
```

### POST /api/prompts
Create a new prompt.

**Request Body:**
```json
{
  "name": "Custom Stage Prompt",
  "description": "A custom prompt for a specific stage",
  "stage_id": "S1_demographics",
  "form_name": "wellness_intake",
  "version": "1.0.0",
  "locale": "en-US",
  "content": {
    "main_prompt": "Let's collect some information...",
    "follow_up_prompt": "Could you also provide...",
    "validation_prompt": "Please check your input...",
    "completion_prompt": "Thank you for the information..."
  },
  "metadata": {
    "tone": "professional",
    "style": "formal",
    "length": "short"
  }
}
```

### PUT /api/prompts/:id
Update an existing prompt.

**Path Parameters:**
- `id`: Prompt ID

**Request Body:**
```json
{
  "name": "Updated Prompt Name",
  "content": {
    "main_prompt": "Updated main prompt text..."
  },
  "metadata": {
    "tone": "casual"
  }
}
```

### POST /api/prompts/forms/:formName/stages/:stageId/versions
Create a new version of a stage prompt.

**Path Parameters:**
- `formName`: Form name
- `stageId`: Stage ID

**Request Body:**
```json
{
  "version": "1.1.0",
  "locale": "en-US",
  "content": {
    "main_prompt": "Updated prompt for version 1.1.0..."
  }
}
```

### POST /api/prompts/import/wellness
Import default wellness interview prompts.

**Request Body:**
```json
{
  "locale": "en-US"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "prompts": [...], // Array of 5 created prompts
    "total": 5
  }
}
```

### DELETE /api/prompts/:id
Deactivate a prompt.

**Path Parameters:**
- `id`: Prompt ID

## Prompt Structure

### Content Object
Each prompt contains four types of messages:

- **`main_prompt`**: The primary conversation starter for the stage
- **`follow_up_prompt`**: Used when additional information is needed
- **`validation_prompt`**: Used when user input fails validation
- **`completion_prompt`**: Used when the stage is successfully completed

### Metadata Object
Optional metadata for prompt customization:

- **`tone`**: `"friendly"`, `"professional"`, `"casual"`
- **`style`**: `"conversational"`, `"formal"`, `"medical"`
- **`length`**: `"short"`, `"medium"`, `"long"`
- **`difficulty`**: `"simple"`, `"intermediate"`, `"advanced"`

## Bot Integration Examples

### Get All Prompts for Interview
```javascript
const response = await fetch('/api/prompts/forms/wellness_intake?locale=en-US');
const { data } = await response.json();

// Use prompts for 5-stage interview
for (const stage of data.stages) {
  const prompts = stage.prompts;
  await conductStage(stage.stage_id, prompts);
}
```

### Get Single Stage Prompt
```javascript
const response = await fetch('/api/prompts/forms/wellness_intake/stages/S1_demographics');
const { data } = await response.json();

// Send main prompt to user
await sendMessage(data.main_prompt);

// Use follow-up if needed
if (needsMoreInfo) {
  await sendMessage(data.follow_up_prompt.replace('{missing_fields}', 'age and weight'));
}

// Use validation prompt if input is invalid
if (validationFails) {
  await sendMessage(data.validation_prompt.replace('{field_name}', 'age'));
}

// Use completion prompt when done
if (stageComplete) {
  await sendMessage(data.completion_prompt);
}
```

## Default Wellness Interview Stages

The system includes default prompts for 5 wellness interview stages:

1. **S1_demographics** - Basic Information (age, gender, weight, height)
2. **S2_lifestyle** - Lifestyle Assessment (sleep, stress, activity, work)
3. **S3_health_goals** - Goals and Preferences (health goals, activities, nutrition)
4. **S4_medical** - Medical Information (conditions, medications, contraindications)
5. **S5_additional** - Additional Information (location, optional data)

Each stage includes conversational prompts designed to:
- Collect specific field data from the form schema
- Handle follow-up questions naturally
- Provide appropriate validation messages
- Smoothly transition between stages

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (missing required fields)
- `404` - Not Found (prompt/form doesn't exist)
- `500` - Internal Server Error
