# WLNX API Server

Lightweight TypeScript backend with PostgreSQL for wellness coaching session storage and management.

## Features

- ✅ Email-based user identification (no authentication required)
- ✅ Wellness coaching session storage with transcriptions and summaries
- ✅ User session history and statistics
- ✅ RESTful API for session management (CRUD operations)
- ✅ **FormSpec v2** - Dynamic form schema management with versioning
- ✅ Form schema API for client UI rendering
- ✅ **Prompt Management** - Fallback system: DB → Hardcoded defaults with custom modifications
- ✅ Bot integration API for dynamic prompt delivery
- ✅ Full test coverage with Jest
- ✅ One-click server startup

## Technologies

- **TypeScript** - typed JavaScript
- **Express.js** - web framework
- **Knex.js** - SQL query builder
- **PostgreSQL** - database
- **Jest** - testing

## Quick Start

### Prerequisites

- Node.js (v16+)
- Docker and Docker Compose (recommended)
- OR PostgreSQL (if running without Docker)
- npm or yarn

### Installation and Setup

#### Option 1: Docker (Recommended)

1. **Clone repository and navigate to directory:**
   ```bash
   cd wlnx-api-server
   ```

2. **Start development environment with Docker:**
   ```bash
   ./scripts/docker-dev.sh
   ```

   This script automatically:
   - Starts PostgreSQL database in Docker
   - Installs dependencies
   - Runs database migrations
   - Seeds development data
   - Starts development server at http://localhost:3000

#### Option 2: Manual Setup

1. **Clone repository and navigate to directory:**
   ```bash
   cd wlnx-api-server
   ```

2. **Run installation script (one click):**
   ```bash
   ./start.sh
   ```

   Script automatically:
   - Installs dependencies
   - Creates .env file from example
   - Runs database migrations
   - Starts development server

#### Option 3: Manual Installation (PostgreSQL required)

If you have PostgreSQL installed locally:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your PostgreSQL settings
   ```

3. **Ensure PostgreSQL is running and create database:**
   ```bash
   createdb wlnx_api_dev  # or use your preferred method
   ```

4. **Run migrations:**
   ```bash
   npm run migrate
   ```

5. **Seed development data (optional):**
   ```bash
   npm run seed:dev
   ```

6. **Start server:**
   ```bash
   npm run dev
   ```

## API Endpoints

**🔑 Authentication:** All endpoints use email-based identification. No JWT tokens required.

### Users with Complete Session History
- `GET /api/users` - Get all users with their complete session history (includes all transcriptions and summaries)

### Wellness Sessions
- `POST /api/interviews` - Create wellness session (requires email, transcription, summary; optional wellness_data JSON)
- `GET /api/interviews` - Get user sessions (requires email query parameter)
- `GET /api/interviews/:id` - Get specific session (requires email query parameter)
- `PUT /api/interviews/:id` - Update session (requires email in body; optional wellness_data JSON)
- `DELETE /api/interviews/:id` - Delete session (requires email in body)

### Form Schema (Hardcoded)
- `GET /api/form-schemas` - Get current wellness form schema (hardcoded, single version)

### Interview Prompts
- `GET /api/prompts` - Get wellness interview prompts from database
- `PUT /api/prompts/:stageId` - Update prompts for specific stage (stores only changes)

### Health Check
- `GET /health` - Server health status

## Usage Examples

### Get Wellness Interview Prompts
```bash
curl -X GET http://localhost:3000/api/prompts
```

Response:
```json
{
  "success": true,
  "data": {
    "demographics_baseline": {
      "question_prompt": "Based on the current conversation context and missing demographic information, generate the next logical question to ask the user...",
      "extraction_prompt": "Extract demographic data from the user's response and return it in structured JSON format..."
    },
    "biometrics_habits": {
      "question_prompt": "Based on the conversation context and missing biometric/habit information...",
      "extraction_prompt": "Extract biometric and habit data from the user's response..."
    },
    "lifestyle_context": {
      "question_prompt": "Generate a contextual question about the user's lifestyle factors...",
      "extraction_prompt": "Extract lifestyle and work context data from the user's response..."
    },
    "medical_history": {
      "question_prompt": "Generate a sensitive, appropriate question about the user's medical history...",
      "extraction_prompt": "Extract medical and health-related information with high sensitivity to privacy..."
    },
    "goals_preferences": {
      "question_prompt": "Generate an engaging question about the user's health goals and preferences...",
      "extraction_prompt": "Extract goals, preferences, and motivational information from the user's response..."
    }
  }
}
```

### Update Custom Prompts
```bash
curl -X PUT http://localhost:3000/api/prompts/demographics_baseline \
  -H "Content-Type: application/json" \
  -d '{
    "question_prompt": "Custom question: What is your age and basic info?",
    "extraction_prompt": "Custom extraction: Parse age, gender, weight, height from response"
  }'
