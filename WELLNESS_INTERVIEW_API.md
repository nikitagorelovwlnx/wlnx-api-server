# Wellness Coach Interview API

This API handles wellness coach interviews that are pushed from external services. Each interview contains a full transcription of the conversation and a summary generated externally.

## Data Model

### InterviewResult
```typescript
{
  id: string;              // UUID
  user_id: string;         // Reference to user
  transcription: string;   // Full conversation transcript
  summary: string;         // External summary of the interview
  created_at: Date;        // Creation timestamp
  updated_at: Date;        // Last update timestamp
}
```

## API Endpoints

All endpoints require authentication via JWT token in the Authorization header: `Bearer <token>`

### POST /interviews
Create a new wellness coach interview result.

**Request Body:**
```json
{
  "transcription": "Full conversation transcript from wellness coach session...",
  "summary": "Summary of the wellness coaching session including key insights..."
}
```

**Response:**
```json
{
  "result": {
    "id": "uuid",
    "user_id": "user-uuid",
    "transcription": "Full conversation transcript...",
    "summary": "Summary of the session...",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- 201: Interview created successfully
- 400: Missing required fields (transcription or summary)
- 401: Unauthorized (invalid or missing token)
- 500: Internal server error

### GET /interviews
Get all interview results for the authenticated user.

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 50)
- `offset` (optional): Number of results to skip (default: 0)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "user_id": "user-uuid",
      "transcription": "Full conversation transcript...",
      "summary": "Summary of the session...",
      "created_at": "2023-01-01T00:00:00.000Z",
      "updated_at": "2023-01-01T00:00:00.000Z"
    }
  ]
}
```

### GET /interviews/:id
Get a specific interview result by ID.

**Response:**
```json
{
  "result": {
    "id": "uuid",
    "user_id": "user-uuid",
    "transcription": "Full conversation transcript...",
    "summary": "Summary of the session...",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:00.000Z"
  }
}
```

**Status Codes:**
- 200: Interview found
- 404: Interview not found or not owned by user
- 401: Unauthorized

### PUT /interviews/:id
Update an existing interview result.

**Request Body:**
```json
{
  "transcription": "Updated conversation transcript...",
  "summary": "Updated summary..."
}
```

**Response:**
```json
{
  "result": {
    "id": "uuid",
    "user_id": "user-uuid",
    "transcription": "Updated conversation transcript...",
    "summary": "Updated summary...",
    "created_at": "2023-01-01T00:00:00.000Z",
    "updated_at": "2023-01-01T00:00:01.000Z"
  }
}
```

**Status Codes:**
- 200: Interview updated successfully
- 404: Interview not found or not owned by user
- 401: Unauthorized
- 500: Internal server error

### DELETE /interviews/:id
Delete an interview result.

**Response:**
```json
{
  "message": "Interview result deleted successfully"
}
```

**Status Codes:**
- 200: Interview deleted successfully
- 404: Interview not found or not owned by user
- 401: Unauthorized
- 500: Internal server error

## Usage for External Services

External wellness coaching services should use the POST endpoint to push new interview data:

1. Authenticate with the API to get a JWT token for the specific user
2. Send a POST request to `/interviews` with the transcription and summary
3. The interview will be automatically associated with the authenticated user

## Database Schema

The migration `005_update_interview_results_for_wellness.ts` updates the `interview_results` table:
- Removes: `title`, `content`, `metadata` columns
- Adds: `transcription` (text, not null), `summary` (text, not null)
- Maintains: `id`, `user_id`, `created_at`, `updated_at`
- Indexes: `user_id`, `created_at`, `transcription`
