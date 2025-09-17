# Wellness Session API

This API handles wellness coaching sessions that are pushed from external services. Each session contains a full transcription of the conversation and a summary generated externally.

**🔑 Authentication:** This API uses **email-based identification** instead of traditional authentication. No JWT tokens required.

## Data Model

### WellnessSession
```typescript
{
  id: string;              // UUID
  user_id: string;         // Email address of the user
  transcription: string;   // Full conversation transcript
  summary: string;         // External summary of the interview
  created_at: Date;        // Creation timestamp
  updated_at: Date;        // Last update timestamp
}
```

## API Endpoints

**Base URL:** `http://localhost:3000/api`

All endpoints use email addresses as user identifiers. No authentication headers required.

### POST /interviews
Create a new wellness coaching session.

**Request Body:**
```json
{
  "email": "user@example.com",
  "transcription": "Full conversation transcript from wellness coach session...",
  "summary": "Summary of the wellness coaching session including key insights..."
}
```

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "transcription": "Coach: How are you feeling today? Client: I feel stressed about work...",
    "summary": "Client discussed work-related stress. Recommended mindfulness techniques."
  }'
```

**Response:**
```json
{
  "result": {
    "id": "b1596aee-12e1-4698-97fb-b21d0fc644b0",
    "user_id": "user@example.com",
    "transcription": "Full conversation transcript...",
    "summary": "Summary of the session...",
    "created_at": "2025-09-17T00:50:26.537Z",
    "updated_at": "2025-09-17T00:50:26.537Z"
  }
}
```

**Status Codes:**
- 201: Interview created successfully
- 400: Missing required fields (email, transcription, or summary)
- 500: Internal server error

### GET /interviews
Get all interview results from the system. Can optionally filter by user email.

**Query Parameters:**
- `email` (optional): Email address to filter by specific user
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Get all interviews:**
```bash
curl -X GET "http://localhost:3000/api/interviews"
```

**Filter by specific user:**
```bash
curl -X GET "http://localhost:3000/api/interviews?email=user@example.com&limit=10&offset=0"
```

**Response:**
```json
{
  "results": [
    {
      "id": "b1596aee-12e1-4698-97fb-b21d0fc644b0",
      "user_id": "user@example.com",
      "transcription": "Full conversation transcript...",
      "summary": "Summary of the session...",
      "created_at": "2025-09-17T00:50:26.537Z",
      "updated_at": "2025-09-17T00:50:26.537Z"
    }
  ]
}
```

**Status Codes:**
- 200: Success
- 500: Internal server error

### GET /interviews/:id
Get a specific interview result by ID and email.

**Query Parameters:**
- `email` (required): Email address of the user who owns the interview

**Example cURL:**
```bash
curl -X GET "http://localhost:3000/api/interviews/b1596aee-12e1-4698-97fb-b21d0fc644b0?email=user@example.com"
```

**Response:**
```json
{
  "result": {
    "id": "b1596aee-12e1-4698-97fb-b21d0fc644b0",
    "user_id": "user@example.com",
    "transcription": "Full conversation transcript...",
    "summary": "Summary of the session...",
    "created_at": "2025-09-17T00:50:26.537Z",
    "updated_at": "2025-09-17T00:50:26.537Z"
  }
}
```

**Status Codes:**
- 200: Interview found
- 400: Missing email parameter
- 404: Interview not found or not owned by user
- 500: Internal server error

### PUT /interviews/:id
Update an existing interview result.

**Request Body:**
```json
{
  "email": "user@example.com",
  "transcription": "Updated conversation transcript...",
  "summary": "Updated summary..."
}
```

**Example cURL:**
```bash
curl -X PUT http://localhost:3000/api/interviews/b1596aee-12e1-4698-97fb-b21d0fc644b0 \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "transcription": "Updated conversation transcript with more details...",
    "summary": "Updated summary with additional insights..."
  }'