```

### Reset to Default Prompts
```bash
curl -X PUT http://localhost:3000/api/prompts/demographics_baseline \
  -H "Content-Type: application/json" \
  -d '{
    "question_prompt": null
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "stage_id": "demographics_baseline",
    "prompts": {
      "question_prompt": "Custom question: What is your age and basic info?",
      "extraction_prompt": "Custom extraction: Parse age, gender, weight, height from response"
    }
  },
  "message": "Prompts for stage 'demographics_baseline' updated successfully"
}
```

### Get All Users with Complete Session History
```bash
curl -X GET http://localhost:3000/api/users
```

Response:
```json
{
  "users": [
    {
      "email": "client@example.com",
      "session_count": 3,
      "last_session": "2025-09-17T00:50:26.537Z",
      "first_session": "2025-09-16T00:30:15.123Z",
      "sessions": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440000",
          "transcription": "Coach: How was your week? Client: It was stressful...",
          "summary": "Client discussed work stress. Recommended mindfulness techniques.",
          "analysis_results": null,
          "wellness_data": {
            "age": 33,
            "weight": 70,
            "stress_level": 7,
            "sleep_hours": 6,
            "goals": ["stress_management", "better_sleep"]
          },
          "created_at": "2025-09-17T00:50:26.537Z",
          "updated_at": "2025-09-17T00:50:26.537Z"
        },
        {
          "id": "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
          "transcription": "Coach: How are you feeling today? Client: Much better...",
          "summary": "Client showed improvement in mood and energy levels.",
          "analysis_results": null,
          "created_at": "2025-09-16T18:30:15.123Z",
          "updated_at": "2025-09-16T18:30:15.123Z"
        }
      ]
    }
  ]
}
```

**Benefits:**
- ✅ **One API call** gets all users and their complete session history
- ✅ **Full data access** - transcriptions, summaries, timestamps, IDs
- ✅ **Client flexibility** - frontend can filter, search, display as needed
- ✅ **Efficient** - optimized single query with proper sorting

### Create Wellness Session
```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "transcription": "Coach: How was your week? Client: It was stressful with work deadlines. Coach: Let'\''s explore some coping strategies...",
    "summary": "Client reported work stress. Discussed time management and mindfulness techniques. Recommended daily meditation practice.",
    "wellness_data": {
      "age": 33,
      "weight": 70,
      "height": 175,
      "stress_level": 7,
      "sleep_hours": 6,
      "activity_level": "moderate",
      "goals": ["stress_management", "better_sleep"]
    }
  }'
```

### Get User Sessions
```bash
curl -X GET "http://localhost:3000/api/interviews?email=client@example.com"
```

### Get Specific Session
```bash
curl -X GET "http://localhost:3000/api/interviews/SESSION_ID?email=client@example.com"
```

### Update Session
```bash
curl -X PUT http://localhost:3000/api/interviews/SESSION_ID \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "transcription": "Updated transcript...",
    "summary": "Updated summary...",
    "wellness_data": {
      "age": 33,
      "weight": 70,
      "height": 175,
      "stress_level": 5,
      "sleep_hours": 8,
      "activity_level": "high",
      "goals": ["stress_management", "better_sleep", "weight_maintenance"]
    }
  }'
