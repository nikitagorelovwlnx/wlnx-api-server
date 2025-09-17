import request from 'supertest';
import { app } from '../app';
import { db } from '../database/knex';

describe('Wellness Coach Interview API', () => {
  // Helper function to create a user and get auth token
  const createUserAndGetToken = async (email: string = 'test@example.com') => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email,
        password: 'testpassword123',
        first_name: 'Test',
        last_name: 'User'
      });
    
    return {
      token: response.body.token,
      userId: response.body.user.id,
    };
  };

  describe('POST /interviews', () => {
    it('should create a new wellness coach interview', async () => {
      const { token, userId } = await createUserAndGetToken('create-interview@example.com');
      
      const interviewData = {
        transcription: 'This is a test transcription of a wellness coaching session. Coach: How are you feeling today? Client: I feel stressed about work...',
        summary: 'Client discussed work-related stress. Recommended mindfulness techniques and work-life balance strategies.'
      };

      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send(interviewData);

      expect(response.status).toBe(201);
      expect(response.body.result).toHaveProperty('id');
      expect(response.body.result.user_id).toBe(userId);
      expect(response.body.result.transcription).toBe(interviewData.transcription);
      expect(response.body.result.summary).toBe(interviewData.summary);
      expect(response.body.result).toHaveProperty('created_at');
      expect(response.body.result).toHaveProperty('updated_at');
    });

    it('should return 400 if transcription is missing', async () => {
      const { token } = await createUserAndGetToken('missing-transcription@example.com');
      
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          summary: 'Test summary without transcription'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Transcription is required');
    });

    it('should return 400 if summary is missing', async () => {
      const { token } = await createUserAndGetToken('missing-summary@example.com');
      
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'Test transcription without summary'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Summary is required');
    });

    it('should return 401 if no auth token provided', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          transcription: 'Test transcription',
          summary: 'Test summary'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /interviews', () => {
    it('should get all interviews for authenticated user', async () => {
      const { token } = await createUserAndGetToken('get-interviews@example.com');
      
      // Create an interview first
      await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'Test transcription for get all',
          summary: 'Test summary for get all'
        });
      
      const response = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.results[0]).toHaveProperty('transcription');
      expect(response.body.results[0]).toHaveProperty('summary');
    });

    it('should support pagination', async () => {
      const { token } = await createUserAndGetToken('pagination@example.com');
      
      const response = await request(app)
        .get('/api/interviews?limit=1&offset=0')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /interviews/:id', () => {
    it('should get specific interview by id', async () => {
      const { token } = await createUserAndGetToken('get-specific@example.com');
      
      // Create an interview first
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'Test transcription for get specific',
          summary: 'Test summary for get specific'
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .get(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.result.id).toBe(interviewId);
      expect(response.body.result).toHaveProperty('transcription');
      expect(response.body.result).toHaveProperty('summary');
    });

    it('should return 404 for non-existent interview', async () => {
      const { token } = await createUserAndGetToken('get-404@example.com');
      
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/interviews/${fakeId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /interviews/:id', () => {
    it('should update interview transcription and summary', async () => {
      const { token } = await createUserAndGetToken('update-interview@example.com');
      
      // Create an interview first
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'Original transcription',
          summary: 'Original summary'
        });
      
      const interviewId = createResponse.body.result.id;
      
      const updatedData = {
        transcription: 'Updated transcription with more details...',
        summary: 'Updated summary with additional insights...'
      };

      const response = await request(app)
        .put(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.result.transcription).toBe(updatedData.transcription);
      expect(response.body.result.summary).toBe(updatedData.summary);
      expect(new Date(response.body.result.updated_at)).toBeInstanceOf(Date);
    });
  });

  describe('DELETE /interviews/:id', () => {
    it('should delete interview', async () => {
      const { token } = await createUserAndGetToken('delete-interview@example.com');
      
      // Create an interview first
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'To be deleted transcription',
          summary: 'To be deleted summary'
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .delete(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Interview result deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
