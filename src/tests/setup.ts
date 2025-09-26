import { testDb, setupTestDb } from '../database/knex.test';

beforeAll(async () => {
  // Setup test database schema
  await setupTestDb();
});

beforeEach(async () => {
  // Clean all tables before each test
  try {
    await testDb('wellness_sessions').del();
    await testDb('form_schemas').del();
    await testDb('custom_prompts').del();
  } catch (error) {
    // Ignore if tables don't exist
  }
});

afterAll(async () => {
  // Close database connection after all tests
  await testDb.destroy();
});
