import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Rename interview_results to wellness_sessions for better clarity
  // This table stores wellness coaching conversation sessions
  await knex.schema.renameTable('interview_results', 'wellness_sessions');
  
  // Update index names to match new table name
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.dropIndex('user_id', 'idx_interview_results_user_id');
    table.dropIndex('created_at', 'idx_interview_results_created_at');
  });
  
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.index('user_id', 'idx_wellness_sessions_user_id');
    table.index('created_at', 'idx_wellness_sessions_created_at');
  });
}

export async function down(knex: Knex): Promise<void> {
  // Rollback: rename back to interview_results
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.dropIndex('user_id', 'idx_wellness_sessions_user_id');
    table.dropIndex('created_at', 'idx_wellness_sessions_created_at');
  });
  
  await knex.schema.alterTable('wellness_sessions', (table) => {
    table.index('user_id', 'idx_interview_results_user_id');
    table.index('created_at', 'idx_interview_results_created_at');
  });
  
  await knex.schema.renameTable('wellness_sessions', 'interview_results');
}
