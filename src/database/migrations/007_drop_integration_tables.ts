import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop integration tables since we no longer need them
  // We only need wellness session storage functionality
  await knex.schema.dropTableIfExists('telegram_integrations');
  await knex.schema.dropTableIfExists('calendar_integrations');
}

export async function down(knex: Knex): Promise<void> {
  // Recreate tables in case we need to rollback
  await knex.schema.createTable('calendar_integrations', (table) => {
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

  await knex.schema.createTable('telegram_integrations', (table) => {
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