```

## Scripts

- `npm run dev` - Run in development mode
- `npm run build` - Build project
- `npm start` - Run production version
- `npm test` - Run tests
- `npm run migrate` - Run DB migrations
- `npm run setup` - Full installation and startup

## Project Structure

```
src/
├── database/
│   ├── migrations/     # DB migrations
│   ├── knex.ts        # Knex configuration
│   └── connection.ts  # DB connection
├── routes/
│   ├── userRoutes.ts      # User statistics routes
│   └── interviewRoutes.ts # Wellness session routes
├── services/
│   └── wellnessSessionService.ts # Wellness session service
├── tests/
│   ├── setup.ts                    # Test setup
│   ├── testApp.ts                  # Test application with PostgreSQL
│   ├── wellnessSession.test.ts     # Wellness session API tests
│   ├── wellnessSessionService.test.ts # Service tests
│   └── api.test.ts                 # API integration tests
├── types.ts           # TypeScript types
├── app.ts             # Express app configuration
└── index.ts           # Main server file
```

## Environment Variables

```env
PORT=3000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=wlnx_api
DB_USER=postgres
DB_PASSWORD=password

# Test Database
TEST_DB_NAME=wlnx_api_test
```

## Docker Setup

The project includes Docker configurations for different environments:

### Test Environment
Run tests in a clean Docker environment:
```bash
./scripts/docker-test.sh
```

### Development Environment
Start development server with Docker:
```bash
./scripts/docker-dev.sh
```
- Database is cleaned and recreated with mock data on each start
- API available at http://localhost:3000
- Source code is mounted for live reloading

### Production Environment
Start production server with Docker:
```bash
./scripts/docker-prod.sh
```

**Before running production:**
1. Create `secrets/db_password.txt` with your database password
2. Create `secrets/jwt_secret.txt` with your JWT secret
3. Optionally create `config/prod-users.json` (copy from example) for initial users

Production features:
- Persistent database volume
- Users seeded from config file on first start
- Runs in detached mode

## Testing

The project uses **Jest** with **PostgreSQL test database** for comprehensive testing.

Run all tests:
```bash
npm test
```
Run tests with coverage:
```bash
npm run test:coverage
```

**Test Features:**
- PostgreSQL test database for realistic testing
- Comprehensive test coverage
- 127+ test cases covering all API endpoints
- Isolated test environment with migrations
- Automatic database cleanup between tests

## Troubleshooting

### Common API Errors
**404 Not Found Error:**
- ❌ **Wrong URL**: Ensure you're using `/api/interviews` (plural), not `/api/interview`
- ❌ **Wrong endpoint**: Check available endpoints in this documentation
- ✅ **Correct POST endpoint**: `POST /api/interviews`

**Database Connection Issues:**
```bash
# Check if PostgreSQL container is running
docker ps

# Restart PostgreSQL if needed
docker-compose -f docker-compose.dev.yml up postgres-dev -d

# Check database connection
curl http://localhost:3000/health
```

**Server Debugging:**
The server includes request logging middleware. Check server logs to see:
- Incoming request URLs and methods
- Request body contents
- Error details

Example log output:
```
2025-09-18T12:29:30.665Z - POST /api/interviews
Body: {
  "email": "user@example.com",
  "transcription": "...",
  "summary": "..."
}
```

### Database Management

**Clear all data:**
```bash
# Option 1: Using Docker
docker exec wlnx-api-server-postgres-dev-1 psql -U postgres -d wlnx_api_dev -c "DELETE FROM wellness_sessions;"

# Option 2: Reload test data
npm run seed:run --specific=test.ts
```

**Reset database completely:**
```bash
npm run migrate:rollback --all
npm run migrate
npm run seed:dev
```

## License

MIT
