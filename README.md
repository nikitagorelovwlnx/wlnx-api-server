# WLNX API Server

Lightweight TypeScript backend with PostgreSQL for wellness coaching session storage and management.

## Features

- ✅ Email-based user identification (no authentication required)
- ✅ Wellness coaching session storage with transcriptions and summaries
- ✅ User session history and statistics
- ✅ RESTful API for session management (CRUD operations)
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
- PostgreSQL
- npm or yarn

### Installation and Setup

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

### Manual Installation

If you prefer manual installation:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env file with your DB settings
   ```

3. **Run migrations:**
   ```bash
   npm run migrate
   ```

4. **Start server:**
   ```bash
   npm run dev
   ```

## API Endpoints

**🔑 Authentication:** All endpoints use email-based identification. No JWT tokens required.

### Users with Complete Session History
- `GET /api/users` - Get all users with their complete session history (includes all transcriptions and summaries)

### Wellness Sessions
- `POST /api/interviews` - Create wellness session (requires email, transcription, summary)
- `GET /api/interviews` - Get user sessions (requires email query parameter)
- `GET /api/interviews/:id` - Get specific session (requires email query parameter)
- `PUT /api/interviews/:id` - Update session (requires email in body)
- `DELETE /api/interviews/:id` - Delete session (requires email in body)

### Health Check
- `GET /health` - Server health status

## Usage Examples

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
    "summary": "Client reported work stress. Discussed time management and mindfulness techniques. Recommended daily meditation practice."
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
    "summary": "Updated summary..."
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
│   ├── testApp.ts                  # Test application with SQLite
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

The project uses **Jest** with **SQLite in-memory database** for fast, isolated testing.

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with coverage:
```bash
npm run test:coverage
```

Run tests with Docker:
```bash
./scripts/docker-test.sh
```

**Test Features:**
- ✅ No external dependencies (uses SQLite in-memory)
- ✅ Fast execution (< 2 seconds)
- ✅ 34 test cases covering all API endpoints
- ✅ Isolated test environment
- ✅ Automatic database cleanup between tests

## License

MIT
