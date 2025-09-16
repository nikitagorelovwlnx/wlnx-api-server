import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('telegram_integrations', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.uuid('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.bigInteger('telegram_user_id').unique().notNullable();
    table.string('username', 100);
    table.string('first_name', 100);
    table.string('last_name', 100);
    table.bigInteger('chat_id');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
    
    table.index('user_id');
    table.index('telegram_user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('telegram_integrations');
}
