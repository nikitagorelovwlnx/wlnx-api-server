import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  // Check if interview_results table exists
  const hasInterviewResults = await knex.schema.hasTable('interview_results');
  const hasWellnessSessions = await knex.schema.hasTable('wellness_sessions');
  
  if (hasInterviewResults && !hasWellnessSessions) {
    // Rename interview_results to wellness_sessions for better clarity
    await knex.schema.renameTable('interview_results', 'wellness_sessions');
  }
  
  // Ensure wellness_sessions table exists with proper structure
  if (!hasInterviewResults && !hasWellnessSessions) {
    await knex.schema.createTable('wellness_sessions', (table) => {
      table.uuid('id').primary();
      table.string('user_id').notNullable();
      table.text('transcription').notNullable();
      table.text('summary').notNullable();
      table.json('analysis_results');
      table.timestamps(true, true);
      
      table.index('user_id', 'idx_wellness_sessions_user_id');
      table.index('created_at', 'idx_wellness_sessions_created_at');
    });
  }
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