```

**Response:**
```json
{
  "result": {
    "id": "b1596aee-12e1-4698-97fb-b21d0fc644b0",
    "user_id": "user@example.com",
    "transcription": "Updated conversation transcript...",
    "summary": "Updated summary...",
    "created_at": "2025-09-17T00:50:26.537Z",
    "updated_at": "2025-09-17T00:51:30.123Z"
  }
}
```

**Status Codes:**
- 200: Interview updated successfully
- 400: Missing email parameter
- 404: Interview not found or not owned by user
- 500: Internal server error

### DELETE /interviews/:id
Delete an interview result.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Example cURL:**
```bash
curl -X DELETE http://localhost:3000/api/interviews/b1596aee-12e1-4698-97fb-b21d0fc644b0 \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com"}'
```

**Response:**
```json
{
  "message": "Interview result deleted successfully"
}
```

**Status Codes:**
- 200: Interview deleted successfully
- 400: Missing email parameter
- 404: Interview not found or not owned by user
- 500: Internal server error

## Quick Start for AI Agents

### Creating an Interview
```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "transcription": "Coach: How was your week? Client: It was stressful with work deadlines. Coach: Let'\''s explore some coping strategies...",
    "summary": "Client reported work stress. Discussed time management and mindfulness techniques. Recommended daily meditation practice."
  }'
```

### Retrieving All Interviews
```bash
curl -X GET "http://localhost:3000/api/interviews"
```

### Retrieving Interviews for Specific User
```bash
curl -X GET "http://localhost:3000/api/interviews?email=client@example.com"
```

### Retrieving a Specific Interview
```bash
curl -X GET "http://localhost:3000/api/interviews/INTERVIEW_ID?email=client@example.com"
```

### Updating an Interview
```bash
curl -X PUT http://localhost:3000/api/interviews/INTERVIEW_ID \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "transcription": "Updated transcript...",
    "summary": "Updated summary..."
  }'
```

### Deleting an Interview
```bash
curl -X DELETE http://localhost:3000/api/interviews/INTERVIEW_ID \
  -H "Content-Type: application/json" \
  -d '{"email": "client@example.com"}'
```

## Usage for External Services

External wellness coaching services should:

1. **No Authentication Required** - Simply include the user's email in each request
2. Use POST `/interviews` to save new interview transcriptions and summaries
3. Use GET `/interviews` to retrieve interview history for a user
4. All data is automatically separated by email address

## Database Schema

**Current Schema (after migrations):**
- Migration `005_update_interview_results_for_wellness.ts`: Updated schema for wellness coaching
  - Removed: `title`, `content`, `metadata` columns
  - Added: `transcription` (text, not null), `summary` (text, not null)
- Migration `006_change_user_id_to_email.ts`: Changed user identification
  - Modified: `user_id` column from UUID to VARCHAR(255) to store email addresses
  - Removed: Foreign key constraint to users table
- Migration `007_drop_integration_tables.ts`: Removed integration functionality
  - Dropped: `calendar_integrations`, `telegram_integrations` tables
- Migration `008_rename_to_wellness_sessions.ts`: Renamed for clarity
  - Renamed: `interview_results` → `wellness_sessions`
  - Updated indexes accordingly

**Final Table Structure:**
```sql
CREATE TABLE wellness_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id VARCHAR(255) NOT NULL, -- Email address
  transcription TEXT NOT NULL,
  summary TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_wellness_sessions_user_id ON wellness_sessions(user_id);
CREATE INDEX idx_wellness_sessions_created_at ON wellness_sessions(created_at);
```

## Environment Setup

**Development:**
```bash
npm install
npm run dev
# Server runs on http://localhost:3000
```

**Testing:**
```bash
npm test
```

**Docker:**
```bash
docker-compose -f docker-compose.dev.yml up
```

## Error Handling

All endpoints return standardized error responses:

```json
{
  "error": "Error message description"
}
```

Common error scenarios:
- **400 Bad Request**: Missing required fields (email, transcription, summary)
- **404 Not Found**: Interview not found or user email mismatch
- **500 Internal Server Error**: Database or server issues
