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

// Setup basic tables for tests if migrations don't work
export async function setupTestDb() {
  try {
    // Create wellness_sessions table
    await testDb.schema.dropTableIfExists('wellness_sessions');
    await testDb.schema.createTable('wellness_sessions', table => {
      table.string('id').primary();
      table.string('user_id').notNullable();
      table.text('transcription').notNullable();
      table.text('summary').notNullable();
      table.json('analysis_results');
      table.json('wellness_data');
      table.datetime('created_at').defaultTo(testDb.fn.now());
      table.datetime('updated_at').defaultTo(testDb.fn.now());
    });

    // Create prompts table
    await testDb.schema.dropTableIfExists('prompts');
    await testDb.schema.createTable('prompts', table => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description'); // Added missing description field
      table.string('stage_id').notNullable();
      table.string('form_name').notNullable();
      table.string('version').defaultTo('1.0.0');
      table.string('locale').defaultTo('en-US');
      table.json('prompt_data').notNullable(); // Changed from content to prompt_data
      table.boolean('is_active').defaultTo(1);
      table.datetime('created_at').defaultTo(testDb.fn.now());
      table.datetime('updated_at').defaultTo(testDb.fn.now());
      table.string('created_by').defaultTo('system');
    });

    // Create form_schemas table
    await testDb.schema.dropTableIfExists('form_schemas');
    await testDb.schema.createTable('form_schemas', table => {
      table.string('id').primary();
      table.string('name').notNullable();
      table.text('description');
      table.string('version').defaultTo('1.0.0');
      table.string('locale').defaultTo('en-US');
      table.json('schema_data').notNullable(); // Contains fields and stages
      table.boolean('is_active').defaultTo(1);
      table.datetime('created_at').defaultTo(testDb.fn.now());
      table.datetime('updated_at').defaultTo(testDb.fn.now());
      table.string('created_by').defaultTo('system');
    });

    // Create custom_prompts table
    await testDb.schema.dropTableIfExists('custom_prompts');
    await testDb.schema.createTable('custom_prompts', table => {
      table.string('stage_id').primary();
      table.text('question_prompt');
      table.text('extraction_prompt');
      table.datetime('created_at').defaultTo(testDb.fn.now());
      table.datetime('updated_at').defaultTo(testDb.fn.now());
    });

  } catch (error) {
    console.log('Test table setup error:', error instanceof Error ? error.message : 'Unknown error');
  }
}

export default testDb;
