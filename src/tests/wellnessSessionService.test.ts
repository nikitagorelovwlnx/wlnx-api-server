import { WellnessSessionService } from '../services/wellnessSessionService';
import { testDb } from '../database/knex.test';

describe('WellnessSessionService', () => {
  let wellnessSessionService: WellnessSessionService;

  beforeAll(() => {
    wellnessSessionService = new WellnessSessionService(testDb);
  });

  describe('createWellnessSession', () => {
    it('should create a new wellness session successfully', async () => {
      const email = 'test@example.com';
      const sessionData = {
        transcription: 'Test transcription content',
        summary: 'Test summary content'
      };

      const result = await wellnessSessionService.createWellnessSession(email, sessionData);

      expect(result).toHaveProperty('id');
      expect(result.user_id).toBe(email);
      expect(result.transcription).toBe(sessionData.transcription);
      expect(result.summary).toBe(sessionData.summary);
      expect(result).toHaveProperty('created_at');
      expect(result).toHaveProperty('updated_at');
    });
  });

  describe('getWellnessSessionsByUserId', () => {
    it('should return sessions for specific user', async () => {
      const email = 'gettest@example.com';
      
      // Create a session first
      await wellnessSessionService.createWellnessSession(email, {
        transcription: 'Test transcription for get',
        summary: 'Test summary for get'
      });

      const results = await wellnessSessionService.getWellnessSessionsByUserId(email);

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThan(0);
      expect(results[0].user_id).toBe(email);
    });

    it('should respect limit and offset parameters', async () => {
      const email = 'pagination@example.com';
      
      // Create multiple sessions
      for (let i = 0; i < 5; i++) {
        await wellnessSessionService.createWellnessSession(email, {
          transcription: `Test transcription ${i}`,
          summary: `Test summary ${i}`
        });
      }

      const results = await wellnessSessionService.getWellnessSessionsByUserId(email, 2, 1);

      expect(results.length).toBeLessThanOrEqual(2);
    });
  });

  describe('getWellnessSessionById', () => {
    it('should return session by id for correct user', async () => {
      const email = 'getbyid@example.com';
      
      const created = await wellnessSessionService.createWellnessSession(email, {
        transcription: 'Test transcription for get by id',
        summary: 'Test summary for get by id'
      });

      const result = await wellnessSessionService.getWellnessSessionById(created.id, email);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(created.id);
      expect(result!.user_id).toBe(email);
    });

    it('should return null for wrong user', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      
      const created = await wellnessSessionService.createWellnessSession(email1, {
        transcription: 'Test transcription',
        summary: 'Test summary'
      });

      const result = await wellnessSessionService.getWellnessSessionById(created.id, email2);

      expect(result).toBeNull();
    });

    it('should return null for non-existent session', async () => {
      const result = await wellnessSessionService.getWellnessSessionById('00000000-0000-0000-0000-000000000000', 'test@example.com');

      expect(result).toBeNull();
    });
  });

  describe('updateWellnessSession', () => {
    it('should update session successfully', async () => {
      const email = 'update@example.com';
      
      const created = await wellnessSessionService.createWellnessSession(email, {
        transcription: 'Original transcription',
        summary: 'Original summary'
      });

      // Add small delay to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const updatedData = {
        transcription: 'Updated transcription',
        summary: 'Updated summary'
      };

      const result = await wellnessSessionService.updateWellnessSession(created.id, email, updatedData);

      expect(result).not.toBeNull();
      expect(result!.transcription).toBe(updatedData.transcription);
      expect(result!.summary).toBe(updatedData.summary);
      expect(new Date(result!.updated_at).getTime()).toBeGreaterThan(new Date(created.updated_at).getTime());
    });

    it('should return null for wrong user', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      
      const created = await wellnessSessionService.createWellnessSession(email1, {
        transcription: 'Test transcription',
        summary: 'Test summary'
      });

      const result = await wellnessSessionService.updateWellnessSession(created.id, email2, {
        transcription: 'Updated transcription'
      });

      expect(result).toBeNull();
    });
  });

  describe('deleteWellnessSession', () => {
    it('should delete session successfully', async () => {
      const email = 'delete@example.com';
      
      const created = await wellnessSessionService.createWellnessSession(email, {
        transcription: 'Test transcription for delete',
        summary: 'Test summary for delete'
      });

      const success = await wellnessSessionService.deleteWellnessSession(created.id, email);

      expect(success).toBe(true);

      // Verify it's actually deleted
      const result = await wellnessSessionService.getWellnessSessionById(created.id, email);
      expect(result).toBeNull();
    });

    it('should return false for wrong user', async () => {
      const email1 = 'user1@example.com';
      const email2 = 'user2@example.com';
      
      const created = await wellnessSessionService.createWellnessSession(email1, {
        transcription: 'Test transcription',
        summary: 'Test summary'
      });

      const success = await wellnessSessionService.deleteWellnessSession(created.id, email2);

      expect(success).toBe(false);
    });

    it('should return false for non-existent session', async () => {
      const success = await wellnessSessionService.deleteWellnessSession('00000000-0000-0000-0000-000000000000', 'test@example.com');

      expect(success).toBe(false);
    });
  });

  describe('getAllWellnessSessions', () => {
    it('should return all sessions from all users', async () => {
      // Create sessions for multiple users
      await wellnessSessionService.createWellnessSession('user1@example.com', {
        transcription: 'User 1 transcription',
        summary: 'User 1 summary'
      });
      
      await wellnessSessionService.createWellnessSession('user2@example.com', {
        transcription: 'User 2 transcription',
        summary: 'User 2 summary'
      });

      const results = await wellnessSessionService.getAllWellnessSessions();

      expect(Array.isArray(results)).toBe(true);
      expect(results.length).toBeGreaterThanOrEqual(2);
      
      const userIds = results.map(r => r.user_id);
      expect(userIds).toContain('user1@example.com');
      expect(userIds).toContain('user2@example.com');
    });
  });
});
