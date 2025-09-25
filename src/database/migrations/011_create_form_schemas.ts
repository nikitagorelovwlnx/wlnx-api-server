import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('form_schemas', (table) => {
    table.uuid('id').primary().defaultTo(knex.raw('gen_random_uuid()'));
    table.string('name').notNullable();
    table.string('description');
    table.string('version').notNullable(); // SemVer format: "1.0.0"
    table.string('locale').notNullable().defaultTo('en-US');
    table.jsonb('schema_data').notNullable(); // Contains fields and stages
    table.boolean('is_active').notNullable().defaultTo(true);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
    table.string('created_by');
    
    // Indexes for efficient queries
    table.index(['name', 'version']);
    table.index(['locale', 'is_active']);
    table.index('created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('form_schemas');
}
