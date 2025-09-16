import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.alterTable('interview_results', (table) => {
    // Remove old fields
    table.dropColumn('title');
    table.dropColumn('content');
    table.dropColumn('metadata');
    
    // Add new fields for wellness coach interviews
    table.text('transcription').notNullable();
    table.text('summary').notNullable();
    
    // Add index for better performance
    table.index('transcription');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('interview_results', (table) => {
    // Remove new fields
    table.dropColumn('transcription');
    table.dropColumn('summary');
    
    // Restore old fields
    table.string('title', 255);
    table.text('content').notNullable();
    table.jsonb('metadata').defaultTo('{}');
  });
}
