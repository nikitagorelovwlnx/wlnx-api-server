import request from 'supertest';
import { app } from './testApp';

describe('API Integration Tests', () => {


  describe('Wellness Sessions with Email Identification', () => {
    it('should create wellness session with email', async () => {
      const testEmail = 'interview@example.com';
      
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'This is a test interview transcription',
          summary: 'Test summary of the interview',
        });

      expect(response.status).toBe(201);
      expect(response.body.result.transcription).toBe('This is a test interview transcription');
      expect(response.body.result.summary).toBe('Test summary of the interview');
      expect(response.body.result.user_id).toBe(testEmail);
    });

    it('should get interview results by email', async () => {
      const testEmail = 'interviewget@example.com';
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Test transcription for get',
          summary: 'Test summary for get',
        });
      
      expect(createResponse.status).toBe(201);
      
      const response = await request(app)
        .get(`/api/interviews?email=${testEmail}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBeGreaterThan(0);
      expect(response.body.results[0].user_id).toBe(testEmail);
    });

    it('should get specific interview result by id and email', async () => {
      const testEmail = 'interviewgetspecific@example.com';
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'To be retrieved transcription',
          summary: 'To be retrieved summary',
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
      expect(response.body.result.transcription).toBe('To be retrieved transcription');
      expect(response.body.result.summary).toBe('To be retrieved summary');
      expect(response.body.result.user_id).toBe(testEmail);
    });

    it('should update interview result with email', async () => {
      const testEmail = 'interviewupdate@example.com';
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Original transcription',
          summary: 'Original summary',
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .put(`/api/interviews/${interviewId}`)
        .send({
          email: testEmail,
          transcription: 'Updated transcription',
          summary: 'Updated summary',
        });

      expect(response.status).toBe(200);
      expect(response.body.result.transcription).toBe('Updated transcription');
      expect(response.body.result.summary).toBe('Updated summary');
    });

    it('should delete interview result with email', async () => {
      const testEmail = 'interviewdelete@example.com';
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'To be deleted transcription',
          summary: 'To be deleted summary',
        });
      
      expect(createResponse.status).toBe(201);
      expect(createResponse.body.result).toHaveProperty('id');
      
      const interviewId = createResponse.body.result.id;
      
      // Verify the interview exists before deleting
      const getResponse = await request(app)
        .get(`/api/interviews/${interviewId}?email=${testEmail}`);
      
      expect(getResponse.status).toBe(200);
      
      const response = await request(app)
        .delete(`/api/interviews/${interviewId}`)
        .send({ email: testEmail });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Interview result deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 400 for missing email in interview creation', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          transcription: 'Test transcription',
          summary: 'Test summary'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email is required');
    });

    it('should return 400 for missing email parameter in GET requests', async () => {
      const response = await request(app)
        .get('/api/interviews');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email parameter is required');
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
