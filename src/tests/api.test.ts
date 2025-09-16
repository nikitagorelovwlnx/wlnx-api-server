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

// Routes
app.use('/api/users', userRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/telegram', telegramRoutes);
app.use('/api/interviews', interviewRoutes);

describe('API Integration Tests', () => {
  let authToken: string;
  let userId: string;

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
      
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    it('should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'test@example.com',
          password: 'password123',
        });

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeDefined();
    });

    it('should get current user info', async () => {
      const response = await request(app)
        .get('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user.email).toBe('test@example.com');
    });

    it('should update user info', async () => {
      const response = await request(app)
        .put('/api/users/me')
        .set('Authorization', `Bearer ${authToken}`)
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
      const response = await request(app)
        .post('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          provider: 'google',
          access_token: 'test_access_token',
          calendar_id: 'test_calendar_id',
        });

      expect(response.status).toBe(201);
      expect(response.body.integration.provider).toBe('google');
    });

    it('should get calendar integrations', async () => {
      const response = await request(app)
        .get('/api/calendar')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.integrations)).toBe(true);
    });
  });

  describe('Telegram Integration', () => {
    it('should create telegram integration', async () => {
      const response = await request(app)
        .post('/api/telegram')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          telegram_user_id: 123456789,
          username: 'testuser',
          first_name: 'Test',
          chat_id: 987654321,
        });

      expect(response.status).toBe(201);
      expect(response.body.integration.telegram_user_id).toBe(123456789);
    });

    it('should get telegram integrations', async () => {
      const response = await request(app)
        .get('/api/telegram')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.integrations)).toBe(true);
    });
  });

  describe('Interview Results', () => {
    let interviewId: string;

    it('should create interview result', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Test Interview',
          content: 'This is a test interview result content',
          metadata: { score: 85, duration: 30 },
        });

      expect(response.status).toBe(201);
      expect(response.body.result.title).toBe('Test Interview');
      expect(response.body.result.content).toBe('This is a test interview result content');
      
      interviewId = response.body.result.id;
    });

    it('should get interview results', async () => {
      const response = await request(app)
        .get('/api/interviews')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.results)).toBe(true);
      expect(response.body.results.length).toBeGreaterThan(0);
    });

    it('should get specific interview result', async () => {
      const response = await request(app)
        .get(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.result.id).toBe(interviewId);
    });

    it('should update interview result', async () => {
      const response = await request(app)
        .put(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Updated Interview',
          content: 'Updated content',
        });

      expect(response.status).toBe(200);
      expect(response.body.result.title).toBe('Updated Interview');
    });

    it('should delete interview result', async () => {
      const response = await request(app)
        .delete(`/api/interviews/${interviewId}`)
        .set('Authorization', `Bearer ${authToken}`);

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
