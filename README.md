# WLNX API Server

Lightweight TypeScript backend with PostgreSQL for wellness coach interview management and integrations.

## Features

- ✅ Email-based user identification (no authentication required)
- ✅ User list retrieval from interview data
- ✅ Calendar integration information storage
- ✅ Telegram integration information storage
- ✅ Wellness coach interview results storage and retrieval
- ✅ Full test coverage
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

### Users
- `GET /api/users` - Get all users (email addresses with interview statistics)

### Calendar Integration
- `POST /api/calendar` - Create calendar integration
- `GET /api/calendar` - Get user integrations
- `PUT /api/calendar/:id` - Update integration
- `DELETE /api/calendar/:id` - Delete integration

### Telegram Integration
- `POST /api/telegram` - Create Telegram integration
- `GET /api/telegram` - Get user integrations
- `PUT /api/telegram/:id` - Update integration
- `DELETE /api/telegram/:id` - Delete integration

### Wellness Coach Interviews
- `POST /api/interviews` - Save interview result (requires email, transcription, summary)
- `GET /api/interviews` - Get all interviews (optional email parameter for filtering)
- `GET /api/interviews/:id` - Get specific interview (requires email query parameter)
- `PUT /api/interviews/:id` - Update interview (requires email in body)
- `DELETE /api/interviews/:id` - Delete interview (requires email in body)

## Usage Examples

### Get All Users
```bash
curl -X GET http://localhost:3000/api/users
```

Response:
```json
{
  "users": [
    {
      "email": "client@example.com",
      "interview_count": 5,
      "last_interview": "2025-09-17T00:50:26.537Z",
      "first_interview": "2025-09-16T00:30:15.123Z"
    }
  ]
}
```

### Create Wellness Coach Interview
```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -d '{
    "email": "client@example.com",
    "transcription": "Coach: How was your week? Client: It was stressful with work deadlines. Coach: Let'\''s explore some coping strategies...",
    "summary": "Client reported work stress. Discussed time management and mindfulness techniques. Recommended daily meditation practice."
  }'
```

### Get All Interviews
```bash
curl -X GET "http://localhost:3000/api/interviews"
```

### Get User Interviews
```bash
curl -X GET "http://localhost:3000/api/interviews?email=client@example.com"
```

### Update Interview
```bash
curl -X PUT http://localhost:3000/api/interviews/INTERVIEW_ID \
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
├── middleware/
│   └── auth.ts        # Authentication middleware
├── routes/
│   ├── userRoutes.ts      # User routes
│   ├── calendarRoutes.ts  # Calendar routes
│   ├── telegramRoutes.ts  # Telegram routes
│   └── interviewRoutes.ts # Interview routes
├── services/
│   ├── userService.ts     # User service
│   ├── calendarService.ts # Calendar service
│   ├── telegramService.ts # Telegram service
│   └── interviewService.ts # Interview service
├── tests/
│   ├── setup.ts           # Test setup
│   ├── userService.test.ts # User service tests
│   └── api.test.ts        # API integration tests
├── types/
│   └── index.ts       # TypeScript types
├── utils/
│   └── auth.ts        # Authentication utilities
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

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

Run tests with Docker:
```bash
./scripts/docker-test.sh
```

## License

MIT
