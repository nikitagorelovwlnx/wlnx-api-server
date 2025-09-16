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

  // Create development interview results
  const interviewResults = [
    {
      id: '550e8400-e29b-41d4-a716-446655440019',
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      title: 'Frontend Developer Interview',
      content: 'Discussed React, TypeScript, and modern frontend practices. Candidate showed strong knowledge of hooks and state management.',
      metadata: JSON.stringify({ 
        score: 88, 
        duration: 50, 
        interviewer: 'Sarah Wilson',
        position: 'Frontend Developer',
        skills: ['React', 'TypeScript', 'CSS']
      }),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      user_id: '550e8400-e29b-41d4-a716-446655440010',
      title: 'System Design Interview',
      content: 'Designed a scalable chat application. Good understanding of microservices, databases, and caching strategies.',
      metadata: JSON.stringify({ 
        score: 82, 
        duration: 75, 
        interviewer: 'Mike Chen',
        position: 'Senior Backend Developer',
        topics: ['Microservices', 'Database Design', 'Caching']
      }),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      user_id: '550e8400-e29b-41d4-a716-446655440012',
      title: 'DevOps Engineer Interview',
      content: 'Covered Docker, Kubernetes, CI/CD pipelines, and cloud infrastructure. Strong practical experience.',
      metadata: JSON.stringify({ 
        score: 91, 
        duration: 60, 
        interviewer: 'Lisa Brown',
        position: 'DevOps Engineer',
        tools: ['Docker', 'Kubernetes', 'AWS', 'Jenkins']
      }),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      user_id: '550e8400-e29b-41d4-a716-446655440013',
      title: 'Product Manager Interview',
      content: 'Discussed product strategy, user research, and agile methodologies. Excellent communication skills.',
      metadata: JSON.stringify({ 
        score: 87, 
        duration: 45, 
        interviewer: 'David Kim',
        position: 'Product Manager',
        areas: ['Strategy', 'User Research', 'Agile']
      }),
    },
  ];

  await knex('interview_results').insert(interviewResults);
}
