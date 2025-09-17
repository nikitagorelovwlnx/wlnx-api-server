import request from 'supertest';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

import userRoutes from '../routes/userRoutes';
import calendarRoutes from '../routes/calendarRoutes';
import telegramRoutes from '../routes/telegramRoutes';
import interviewRoutes from '../routes/interviewRoutes';

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes - match the actual structure from index.ts
app.use('/api/users', userRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/interviews', interviewRoutes);

describe('API Integration Tests', () => {
  // Helper function to create a user and get auth token
  const createUserAndGetToken = async (email: string = 'test@example.com') => {
    const response = await request(app)
      .post('/api/users/register')
      .send({
        email,
        password: 'password123',
        first_name: 'Test',
        last_name: 'User',
      });
    
    return {
      token: response.body.token,
      userId: response.body.user.id,
    };
  };

  describe('User Authentication', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          first_name: 'Test',
          last_name: 'User',
        });

      expect(response.status).toBe(201);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeDefined();
    });

    it('should login with correct credentials', async () => {
      // First create a user
      await request(app)
        .post('/api/users/register')
        .send({
          email: 'login@example.com',
          password: 'password123',
          first_name: 'Login',
          last_name: 'Test',
        });

      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'login@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('login@example.com');
      expect(response.body.token).toBeDefined();
    });

    it('should get current user info', async () => {
      const { token } = await createUserAndGetToken('userinfo@example.com');
      
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('userinfo@example.com');
    });

    it('should update user info', async () => {
      const { token } = await createUserAndGetToken('update@example.com');
      
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${token}`)
        .send({
          first_name: 'Updated',
          last_name: 'Name',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.first_name).toBe('Updated');
      expect(response.body.user.last_name).toBe('Name');
    });
  });

  describe('Calendar Integration', () => {
    it('should create calendar integration', async () => {
      const { token } = await createUserAndGetToken('calendar@example.com');
      
      const response = await request(app)
        .post('/api/calendar')
        .set('Authorization', `Bearer ${token}`)
        .send({
          provider: 'google',
          access_token: 'test_access_token',
          calendar_id: 'test_calendar_id',
        });

      expect(response.status).toBe(201);
      expect(response.body.integration.provider).toBe('google');
    });

    it('should get calendar integrations', async () => {
      const { token } = await createUserAndGetToken('calendarget@example.com');
      
      const response = await request(app)
        .get('/api/calendar')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.integrations)).toBe(true);
    });
  });

  describe('Telegram Integration', () => {
    it('should create telegram integration', async () => {
      const { token } = await createUserAndGetToken('telegram@example.com');
      
      const response = await request(app)
        .post('/api/telegram')
        .set('Authorization', `Bearer ${token}`)
        .send({
          telegram_user_id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          chat_id: 987654321,
        });

      expect(response.status).toBe(201);
      expect(response.body.integration.telegram_user_id).toBe("123456789");
    });

    it('should get telegram integrations', async () => {
      const { token } = await createUserAndGetToken('telegramget@example.com');
      
      const response = await request(app)
        .get('/api/telegram')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.integrations)).toBe(true);
    });
  });

  describe('Interview Results', () => {
    it('should create interview result', async () => {
      const { token } = await createUserAndGetToken('interview@example.com');
      
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'This is a test interview transcription',
          summary: 'Test summary of the interview',
        });

      expect(response.status).toBe(201);
      expect(response.body.result.transcription).toBe('This is a test interview transcription');
      expect(response.body.result.summary).toBe('Test summary of the interview');
    });

    it('should get interview results', async () => {
      const { token } = await createUserAndGetToken('interviewget@example.com');
      
      const response = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.results)).toBe(true);
    });

    it('should get specific interview result', async () => {
      const { token } = await createUserAndGetToken('interviewgetspecific@example.com');
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'To be retrieved transcription',
          summary: 'To be retrieved summary',
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .get(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.result.transcription).toBe('To be retrieved transcription');
      expect(response.body.result.summary).toBe('To be retrieved summary');
    });

    it('should update interview result', async () => {
      const { token } = await createUserAndGetToken('interviewupdate@example.com');
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'Original transcription',
          summary: 'Original summary',
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .put(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'Updated transcription',
          summary: 'Updated summary',
        });

      expect(response.status).toBe(200);
      expect(response.body.result.transcription).toBe('Updated transcription');
      expect(response.body.result.summary).toBe('Updated summary');
    });

    it('should delete interview result', async () => {
      const { token } = await createUserAndGetToken('interviewdelete@example.com');
      
      // First create an interview
      const createResponse = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${token}`)
        .send({
          transcription: 'To be deleted transcription',
          summary: 'To be deleted summary',
        });
      
      const interviewId = createResponse.body.result.id;
      
      const response = await request(app)
        .delete(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Interview result deleted successfully');
    });
  });

  describe('Error Handling', () => {
    it('should return 401 for unauthorized requests', async () => {
      const response = await request(app)
        .get('/api/users/me');

      expect(response.status).toBe(401);
    });

    it('should return 400 for invalid registration data', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'invalid-email',
        });

      expect(response.status).toBe(400);
    });

    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/api/nonexistent');

      expect(response.status).toBe(404);
    });
  });
});
