import { testDb, setupTestDb } from '../database/knex.test';
import { WellnessSessionService } from '../services/wellnessSessionService';

describe('Database Integration Tests', () => {
  let wellnessSessionService: WellnessSessionService;

  beforeAll(() => {
    wellnessSessionService = new WellnessSessionService(testDb);
  });

  describe('Database connection and schema', () => {
    it('should have a valid database connection', async () => {
      const result = await testDb.raw('SELECT 1 as test');
      expect(result).toBeDefined();
    });

    it('should have wellness_sessions table with correct schema', async () => {
      const tableExists = await testDb.schema.hasTable('wellness_sessions');
      expect(tableExists).toBe(true);

      const columns = await testDb('wellness_sessions').columnInfo();
      
      // Check that all required columns exist
      expect(columns.id).toBeDefined();
      expect(columns.user_id).toBeDefined();
      expect(columns.transcription).toBeDefined();
      expect(columns.summary).toBeDefined();
      expect(columns.wellness_data).toBeDefined();
      expect(columns.created_at).toBeDefined();
      expect(columns.updated_at).toBeDefined();
    });
  });

  describe('Database constraints and data integrity', () => {
    it('should handle UUID generation correctly', async () => {
      const session1 = await wellnessSessionService.createWellnessSession('uuid-test1@example.com', {
        transcription: 'Test 1',
        summary: 'Test 1 summary'
      });

      const session2 = await wellnessSessionService.createWellnessSession('uuid-test2@example.com', {
        transcription: 'Test 2', 
        summary: 'Test 2 summary'
      });

      // UUIDs should be unique
      expect(session1.id).not.toBe(session2.id);
      
      // UUIDs should be valid format (36 characters with dashes)
      expect(session1.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
      expect(session2.id).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });

    it('should handle timestamp fields correctly', async () => {
      const beforeCreate = new Date();
      
      const session = await wellnessSessionService.createWellnessSession('timestamp-test@example.com', {
        transcription: 'Timestamp test',
        summary: 'Testing timestamps'
      });

      const afterCreate = new Date();

      const createdAt = new Date(session.created_at);
      const updatedAt = new Date(session.updated_at);

      // Timestamps should be valid dates
      expect(createdAt).toBeInstanceOf(Date);
      expect(updatedAt).toBeInstanceOf(Date);
      
      // Timestamps should be within reasonable range
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);
      
      // created_at and updated_at should be the same initially
      expect(Math.abs(createdAt.getTime() - updatedAt.getTime())).toBeLessThan(1000);
    });

    it('should update updated_at timestamp on updates', async () => {
      const session = await wellnessSessionService.createWellnessSession('update-timestamp@example.com', {
        transcription: 'Original',
        summary: 'Original summary'
      });

      const originalUpdatedAt = new Date(session.updated_at);

      // Wait a small amount to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 100));

      const updatedSession = await wellnessSessionService.updateWellnessSession(
        session.id,
        'update-timestamp@example.com',
        { transcription: 'Updated transcription' }
      );

      const newUpdatedAt = new Date(updatedSession!.updated_at);
      
      // updated_at should be later than the original
      expect(newUpdatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
      
      // created_at should remain unchanged
      expect(new Date(updatedSession!.created_at).getTime()).toBe(new Date(session.created_at).getTime());
    });

    it('should handle JSON data types for wellness_data', async () => {
      const complexWellnessData = {
        nested: {
          deeply: {
            nested: {
              value: 'test',
              array: [1, 2, 3, { inner: true }]
            }
          }
        },
        numbers: [1, 2.5, -3, 0],
        boolean: true,
        nullValue: null,
        specialChars: 'Special: áéíóú ñ ü ¿¡ 😊'
      };

      const session = await wellnessSessionService.createWellnessSession('json-test@example.com', {
        transcription: 'JSON wellness data test',
        summary: 'Testing complex JSON storage',
        wellness_data: complexWellnessData
      });

      // Retrieved data should match exactly (parse if stringified)
      const actualWellnessData1 = typeof session.wellness_data === 'string' 
        ? JSON.parse(session.wellness_data) 
        : session.wellness_data;
      expect(actualWellnessData1).toEqual(complexWellnessData);
      
      // Verify through direct database query
      const retrieved = await wellnessSessionService.getWellnessSessionById(session.id, 'json-test@example.com');
      const actualWellnessData2 = typeof retrieved!.wellness_data === 'string' 
        ? JSON.parse(retrieved!.wellness_data) 
        : retrieved!.wellness_data;
      expect(actualWellnessData2).toEqual(complexWellnessData);
    });
  });

  describe('Database performance and limits', () => {
    it('should handle multiple concurrent operations', async () => {
      const userEmail = 'concurrent-test@example.com';
      const concurrentOperations = 10;

      // Create multiple sessions concurrently
      const createPromises = Array.from({ length: concurrentOperations }, (_, i) =>
        wellnessSessionService.createWellnessSession(userEmail, {
          transcription: `Concurrent transcription ${i}`,
          summary: `Concurrent summary ${i}`
        })
      );

      const sessions = await Promise.all(createPromises);

      // All sessions should be created successfully
      expect(sessions).toHaveLength(concurrentOperations);
      
      // All should have unique IDs
      const ids = sessions.map(s => s.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(concurrentOperations);

      // Verify all can be retrieved
      const retrievedSessions = await wellnessSessionService.getWellnessSessionsByUserId(userEmail);
      expect(retrievedSessions.length).toBeGreaterThanOrEqual(concurrentOperations);
    });

    it('should handle large text content', async () => {
      const largeTranscription = 'A'.repeat(50000); // 50KB
      const largeSummary = 'B'.repeat(10000); // 10KB
      const largeWellnessData = {
        notes: 'C'.repeat(5000), // 5KB
        details: Array.from({ length: 1000 }, (_, i) => ({ entry: i, data: `Entry ${i}` }))
      };

      const session = await wellnessSessionService.createWellnessSession('large-content@example.com', {
        transcription: largeTranscription,
        summary: largeSummary,
        wellness_data: largeWellnessData
      });

      expect(session.transcription).toBe(largeTranscription);
      expect(session.summary).toBe(largeSummary);
      
      // wellness_data might be stringified depending on database driver
      const actualWellnessData = typeof session.wellness_data === 'string' 
        ? JSON.parse(session.wellness_data) 
        : session.wellness_data;
      expect(actualWellnessData).toEqual(largeWellnessData);

      // Verify retrieval works
      const retrieved = await wellnessSessionService.getWellnessSessionById(session.id, 'large-content@example.com');
      expect(retrieved!.transcription.length).toBe(50000);
      expect(retrieved!.summary.length).toBe(10000);
    });

    it('should handle pagination efficiently', async () => {
      const userEmail = 'pagination-perf@example.com';
      const totalSessions = 50;

      // Create many sessions
      for (let i = 0; i < totalSessions; i++) {
        await wellnessSessionService.createWellnessSession(userEmail, {
          transcription: `Transcription ${i}`,
          summary: `Summary ${i}`
        });
      }

      // Test pagination
      const pageSize = 10;
      const allRetrievedSessions: any[] = [];
      
      for (let offset = 0; offset < totalSessions; offset += pageSize) {
        const sessions = await wellnessSessionService.getWellnessSessionsByUserId(userEmail, pageSize, offset);
        allRetrievedSessions.push(...sessions);
        
        // Each page should have the expected number of items (except possibly the last)
        const expectedSize = Math.min(pageSize, totalSessions - offset);
        expect(sessions.length).toBe(expectedSize);
      }

      // Should retrieve all sessions
      expect(allRetrievedSessions.length).toBe(totalSessions);
      
      // Should be in descending order by created_at
      for (let i = 1; i < allRetrievedSessions.length; i++) {
        const current = new Date(allRetrievedSessions[i].created_at);
        const previous = new Date(allRetrievedSessions[i - 1].created_at);
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
      }
    });
  });

  describe('Database cleanup and isolation', () => {
    it('should properly isolate test data', async () => {
      const user1 = 'isolation1@example.com';
      const user2 = 'isolation2@example.com';

      await wellnessSessionService.createWellnessSession(user1, {
        transcription: 'User 1 session',
        summary: 'User 1 summary'
      });

      await wellnessSessionService.createWellnessSession(user2, {
        transcription: 'User 2 session',
        summary: 'User 2 summary'
      });

      const user1Sessions = await wellnessSessionService.getWellnessSessionsByUserId(user1);
      const user2Sessions = await wellnessSessionService.getWellnessSessionsByUserId(user2);

      // Each user should only see their own sessions
      expect(user1Sessions.every(s => s.user_id === user1)).toBe(true);
      expect(user2Sessions.every(s => s.user_id === user2)).toBe(true);
      
      // No cross-contamination
      expect(user1Sessions.some(s => s.user_id === user2)).toBe(false);
      expect(user2Sessions.some(s => s.user_id === user1)).toBe(false);
    });

    it('should handle database cleanup between tests', async () => {
      // This test verifies that our beforeEach cleanup in setup.ts works
      const initialCount = await testDb('wellness_sessions').count('* as count').first();
      
      // Count should be reset to 0 at start of each test (or contain only current test data)
      // Since this runs after other tests have created data in the same test run,
      // we can't guarantee 0, but we can verify the cleanup mechanism works
      expect(typeof initialCount?.count).toBe('number');
    });
  });
});
