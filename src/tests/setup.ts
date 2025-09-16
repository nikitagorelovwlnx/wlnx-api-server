import { db } from '../database/knex';

beforeAll(async () => {
  // Run migrations before tests
  await db.migrate.latest();
});

beforeEach(async () => {
  // Clean all tables before each test
  await db('interview_results').del();
  await db('telegram_integrations').del();
  await db('calendar_integrations').del();
  await db('users').del();
});

afterAll(async () => {
  // Close database connection after all tests
  await db.destroy();
});
