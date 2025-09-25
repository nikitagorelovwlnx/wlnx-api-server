import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('prompts', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('description');
    table.string('stage_id').notNullable(); // e.g., "S1_demographics"
    table.string('form_name').notNullable(); // e.g., "wellness_intake"
    table.string('version').notNullable(); // SemVer format: "1.0.0"
    table.string('locale').notNullable().defaultTo('en-US');
    table.jsonb('prompt_data').notNullable(); // Contains content and metadata
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('created_by');
    
    // Indexes for efficient queries
    table.index(['form_name', 'stage_id', 'version']);
    table.index(['form_name', 'locale', 'is_active']);
    table.index(['stage_id', 'is_active']);
    table.index('created_at');
    
    // Unique constraint: one active prompt per stage/form/locale combination
    table.unique(['stage_id', 'form_name', 'locale', 'version', 'is_active']);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('prompts');
}
