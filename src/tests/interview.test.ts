import request from 'supertest';
import { app } from '../app';
import { db } from '../database/knex';

describe('Wellness Coach Interview API', () => {

  describe('POST /interviews', () => {
    it('should create a new wellness coach interview with email', async () => {
      const interviewData = {
        email: 'testuser@example.com',
        transcription: 'This is a test transcription of a wellness coaching session. Coach: How are you feeling today? Client: I feel stressed about work...',
        summary: 'Client discussed work-related stress. Recommended mindfulness techniques and work-life balance strategies.'
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(interviewData);

      expect(response.status).toBe(201);
      expect(response.body.result).toHaveProperty('id');
      expect(response.body.result.user_id).toBe(interviewData.email);
      expect(response.body.result.transcription).toBe(interviewData.transcription);
      expect(response.body.result.summary).toBe(interviewData.summary);
      expect(response.body.result).toHaveProperty('created_at');
      expect(response.body.result).toHaveProperty('updated_at');
    });

    it('should return 400 if email is missing', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          transcription: 'Test transcription',
          summary: 'Test summary'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email is required');
    });

    it('should return 400 if transcription is missing', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'test@example.com',
          summary: 'Test summary without transcription'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Transcription is required');
    });

    it('should return 400 if summary is missing', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'test@example.com',
          transcription: 'Test transcription without summary'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Summary is required');
    });

  });

  describe('GET /interviews', () => {
    it('should get all interviews for specific email', async () => {
      const testEmail = 'getall@example.com';
      
      // Create an interview first
      await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Test transcription for get all',
          summary: 'Test summary for get all'
        });
      
      const response = await request(app)
        .get(`/api/interviews?email=${testEmail}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.results[0]).toHaveProperty('transcription');
      expect(response.body.results[0]).toHaveProperty('summary');
      expect(response.body.results[0].user_id).toBe(testEmail);
    });

    it('should return 400 if email parameter is missing', async () => {
      const response = await request(app)
        .get('/api/interviews');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email parameter is required');
    });

    it('should support pagination', async () => {
      const testEmail = 'pagination@example.com';
      
      const response = await request(app)
        .get(`/api/interviews?email=${testEmail}&limit=1&offset=0`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeLessThanOrEqual(1);
    });
  });

  describe('GET /interviews/:id', () => {
    it('should get specific interview by id with email', async () => {
      const testEmail = 'getspecific@example.com';
      
      // Create an interview first
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Test transcription for get specific',
          summary: 'Test summary for get specific'
        });
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.result).toHaveProperty('id');
      
      const interviewId = createResponse.body.result.id;
      
      // Verify the interview was created by checking the list
      const listResponse = await request(app)
        .get(`/api/interviews?email=${testEmail}`);
      
      expect(listResponse.status).toBe(200);
      expect(listResponse.body.results.length).toBe(1);
      
      const response = await request(app)
        .get(`/api/interviews/${interviewId}?email=${testEmail}`);

      expect(response.status).toBe(200);
      expect(response.body.result.id).toBe(interviewId);
      expect(response.body.result).toHaveProperty('transcription');
      expect(response.body.result).toHaveProperty('summary');
      expect(response.body.result.user_id).toBe(testEmail);
    });

    it('should return 400 if email parameter is missing', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/api/interviews/${fakeId}`);

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email parameter is required');
    });

    it('should return 404 for non-existent interview', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const testEmail = 'nonexistent@example.com';
      
      const response = await request(app)
        .get(`/api/interviews/${fakeId}?email=${testEmail}`);

      expect(response.status).toBe(404);
    });
  });

  describe('PUT /interviews/:id', () => {
    it('should update interview transcription and summary with email', async () => {
      const testEmail = 'update@example.com';
      
      // Create an interview first
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Original transcription',
          summary: 'Original summary'
        });
      
      const interviewId = createResponse.body.result.id;
      
      const updatedData = {
        email: testEmail,
        transcription: 'Updated transcription with more details...',
        summary: 'Updated summary with additional insights...'
      };

      const response = await request(app)
        .put(`/api/interviews/${interviewId}`)
        .send(updatedData);

      expect(response.status).toBe(200);
      expect(response.body.result.transcription).toBe(updatedData.transcription);
      expect(response.body.result.summary).toBe(updatedData.summary);
      expect(new Date(response.body.result.updated_at)).toBeInstanceOf(Date);
    });
  });

  describe('DELETE /interviews/:id', () => {
    it('should delete interview with email', async () => {
      const testEmail = 'delete@example.com';
      
      // Create an interview first
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'To be deleted transcription',
          summary: 'To be deleted summary'
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .delete(`/api/interviews/${interviewId}`)
        .send({ email: testEmail });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Interview result deleted successfully');

      // Verify it's actually deleted
      const getResponse = await request(app)
        .get(`/api/interviews/${interviewId}?email=${testEmail}`);

      expect(getResponse.status).toBe(404);
    });
  });
});
