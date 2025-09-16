import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create users table
  await knex.schema.createTable('users', (table) => {
    table.increments('id').primary();
    table.string('email').unique().notNullable();
    table.string('password_hash').notNullable();
    table.string('first_name').notNullable();
    table.string('last_name').notNullable();
    table.timestamps(true, true);
    
    table.index('email');
  });

  // Create calendar_integrations table
  await knex.schema.createTable('calendar_integrations', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('provider').notNullable(); // 'google', 'outlook', etc.
    table.string('provider_account_id').notNullable();
    table.text('access_token');
    table.text('refresh_token');
    table.timestamp('expires_at');
    table.timestamps(true, true);
    
    table.index('user_id');
    table.unique(['user_id', 'provider', 'provider_account_id']);
  });

  // Create telegram_integrations table
  await knex.schema.createTable('telegram_integrations', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('telegram_user_id').notNullable();
    table.string('username');
    table.string('first_name');
    table.string('last_name');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('user_id');
    table.unique(['user_id', 'telegram_user_id']);
  });

  // Create interview_results table
  await knex.schema.createTable('interview_results', (table) => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('title').notNullable();
    table.text('content').notNullable();
    table.json('metadata');
    table.timestamp('interview_date');
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('interview_date');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('interview_results');
  await knex.schema.dropTableIfExists('telegram_integrations');
  await knex.schema.dropTableIfExists('calendar_integrations');
  await knex.schema.dropTableIfExists('users');
}

