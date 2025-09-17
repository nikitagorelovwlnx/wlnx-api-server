import { Knex } from 'knex';
import { hashPassword } from '../../utils/auth';

export async function seed(knex: Knex): Promise<void> {
  // Clean all tables
  await knex('interview_results').del();
  await knex('telegram_integrations').del();
  await knex('calendar_integrations').del();
  await knex('users').del();

  // Create test users
  const testUsers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      email: 'test1@example.com',
      password_hash: await hashPassword('password123'),
      first_name: 'Test',
      last_name: 'User1',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      email: 'test2@example.com',
      password_hash: await hashPassword('password123'),
      first_name: 'Test',
      last_name: 'User2',
    },
  ];

  await knex('users').insert(testUsers);

  // Create test calendar integrations
  const calendarIntegrations = [
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      provider: 'google',
      access_token: 'test_access_token_1',
      calendar_id: 'test_calendar_1',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440004',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      provider: 'outlook',
      access_token: 'test_access_token_2',
      calendar_id: 'test_calendar_2',
    },
  ];

  await knex('calendar_integrations').insert(calendarIntegrations);

  // Create test telegram integrations
  const telegramIntegrations = [
    {
      id: '550e8400-e29b-41d4-a716-446655440005',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      telegram_user_id: 123456789,
      username: 'testuser1',
      first_name: 'Test',
      chat_id: 987654321,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440006',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      telegram_user_id: 987654321,
      username: 'testuser2',
      first_name: 'Test2',
      chat_id: 123456789,
    },
  ];

  await knex('telegram_integrations').insert(telegramIntegrations);

  // Create test interview results
  const interviewResults = [
    {
      id: '550e8400-e29b-41d4-a716-446655440007',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      transcription: 'Coach: How are you feeling today? Client: I feel stressed about work and having trouble sleeping. Coach: Let\'s explore some relaxation techniques...',
      summary: 'Client reported work stress and sleep issues. Discussed mindfulness techniques and work-life balance strategies. Recommended daily meditation practice.',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440008',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      transcription: 'Coach: What brings you to wellness coaching today? Client: I want to develop better habits for physical and mental health...',
      summary: 'Initial wellness coaching session focused on goal setting. Client interested in developing healthy habits, exercise routine, and stress management techniques.',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440009',
      user_id: '550e8400-e29b-41d4-a716-446655440002',
      transcription: 'Coach: How has your week been with the new routine? Client: Much better! I\'ve been following the morning meditation and feel more centered...',
      summary: 'Follow-up session showing positive progress. Client successfully implementing morning meditation routine and reporting improved focus and stress management.',
    },
  ];

  await knex('interview_results').insert(interviewResults);
}
