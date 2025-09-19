import knex from 'knex';

const testConfig = {
  client: 'sqlite3',
  connection: {
    filename: ':memory:'
  },
  useNullAsDefault: true,
  migrations: {
    tableName: 'knex_migrations',
    directory: './src/database/migrations',
    extension: 'ts',
  },
};

export const testDb = knex(testConfig);

// Setup basic table for tests if migrations don't work
export async function setupTestDb() {
  try {
    // Create wellness_sessions table
    await testDb.schema.createTable('wellness_sessions', table => {
      table.string('id').primary();
      table.string('user_id').notNullable();
      table.text('transcription').notNullable();
      table.text('summary').notNullable();
      table.json('analysis_results');
      table.json('wellness_data'); // Added wellness_data field
      table.datetime('created_at').defaultTo(testDb.fn.now());
      table.datetime('updated_at').defaultTo(testDb.fn.now());
    });
  } catch (error) {
    // Table might already exist, ignore error
    console.log('Test table setup:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export default testDb;
