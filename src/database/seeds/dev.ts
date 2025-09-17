import { Knex } from 'knex';
import { hashPassword } from '../../utils/auth';

export async function seed(knex: Knex): Promise<void> {
  // Clean all tables
  await knex('interview_results').del();
  await knex('telegram_integrations').del();
  await knex('calendar_integrations').del();
  await knex('users').del();

  // Create development users
  const devUsers = [
    {
      id: '550e8400-e29b-41d4-a716-446655440010',
      email: 'dev@example.com',
      password_hash: await hashPassword('dev123'),
      first_name: 'Developer',
      last_name: 'User',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440011',
      email: 'admin@example.com',
      password_hash: await hashPassword('admin123'),
      first_name: 'Admin',
      last_name: 'User',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440012',
      email: 'john.doe@example.com',
      password_hash: await hashPassword('password123'),
      first_name: 'John',
      last_name: 'Doe',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440013',
      email: 'jane.smith@example.com',
      password_hash: await hashPassword('password123'),
      first_name: 'Jane',
      last_name: 'Smith',
    },
  ];

  await knex('users').insert(devUsers);

  // Create development calendar integrations
  const calendarIntegrations = [
    {
      id: '550e8400-e29b-41d4-a716-446655440014',
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      provider: 'google',
      access_token: 'dev_google_access_token',
      refresh_token: 'dev_google_refresh_token',
      calendar_id: 'primary',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440015',
      user_id: '550e8400-e29b-41d4-a716-446655440011',
      provider: 'outlook',
      access_token: 'dev_outlook_access_token',
      calendar_id: 'calendar_id_123',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440016',
      user_id: '550e8400-e29b-41d4-a716-446655440012',
      provider: 'google',
      access_token: 'john_google_token',
      calendar_id: 'john_calendar',
    },
  ];

  await knex('calendar_integrations').insert(calendarIntegrations);

  // Create development telegram integrations
  const telegramIntegrations = [
    {
      id: '550e8400-e29b-41d4-a716-446655440017',
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      telegram_user_id: 111111111,
      username: 'devuser',
      first_name: 'Developer',
      chat_id: 222222222,
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440018',
      user_id: '550e8400-e29b-41d4-a716-446655440011',
      telegram_user_id: 333333333,
      username: 'adminuser',
      first_name: 'Admin',
      chat_id: 444444444,
    },
  ];

  await knex('telegram_integrations').insert(telegramIntegrations);

  // Create development wellness coach interview results
  const interviewResults = [
    {
      id: '550e8400-e29b-41d4-a716-446655440019',
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      transcription: 'Coach: Welcome to your wellness coaching session. How are you feeling today? Client: I\'ve been feeling quite overwhelmed lately with work stress. Coach: Let\'s explore some stress management techniques that might help...',
      summary: 'Initial wellness coaching session. Client reported high work stress levels. Introduced basic stress management techniques including breathing exercises and time management strategies.',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      transcription: 'Coach: How did the breathing exercises work for you this week? Client: They really helped during stressful moments at work. I feel more centered now. Coach: That\'s excellent progress. Let\'s build on that...',
      summary: 'Follow-up session showing positive progress with stress management techniques. Client successfully implementing breathing exercises with good results. Expanding to include mindfulness practices.',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      user_id: '550e8400-e29b-41d4-a716-446655440012',
      transcription: 'Coach: I understand you want to focus on physical wellness today. Client: Yes, I\'ve been sedentary for too long and want to establish a sustainable exercise routine. Coach: Let\'s start with realistic goals...',
      summary: 'Physical wellness focused session. Client seeking to establish regular exercise routine. Created personalized fitness plan with gradual progression and accountability measures.',
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      user_id: '550e8400-e29b-41d4-a716-446655440013',
      transcription: 'Coach: How has your sleep been since we implemented the new evening routine? Client: Much better! I\'m falling asleep faster and feeling more rested. Coach: That\'s wonderful to hear...',
      summary: 'Sleep wellness session showing significant improvement. Client successfully following evening routine with positive sleep quality results. Discussing long-term sleep hygiene maintenance.',
    },
  ];

  await knex('interview_results').insert(interviewResults);
}
