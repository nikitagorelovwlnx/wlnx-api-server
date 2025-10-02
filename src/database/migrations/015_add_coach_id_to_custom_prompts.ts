import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('custom_prompts', (table) => {
    table.uuid('coach_id').nullable();
    table.foreign('coach_id').references('id').inTable('coaches').onDelete('SET NULL');
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('custom_prompts', (table) => {
    table.dropForeign(['coach_id']);
    table.dropColumn('coach_id');
  });
}
