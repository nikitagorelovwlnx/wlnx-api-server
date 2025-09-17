# Migration Guide: Wellness Session API

## Overview

The API has been significantly refactored to focus purely on wellness coaching session storage. Integration functionalities (Calendar, Telegram) and traditional user management have been removed in favor of a simplified email-based identification system.

## What Changed

### 🗑️ Removed
- **Integration endpoints**: `/api/calendar`, `/api/telegram` 
- **User management**: Authentication, user registration, JWT tokens
- **Database tables**: `users`, `calendar_integrations`, `telegram_integrations`
- **Files removed**: All integration services, auth middleware, user service

### ✨ Renamed & Restructured
- **Table**: `interview_results` → `wellness_sessions`
- **Service**: `InterviewService` → `WellnessSessionService`
- **Type**: `InterviewResult` → `WellnessSession`
- **Documentation**: `WELLNESS_INTERVIEW_API.md` → `WELLNESS_SESSION_API.md`

## Database Migration

The following migrations will be applied automatically:

1. **007_drop_integration_tables.ts** - Removes integration tables
2. **008_rename_to_wellness_sessions.ts** - Renames main table to wellness_sessions
3. **009_drop_users_table.ts** - Removes users table

**To apply migrations:**
```bash
npm run migrate
```

## API Changes

### Before (Old API)
- Required user authentication
- Supported calendar/telegram integrations
- Complex user management

### After (New API)
- Simple email-based identification
- Focus on wellness session CRUD operations
- No authentication required

### Current Endpoints
- `GET /api/users` - User statistics from sessions
- `POST /api/interviews` - Create wellness session
- `GET /api/interviews` - Get user sessions (requires email query parameter)
- `GET /api/interviews/:id` - Get specific session (requires email query parameter)
- `PUT /api/interviews/:id` - Update session (requires email in body)
- `DELETE /api/interviews/:id` - Delete session (requires email in body)
- `GET /health` - Health check

## Testing

New comprehensive test infrastructure with **SQLite in-memory database**:

```bash
# Run all tests (32 test cases)
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode for development
npm run test:watch
```

**Test Features:**
- ✅ No external dependencies (SQLite in-memory)
- ✅ Fast execution (< 2 seconds)
- ✅ 32 test cases covering all API endpoints
- ✅ Isolated test environment
- ✅ Automatic database cleanup between tests

## Key Benefits

1. **Simplified Architecture** - No complex authentication or integrations
2. **Better Performance** - Fewer dependencies and database queries
3. **Easier Maintenance** - Focused scope with clear responsibilities
4. **External Service Ready** - Perfect for receiving wellness session data from external services

## Getting Started

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup database and run migrations:**
   ```bash
   npm run migrate
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **View API documentation:**
   - See `WELLNESS_SESSION_API.md` for complete API reference
   - See `README.md` for project overview

## External Integration

The API is now perfectly suited for external wellness coaching services that need to:
- Store session transcriptions
- Save session summaries
- Track user session history by email
- No complex authentication setup required

Simply send session data to `/api/interviews` with email, transcription, and summary fields.
