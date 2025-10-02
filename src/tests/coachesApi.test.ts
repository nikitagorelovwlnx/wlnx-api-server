import request from 'supertest';
import { testDb, setupTestDb } from '../database/knex.test';
import { app } from './testApp';

describe('Coaches API', () => {
  let defaultCoachId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    // Clean up and create fresh test coach for each test
    await testDb('coaches').del();
    
    const [coach] = await testDb('coaches').insert({
      name: 'Test Wellness Coach',
      description: 'Test coach for API testing',
      coach_prompt_content: 'You are a test wellness coach. Be helpful and supportive.',
      is_active: true,
      tags: ['test', 'wellness']
    }).returning('*');
    
    defaultCoachId = coach.id;
  });

  afterEach(async () => {
    // Clean up test data after each test
    await testDb('coaches').del();
  });

  describe('GET /api/coaches', () => {
    it('should return all coaches', async () => {
      const response = await request(app)
        .get('/api/coaches')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.data.length).toBeGreaterThan(0);
      
      const coach = response.body.data.find((c: any) => c.id === defaultCoachId);
      expect(coach).toMatchObject({
        id: defaultCoachId,
        name: 'Test Wellness Coach',
        description: 'Test coach for API testing',
        coach_prompt_content: 'You are a test wellness coach. Be helpful and supportive.',
        is_active: true,
        tags: ['test', 'wellness']
      });
      expect(coach.created_at).toBeDefined();
      expect(coach.updated_at).toBeDefined();
    });

    it('should return coaches in consistent format', async () => {
      const response = await request(app)
        .get('/api/coaches')
        .expect(200);

      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      
      response.body.data.forEach((coach: any) => {
        expect(coach).toHaveProperty('id');
        expect(coach).toHaveProperty('name');
        expect(coach).toHaveProperty('coach_prompt_content');
        expect(coach).toHaveProperty('is_active');
        expect(coach).toHaveProperty('created_at');
        expect(coach).toHaveProperty('updated_at');
        expect(typeof coach.id).toBe('string');
        expect(typeof coach.name).toBe('string');
        expect(typeof coach.coach_prompt_content).toBe('string');
        expect(typeof coach.is_active).toBe('boolean');
      });
    });
  });

  describe('GET /api/coaches/:id', () => {
    it('should return specific coach by ID', async () => {
      const response = await request(app)
        .get(`/api/coaches/${defaultCoachId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: defaultCoachId,
        name: 'Test Wellness Coach',
        description: 'Test coach for API testing',
        coach_prompt_content: 'You are a test wellness coach. Be helpful and supportive.',
        is_active: true,
        tags: ['test', 'wellness']
      });
    });

    it('should return 404 for non-existent coach', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/coaches/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should return 404 for invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/coaches/invalid-uuid')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/coaches/:id', () => {
    it('should update coach prompt content', async () => {
      const newPromptContent = 'You are an updated test wellness coach. Focus on mindfulness and stress reduction techniques.';
      
      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({
          coach_prompt_content: newPromptContent
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.coach_prompt_content).toBe(newPromptContent);
      expect(response.body.data.id).toBe(defaultCoachId);
      expect(response.body.data.name).toBe('Test Wellness Coach'); // Should remain unchanged
      expect(response.body.message).toContain('updated successfully');
      
      // Verify updated_at timestamp changed
      expect(new Date(response.body.data.updated_at).getTime()).toBeGreaterThan(
        new Date(response.body.data.created_at).getTime()
      );
    });

    it('should handle very long prompt content', async () => {
      const longPrompt = 'You are a comprehensive wellness coach. '.repeat(100) + 
        'Your role includes: ' + Array(50).fill(0).map((_, i) => `Point ${i + 1}`).join(', ');
      
      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({
          coach_prompt_content: longPrompt
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.coach_prompt_content).toBe(longPrompt);
      expect(response.body.data.coach_prompt_content.length).toBeGreaterThan(1000);
    });

    it('should handle prompt content with special characters and emojis', async () => {
      const specialPrompt = `You are a modern wellness coach 🧘‍♀️. Your approach includes:
- Empathy and understanding 💝
- Evidence-based techniques 📚
- Personalized recommendations 🎯
- Cultural sensitivity 🌍
- Mindfulness practices 🧠

Use emojis appropriately and maintain a warm, supportive tone! 😊`;

      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({
          coach_prompt_content: specialPrompt
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.coach_prompt_content).toBe(specialPrompt);
    });

    it('should return 400 for missing coach_prompt_content', async () => {
      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('coach_prompt_content is required');
    });

    it('should return 400 for empty coach_prompt_content', async () => {
      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({
          coach_prompt_content: ''
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cannot be empty');
    });

    it('should return 400 for whitespace-only coach_prompt_content', async () => {
      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({
          coach_prompt_content: '   \n\t   '
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('cannot be empty');
    });

    it('should return 404 for non-existent coach', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .put(`/api/coaches/${fakeId}`)
        .send({
          coach_prompt_content: 'This should fail'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should ignore other fields and only update coach_prompt_content', async () => {
      const originalCoach = await testDb('coaches').where('id', defaultCoachId).first();
      
      const response = await request(app)
        .put(`/api/coaches/${defaultCoachId}`)
        .send({
          coach_prompt_content: 'Updated prompt content only',
          name: 'Hacker Attempt Name',
          description: 'Hacker Attempt Description',
          is_active: false,
          tags: ['hacker', 'attempt']
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.coach_prompt_content).toBe('Updated prompt content only');
      
      // These fields should remain unchanged
      expect(response.body.data.name).toBe(originalCoach.name);
      expect(response.body.data.description).toBe(originalCoach.description);
      expect(response.body.data.is_active).toBe(originalCoach.is_active);
      expect(response.body.data.tags).toEqual(originalCoach.tags);
    });
  });

  describe('Error handling', () => {
    it('should return proper error format', async () => {
      // Test with invalid UUID that passes regex but doesn't exist
      const fakeId = '12345678-1234-1234-1234-123456789012';
      
      const response = await request(app)
        .get(`/api/coaches/${fakeId}`)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(typeof response.body.error).toBe('string');
    });

    it('should handle database connection errors gracefully', async () => {
      // Test by breaking the coach service temporarily
      const originalGetAllCoaches = require('../services/coachService').getAllCoaches;
      
      // Mock the service to throw an error
      const coachService = require('../services/coachService');
      coachService.getAllCoaches = jest.fn().mockRejectedValue(new Error('Database connection failed'));
      
      const response = await request(app)
        .get('/api/coaches')
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Failed to fetch coaches');
      
      // Restore original function
      coachService.getAllCoaches = originalGetAllCoaches;
    });
  });

  describe('Coach data validation', () => {
    it('should handle null values correctly', async () => {
      // Delete existing coach and create one with null description
      await testDb('coaches').del();
      const [coach] = await testDb('coaches').insert({
        name: 'Coach with Null Description',
        description: null,
        coach_prompt_content: 'Test prompt',
        is_active: true,
        tags: null
      }).returning('*');

      const response = await request(app)
        .get(`/api/coaches/${coach.id}`)
        .expect(200);

      expect(response.body.data.description).toBeNull();
      expect(response.body.data.tags).toBeNull();
    });

    it('should handle empty arrays correctly', async () => {
      // Delete existing coach and create one with empty tags array
      await testDb('coaches').del();
      const [coach] = await testDb('coaches').insert({
        name: 'Coach with Empty Tags',
        description: 'Test description',
        coach_prompt_content: 'Test prompt',
        is_active: true,
        tags: []
      }).returning('*');

      const response = await request(app)
        .get(`/api/coaches/${coach.id}`)
        .expect(200);

      expect(response.body.data.tags).toEqual([]);
    });
  });
});
