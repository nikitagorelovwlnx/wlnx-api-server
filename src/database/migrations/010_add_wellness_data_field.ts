import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.json('wellness_data').nullable().comment('JSON data with wellness parameters collected during the session');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.dropColumn('wellness_data');
  });
}
