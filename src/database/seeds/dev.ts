import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Clean wellness_sessions table
  await knex('wellness_sessions').del();

  // Create development wellness sessions
  const wellnessSessions = [
    {
      id: '550e8400-e29b-41d4-a716-446655440019',
      user_id: 'dev@example.com',
      transcription: 'Coach: Welcome to your wellness coaching session. How are you feeling today? Client: I\'ve been feeling quite overwhelmed lately with work stress. Coach: Let\'s explore some stress management techniques that might help...',
      summary: 'Initial wellness coaching session. Client reported high work stress levels. Introduced basic stress management techniques including breathing exercises and time management strategies.',
      created_at: new Date('2025-09-15T10:00:00Z'),
      updated_at: new Date('2025-09-15T10:00:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440020',
      user_id: 'dev@example.com',
      transcription: 'Coach: How did the breathing exercises work for you this week? Client: They really helped during stressful moments at work. I feel more centered now. Coach: That\'s excellent progress. Let\'s build on that...',
      summary: 'Follow-up session showing positive progress with stress management techniques. Client successfully implementing breathing exercises with good results. Expanding to include mindfulness practices.',
      created_at: new Date('2025-09-16T10:00:00Z'),
      updated_at: new Date('2025-09-16T10:00:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440021',
      user_id: 'john.doe@example.com',
      transcription: 'Coach: I understand you want to focus on physical wellness today. Client: Yes, I\'ve been sedentary for too long and want to establish a sustainable exercise routine. Coach: Let\'s start with realistic goals...',
      summary: 'Physical wellness focused session. Client seeking to establish regular exercise routine. Created personalized fitness plan with gradual progression and accountability measures.',
      created_at: new Date('2025-09-16T14:00:00Z'),
      updated_at: new Date('2025-09-16T14:00:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440022',
      user_id: 'jane.smith@example.com',
      transcription: 'Coach: How has your sleep been since we implemented the new evening routine? Client: Much better! I\'m falling asleep faster and feeling more rested. Coach: That\'s wonderful to hear...',
      summary: 'Sleep wellness session showing significant improvement. Client successfully following evening routine with positive sleep quality results. Discussing long-term sleep hygiene maintenance.',
      created_at: new Date('2025-09-17T09:00:00Z'),
      updated_at: new Date('2025-09-17T09:00:00Z'),
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440023',
      user_id: 'jane.smith@example.com',
      transcription: 'Coach: Today let\'s talk about nutrition and how it affects your energy levels. Client: I\'ve noticed I crash in the afternoons after lunch. Coach: That\'s a common issue. Let\'s look at your eating patterns...',
      summary: 'Nutrition-focused wellness session. Client experiencing afternoon energy crashes. Developed meal planning strategy with balanced nutrition and consistent meal timing.',
      created_at: new Date('2025-09-17T15:30:00Z'),
      updated_at: new Date('2025-09-17T15:30:00Z'),
    },
  ];

  await knex('wellness_sessions').insert(wellnessSessions);
}
