import { db as productionDb } from './knex';
import { testDb } from './knex.test';

/**
 * Get the appropriate database connection based on environment
 * Always uses PostgreSQL - no fallbacks
 */
export function getDb() {
  if (process.env.NODE_ENV === 'test') {
    return testDb;
  }
  return productionDb;
}

// Re-export for backward compatibility
export { db } from './knex';
export { testDb } from './knex.test';
