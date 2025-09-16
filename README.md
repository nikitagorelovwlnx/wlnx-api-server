# WLNX API Server

Lightweight TypeScript backend with PostgreSQL for user management, integrations and interview results.

## Features

- ✅ User registration and authentication
- ✅ User data retrieval
- ✅ Calendar integration information storage
- ✅ Telegram integration information storage
- ✅ Interview results storage and retrieval
- ✅ Full test coverage
- ✅ One-click server startup

## Technologies

- **TypeScript** - typed JavaScript
- **Express.js** - web framework
- **Knex.js** - SQL query builder
- **PostgreSQL** - database
- **JWT** - authentication
- **bcrypt** - password hashing
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

### Users
- `POST /api/users/register` - Register user
- `POST /api/users/login` - Login user
- `GET /api/users/me` - Get current user data
- `PUT /api/users/me` - Update user data

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

### Interview Results
- `POST /api/interviews` - Save interview result
- `GET /api/interviews` - Get user results
- `GET /api/interviews/:id` - Get specific result
- `PUT /api/interviews/:id` - Update result
- `DELETE /api/interviews/:id` - Delete result

## Usage Examples

### User Registration
```bash
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

### Save Interview Result
```bash
curl -X POST http://localhost:3000/api/interviews \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "title": "Technical Interview",
    "content": "Interview result in text format",
    "metadata": {
      "score": 85,
      "duration": 45,
      "interviewer": "Anna Smith"
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

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

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
