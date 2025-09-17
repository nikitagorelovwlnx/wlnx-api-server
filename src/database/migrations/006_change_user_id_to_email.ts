import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Drop the foreign key constraint first
  await knex.schema.alterTable('interview_results', (table) => {
    table.dropForeign('user_id');
  });
  
  // Then drop the index and change the column type
  return knex.schema.alterTable('interview_results', (table) => {
    table.dropIndex('user_id');
    
    // Change user_id from UUID to string to store email addresses
    table.string('user_id', 255).notNullable().alter();
    
    // Add index back for performance
    table.index('user_id');
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.alterTable('interview_results', (table) => {
    // Drop the index
    table.dropIndex('user_id');
    
    // Change back to UUID and add foreign key constraint
    table.uuid('user_id').notNullable().alter();
    table.foreign('user_id').references('id').inTable('users').onDelete('CASCADE');
    
    // Add index back
    table.index('user_id');
  });
}
