import request from 'supertest';
import { testDb, setupTestDb } from '../database/knex.test';
import { app } from './testApp';

describe('Bot Conversation API', () => {
  beforeAll(async () => {
    await setupTestDb();
  });

  afterEach(async () => {
    // Clean up test data
    await testDb('wellness_sessions').del();
  });

  describe('POST /api/interviews with bot_conversation', () => {
    it('should create wellness session with bot_conversation', async () => {
      const sessionData = {
        email: 'test@example.com',
        transcription: 'User spoke about wellness goals',
        summary: 'User wants to improve sleep',
        bot_conversation: 'Bot: Hello! How are you?\nUser: I am tired\nBot: Let me help you with sleep tips'
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(sessionData)
        .expect(201);

      expect(response.body.result).toMatchObject({
        user_id: 'test@example.com',
        transcription: 'User spoke about wellness goals',
        summary: 'User wants to improve sleep',
        bot_conversation: 'Bot: Hello! How are you?\nUser: I am tired\nBot: Let me help you with sleep tips'
      });
      expect(response.body.result.id).toBeDefined();
      expect(response.body.result.created_at).toBeDefined();
    });

    it('should create wellness session without bot_conversation (optional field)', async () => {
      const sessionData = {
        email: 'test@example.com',
        transcription: 'User spoke about wellness goals',
        summary: 'User wants to improve sleep'
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(sessionData)
        .expect(201);

      expect(response.body.result).toMatchObject({
        user_id: 'test@example.com',
        transcription: 'User spoke about wellness goals',
        summary: 'User wants to improve sleep',
        bot_conversation: null
      });
    });

    it('should create wellness session with empty bot_conversation', async () => {
      const sessionData = {
        email: 'test@example.com',
        transcription: 'User spoke about wellness goals',
        summary: 'User wants to improve sleep',
        bot_conversation: ''
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(sessionData)
        .expect(201);

      // Empty string gets converted to null in our service
      expect(response.body.result.bot_conversation).toBe(null);
    });
  });

  describe('PUT /api/interviews/:id with bot_conversation', () => {
    let sessionId: string;

    beforeEach(async () => {
      // Create a test session first
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'test@example.com',
          transcription: 'Initial transcription',
          summary: 'Initial summary',
          bot_conversation: 'Initial bot conversation'
        });
      sessionId = response.body.result.id;
    });

    it('should update bot_conversation field', async () => {
      const updateData = {
        email: 'test@example.com',
        bot_conversation: 'Bot: Hello again!\nUser: Hi bot\nBot: How can I help you today?\nUser: I need sleep advice\nBot: Here are some tips...'
      };

      const response = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.result.bot_conversation).toBe(updateData.bot_conversation);
      expect(response.body.result.transcription).toBe('Initial transcription'); // Should remain unchanged
      expect(response.body.result.summary).toBe('Initial summary'); // Should remain unchanged
    });

    it('should update only bot_conversation while keeping other fields', async () => {
      const updateData = {
        email: 'test@example.com',
        transcription: 'Updated transcription',
        bot_conversation: 'Updated bot conversation'
      };

      const response = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.result.transcription).toBe('Updated transcription');
      expect(response.body.result.bot_conversation).toBe('Updated bot conversation');
      expect(response.body.result.summary).toBe('Initial summary'); // Should remain unchanged
    });

    it('should clear bot_conversation with null', async () => {
      const updateData = {
        email: 'test@example.com',
        bot_conversation: null
      };

      const response = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.result.bot_conversation).toBeNull();
    });

    it('should clear bot_conversation with empty string', async () => {
      const updateData = {
        email: 'test@example.com',
        bot_conversation: ''
      };

      const response = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send(updateData)
        .expect(200);

      // Empty string gets stored as empty string in updates
      expect(response.body.result.bot_conversation).toBe('');
    });
  });

  describe('GET /api/interviews with bot_conversation', () => {
    beforeEach(async () => {
      // Create test sessions with different bot_conversation values
      await request(app)
        .post('/api/interviews')
        .send({
          email: 'user1@example.com',
          transcription: 'Transcription 1',
          summary: 'Summary 1',
          bot_conversation: 'Bot conversation 1'
        });

      await request(app)
        .post('/api/interviews')
        .send({
          email: 'user1@example.com',
          transcription: 'Transcription 2',
          summary: 'Summary 2',
          bot_conversation: null
        });

      await request(app)
        .post('/api/interviews')
        .send({
          email: 'user2@example.com',
          transcription: 'Transcription 3',
          summary: 'Summary 3',
          bot_conversation: 'Bot conversation 3'
        });
    });

    it('should return sessions with bot_conversation field', async () => {
      const response = await request(app)
        .get('/api/interviews?email=user1@example.com')
        .expect(200);

      expect(response.body.results).toHaveLength(2);
      expect(response.body.results[0]).toHaveProperty('bot_conversation');
      expect(response.body.results[1]).toHaveProperty('bot_conversation');
      
      // Check that one has bot_conversation and one is null
      const conversations = response.body.results.map((r: any) => r.bot_conversation);
      expect(conversations).toContain('Bot conversation 1');
      expect(conversations).toContain(null);
    });

    it('should return specific session with bot_conversation', async () => {
      // First get the session ID
      const sessionsResponse = await request(app)
        .get('/api/interviews?email=user2@example.com')
        .expect(200);

      const sessionId = sessionsResponse.body.results[0].id;

      const response = await request(app)
        .get(`/api/interviews/${sessionId}?email=user2@example.com`)
        .expect(200);

      expect(response.body.result.bot_conversation).toBe('Bot conversation 3');
      expect(response.body.result.transcription).toBe('Transcription 3');
      expect(response.body.result.summary).toBe('Summary 3');
    });
  });

  describe('Bot conversation with long content', () => {
    it('should handle very long bot conversations', async () => {
      const longConversation = Array(100).fill(0).map((_, i) => 
        `Bot: Message ${i}\nUser: Response ${i}`
      ).join('\n');

      const sessionData = {
        email: 'test@example.com',
        transcription: 'Long conversation test',
        summary: 'Test with very long bot conversation',
        bot_conversation: longConversation
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(sessionData)
        .expect(201);

      expect(response.body.result.bot_conversation).toBe(longConversation);
      expect(response.body.result.bot_conversation.length).toBeGreaterThan(1000);
    });
  });

  describe('Bot conversation with special characters', () => {
    it('should handle bot conversations with special characters and emojis', async () => {
      const specialConversation = `Bot: Hello! 😊 How are you feeling today?
User: I'm feeling stressed 😰 about work...
Bot: I understand! Let's work on some relaxation techniques 🧘‍♀️
User: That sounds great! 👍
Bot: Here are some breathing exercises: 
1️⃣ Inhale for 4 seconds
2️⃣ Hold for 4 seconds  
3️⃣ Exhale for 6 seconds
User: Thank you! This is very helpful 🙏`;

      const sessionData = {
        email: 'test@example.com',
        transcription: 'Special characters test',
        summary: 'Test with emojis and special characters',
        bot_conversation: specialConversation
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(sessionData)
        .expect(201);

      expect(response.body.result.bot_conversation).toBe(specialConversation);
    });
  });
});
