import { testDb, setupTestDb } from '../database/knex.test';

beforeAll(async () => {
  // Setup test database schema
  await setupTestDb();
});

beforeEach(async () => {
  // Clean all tables before each test to ensure isolation
  try {
    // Delete in order to respect foreign key constraints
    await testDb('wellness_sessions').del();
    await testDb('form_schemas').del();
    await testDb('custom_prompts').del();
    
    // Reset any sequences if needed
    await testDb.raw('SELECT setval(pg_get_serial_sequence(\'wellness_sessions\', \'id\'), 1, false)').catch(() => {});
  } catch (error) {
    // Ignore if tables don't exist or sequences don't exist
    console.warn('Warning during test cleanup:', error instanceof Error ? error.message : String(error));
  }
});

afterAll(async () => {
  // Close database connection after all tests
  await testDb.destroy();
});
