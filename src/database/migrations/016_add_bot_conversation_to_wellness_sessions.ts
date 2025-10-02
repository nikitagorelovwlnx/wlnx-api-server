import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.text('bot_conversation').nullable();
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.dropColumn('bot_conversation');
  });
}
