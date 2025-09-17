import { db } from '../database/knex';

beforeAll(async () => {
  // Run migrations before tests
  await db.migrate.latest();
});

beforeEach(async () => {
  // Clean all tables before each test in correct order (respecting foreign keys)
  await db('interview_results').del();
  await db('telegram_integrations').del();
  await db('calendar_integrations').del();
  await db('users').del();
  
  // Reset sequences to ensure consistent IDs
  await db.raw('ALTER SEQUENCE IF EXISTS knex_migrations_id_seq RESTART WITH 1');
});

afterAll(async () => {
  // Close database connection after all tests
  await db.destroy();
});
