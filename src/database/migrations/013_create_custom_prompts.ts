import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('custom_prompts', (table) => {
    table.string('stage_id').primary();
    table.text('question_prompt').nullable();
    table.text('extraction_prompt').nullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('custom_prompts');
}
