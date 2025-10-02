# Coaches API

This API manages wellness coach personas and their prompt content. Each coach represents a different coaching style or personality that can be used in wellness sessions.

**🔑 Authentication:** No authentication required.

## Data Model

### Coach
```typescript
{
  id: string;                    // UUID
  name: string;                  // Coach name/title
  description?: string;          // Coach description
  coach_prompt_content: string;  // Full coach persona prompt
  is_active: boolean;           // Whether coach is active
  tags?: string[];              // Tags for categorization
  created_at: Date;             // Creation timestamp
  updated_at: Date;             // Last update timestamp
}
```

## API Endpoints

**Base URL:** `http://localhost:3000/api`

### GET /coaches
Get all coaches in the system.

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/coaches
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "6f8fd28b-ed36-403e-91c7-00d779ee7796",
      "name": "Default Wellness Coach",
      "description": "Primary wellness coaching persona for user interactions",
      "coach_prompt_content": "You are a supportive and knowledgeable wellness coach. Your role is to:\n\n- Guide users through their wellness journey with empathy and understanding\n- Provide personalized recommendations based on their health data and goals...",
      "is_active": true,
      "tags": ["default", "wellness", "primary"],
      "created_at": "2025-10-02T09:14:54.797Z",
      "updated_at": "2025-10-02T09:14:54.797Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 500: Internal server error

### GET /coaches/:id
Get a specific coach by ID.

**Example cURL:**
```bash
curl -X GET http://localhost:3000/api/coaches/6f8fd28b-ed36-403e-91c7-00d779ee7796
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "6f8fd28b-ed36-403e-91c7-00d779ee7796",
    "name": "Default Wellness Coach",
    "description": "Primary wellness coaching persona for user interactions",
    "coach_prompt_content": "You are a supportive and knowledgeable wellness coach...",
    "is_active": true,
    "tags": ["default", "wellness", "primary"],
    "created_at": "2025-10-02T09:14:54.797Z",
    "updated_at": "2025-10-02T09:14:54.797Z"
  }
}
```

**Status Codes:**
- 200: Coach found
- 404: Coach not found
- 500: Internal server error

### PUT /coaches/:id
Update coach prompt content. **Note:** Only the `coach_prompt_content` field can be updated. Coaches cannot be deleted.

**Request Body:**
```json
{
  "coach_prompt_content": "Updated coach persona prompt content..."
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/coaches/6f8fd28b-ed36-403e-91c7-00d779ee7796 \
  -H "Content-Type: application/json" \
  -d '{
    "coach_prompt_content": "You are an updated wellness coach with enhanced empathy and personalized approach. Focus on building trust and understanding each user'\''s unique wellness journey."
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "6f8fd28b-ed36-403e-91c7-00d779ee7796",
    "name": "Default Wellness Coach",
    "description": "Primary wellness coaching persona for user interactions",
    "coach_prompt_content": "You are an updated wellness coach with enhanced empathy and personalized approach...",
    "is_active": true,
    "tags": ["default", "wellness", "primary"],
    "created_at": "2025-10-02T09:14:54.797Z",
    "updated_at": "2025-10-02T09:16:45.929Z"
  },
  "message": "Coach prompt updated successfully"
}
```

**Status Codes:**
- 200: Coach updated successfully
- 400: Invalid request body or missing coach_prompt_content
- 404: Coach not found
- 500: Internal server error

## Usage Examples

### Get All Coaches
```bash
curl -X GET http://localhost:3000/api/coaches
```

### Get Specific Coach
```bash
curl -X GET http://localhost:3000/api/coaches/COACH_ID
```

### Update Coach Prompt
```bash
curl -X PUT http://localhost:3000/api/coaches/COACH_ID \
  -H "Content-Type: application/json" \
  -d '{
    "coach_prompt_content": "Your new coach persona prompt here..."
  }'
```

## Integration with Custom Prompts

Coaches are linked to custom prompts through a 1-1 relationship in the database. Each custom prompt can be associated with a specific coach, but this relationship is managed internally and not exposed through the Coaches API.

## Database Schema

**Table Structure:**
```sql
CREATE TABLE coaches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  coach_prompt_content TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Default Data

The system automatically creates a default wellness coach on first setup:

- **Name**: "Default Wellness Coach"
- **Description**: "Primary wellness coaching persona for user interactions"
- **Tags**: ["default", "wellness", "primary"]
- **Active**: true

## Error Handling

All endpoints return standardized error responses:

```json
{
  "success": false,
  "error": "Error message description"
}
```

Common error scenarios:
- **400 Bad Request**: Missing or invalid coach_prompt_content
- **404 Not Found**: Coach ID not found
- **500 Internal Server Error**: Database or server issues

## Limitations

- **No Creation**: New coaches cannot be created through the API
- **No Deletion**: Coaches cannot be deleted through the API
- **Limited Updates**: Only `coach_prompt_content` can be updated
- **No Deactivation**: Coaches cannot be deactivated through the API

These limitations ensure system stability and prevent accidental loss of coach data.
