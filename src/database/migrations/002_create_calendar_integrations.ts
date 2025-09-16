import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('calendar_integrations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.string('provider', 50).notNullable();
    table.text('access_token');
    table.text('refresh_token');
    table.timestamp('token_expires_at');
    table.string('calendar_id', 255);
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('calendar_integrations');
}
