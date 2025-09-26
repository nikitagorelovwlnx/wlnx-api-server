import knex from 'knex';
import * as dotenv from 'dotenv';

dotenv.config();

const testConfig = {
  client: 'pg',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.TEST_DB_NAME || 'wlnx_api_test',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'password',
  },
  pool: {
    min: 1,
    max: 5,
  },
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
    extension: 'ts',
  },
};

export const testDb = knex(testConfig);

// Run migrations for test database
export async function setupTestDb() {
  try {
    // Run migrations to set up the database schema
    await testDb.migrate.latest();
    console.log('✓ Test database migrations completed');
  } catch (error) {
    console.error('Test database setup error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

export default testDb;
