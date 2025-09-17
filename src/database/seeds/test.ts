import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clean wellness_sessions table  
  try {
    await knex('wellness_sessions').del();
  } catch (error) {
    // Table might not exist yet
  }

  // Create test wellness sessions
  const testWellnessSessions = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      user_id: 'test@example.com',
      transcription: 'Test transcription content for wellness coaching session. Coach: How can I help you today? Client: I need help with stress management.',
      summary: 'Test summary of wellness coaching insights and recommendations for stress management.',
      created_at: new Date('2025-09-17T08:00:00Z'),
      updated_at: new Date('2025-09-17T08:00:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      user_id: 'another@example.com',
      transcription: 'Another test transcription with different wellness topics. Coach: Let\'s focus on your sleep patterns. Client: I have trouble falling asleep.',
      summary: 'Another test summary focusing on sleep wellness and establishing healthy bedtime routines.',
      created_at: new Date('2025-09-17T12:00:00Z'),
      updated_at: new Date('2025-09-17T12:00:00Z'),
    },
  ];

  await knex('wellness_sessions').insert(testWellnessSessions);
}
