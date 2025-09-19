import request from 'supertest';
import { app } from './testApp';

describe('User Service Tests', () => {

  describe('GET /users - User aggregation functionality', () => {
    it('should calculate correct session statistics for users', async () => {
      const user1Email = 'stats1@example.com';
      const user2Email = 'stats2@example.com';

      // Create sessions at different times for user1
      await request(app)
        .post('/api/interviews')
        .send({
          email: user1Email,
          transcription: 'First session for user1',
          summary: 'First session summary',
        });

      // Add a small delay to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 100));

      await request(app)
        .post('/api/interviews')
        .send({
          email: user1Email,
          transcription: 'Second session for user1',
          summary: 'Second session summary',
        });

      await request(app)
        .post('/api/interviews')
        .send({
          email: user1Email,
          transcription: 'Third session for user1',
          summary: 'Third session summary',
        });

      // Create sessions for user2
      await request(app)
        .post('/api/interviews')
        .send({
          email: user2Email,
          transcription: 'Only session for user2',
          summary: 'User2 session summary',
        });

      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.users).toBeInstanceOf(Array);

      const user1 = response.body.users.find((u: any) => u.email === user1Email);
      const user2 = response.body.users.find((u: any) => u.email === user2Email);

      // Check user1 statistics
      expect(user1).toBeTruthy();
      expect(user1.session_count).toBe(3);
      expect(user1.sessions).toHaveLength(3);
      expect(new Date(user1.first_session)).toBeInstanceOf(Date);
      expect(new Date(user1.last_session)).toBeInstanceOf(Date);
      expect(new Date(user1.last_session).getTime()).toBeGreaterThanOrEqual(new Date(user1.first_session).getTime());

      // Check user2 statistics
      expect(user2).toBeTruthy();
      expect(user2.session_count).toBe(1);
      expect(user2.sessions).toHaveLength(1);
      expect(new Date(user2.first_session).getTime()).toBe(new Date(user2.last_session).getTime());
    });

    it('should sort users by last session date (most recent first)', async () => {
      const oldUserEmail = 'old@example.com';
      const newUserEmail = 'new@example.com';

      // Create session for "old" user first
      await request(app)
        .post('/api/interviews')
        .send({
          email: oldUserEmail,
          transcription: 'Old user session',
          summary: 'Old user summary',
        });

      // Wait to ensure different timestamps
      await new Promise(resolve => setTimeout(resolve, 200));

      // Create session for "new" user
      await request(app)
        .post('/api/interviews')
        .send({
          email: newUserEmail,
          transcription: 'New user session',
          summary: 'New user summary',
        });

      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(200);
      const users = response.body.users;

      // Find the positions of our test users
      const newUserIndex = users.findIndex((u: any) => u.email === newUserEmail);
      const oldUserIndex = users.findIndex((u: any) => u.email === oldUserEmail);

      expect(newUserIndex).not.toBe(-1);
      expect(oldUserIndex).not.toBe(-1);

      // New user should come before old user (lower index = more recent)
      expect(newUserIndex).toBeLessThan(oldUserIndex);
    });

    it('should include complete session data for each user', async () => {
      const userEmail = 'complete-data@example.com';
      const wellnessData = {
        mood: 'excellent',
        energy: 9,
        stress_level: 2
      };

      await request(app)
        .post('/api/interviews')
        .send({
          email: userEmail,
          transcription: 'Session with wellness data',
          summary: 'Comprehensive session',
          wellness_data: wellnessData
        });

      const response = await request(app)
        .get('/api/users');

      const user = response.body.users.find((u: any) => u.email === userEmail);
      expect(user).toBeTruthy();
      expect(user.sessions).toHaveLength(1);

      const session = user.sessions[0];
      expect(session).toHaveProperty('id');
      expect(session).toHaveProperty('transcription');
      expect(session).toHaveProperty('summary');
      expect(session).toHaveProperty('wellness_data');
      expect(session).toHaveProperty('created_at');
      expect(session).toHaveProperty('updated_at');

      expect(session.transcription).toBe('Session with wellness data');
      expect(session.summary).toBe('Comprehensive session');
      
      // wellness_data might be stringified, so parse it if needed
      const actualWellnessData = typeof session.wellness_data === 'string' 
        ? JSON.parse(session.wellness_data) 
        : session.wellness_data;
      expect(actualWellnessData).toEqual(wellnessData);
    });

    it('should handle users with sessions ordered correctly within each user', async () => {
      const userEmail = 'ordered-sessions@example.com';

      // Create multiple sessions
      const sessionData = [
        { transcription: 'First session', summary: 'First summary' },
        { transcription: 'Second session', summary: 'Second summary' },
        { transcription: 'Third session', summary: 'Third summary' }
      ];

      for (const data of sessionData) {
        await request(app)
          .post('/api/interviews')
          .send({
            email: userEmail,
            ...data
          });
        
        // Small delay to ensure different timestamps
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const response = await request(app)
        .get('/api/users');

      const user = response.body.users.find((u: any) => u.email === userEmail);
      expect(user).toBeTruthy();
      expect(user.sessions).toHaveLength(3);

      // Sessions should be ordered by created_at desc (most recent first)
      const sessions = user.sessions;
      for (let i = 1; i < sessions.length; i++) {
        const current = new Date(sessions[i].created_at);
        const previous = new Date(sessions[i - 1].created_at);
        expect(current.getTime()).toBeLessThanOrEqual(previous.getTime());
      }

      // Most recent session should be "Third session"
      expect(sessions[0].transcription).toBe('Third session');
      expect(sessions[2].transcription).toBe('First session');
    });

    it('should handle empty database gracefully', async () => {
      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(200);
      expect(response.body.users).toBeInstanceOf(Array);
      expect(response.body.users.length).toBe(0);
    });

    it('should handle users with complex wellness data correctly', async () => {
      const userEmail = 'complex-wellness@example.com';
      
      const complexWellnessData = {
        physical: {
          heart_rate: [65, 70, 68],
          blood_pressure: { systolic: 120, diastolic: 80 },
          weight: 70.5
        },
        mental: {
          mood_rating: 8,
          stress_indicators: ['work', 'family'],
          coping_strategies: ['meditation', 'exercise']
        },
        behavioral: {
          sleep_hours: 7.5,
          exercise_minutes: 45,
          meditation_minutes: 20
        },
        goals: {
          short_term: ['reduce stress', 'improve sleep'],
          long_term: ['maintain healthy weight', 'develop mindfulness']
        },
        timestamp: new Date().toISOString(),
        notes: 'Comprehensive wellness assessment with nested data structures'
      };

      await request(app)
        .post('/api/interviews')
        .send({
          email: userEmail,
          transcription: 'Complex wellness data session',
          summary: 'Detailed wellness assessment',
          wellness_data: complexWellnessData
        });

      const response = await request(app)
        .get('/api/users');

      const user = response.body.users.find((u: any) => u.email === userEmail);
      expect(user).toBeTruthy();
      
      const session = user.sessions[0];
      
      // wellness_data might be stringified, so parse it if needed
      const actualWellnessData = typeof session.wellness_data === 'string' 
        ? JSON.parse(session.wellness_data) 
        : session.wellness_data;
        
      expect(actualWellnessData).toEqual(complexWellnessData);
      expect(actualWellnessData.physical.heart_rate).toEqual([65, 70, 68]);
      expect(actualWellnessData.goals.short_term).toEqual(['reduce stress', 'improve sleep']);
    });

    it('should handle users with mixed wellness data types', async () => {
      const userEmail = 'mixed-wellness@example.com';

      // Create sessions with different wellness data types
      const sessions = [
        { wellness_data: { simple: 'object' } },
        { wellness_data: null },
        { wellness_data: 'string data' },
        { wellness_data: [1, 2, 3] },
        { wellness_data: { complex: { nested: { data: true } } } }
      ];

      for (let i = 0; i < sessions.length; i++) {
        await request(app)
          .post('/api/interviews')
          .send({
            email: userEmail,
            transcription: `Session ${i + 1}`,
            summary: `Summary ${i + 1}`,
            wellness_data: sessions[i].wellness_data
          });
        
        await new Promise(resolve => setTimeout(resolve, 50));
      }

      const response = await request(app)
        .get('/api/users');

      const user = response.body.users.find((u: any) => u.email === userEmail);
      expect(user).toBeTruthy();
      expect(user.sessions).toHaveLength(5);

      // Check specific values, parsing JSON strings when needed
      const sessionData = user.sessions.map((s: any) => {
        if (typeof s.wellness_data === 'string') {
          try {
            return JSON.parse(s.wellness_data);
          } catch {
            return s.wellness_data; // Return as-is if not valid JSON
          }
        }
        return s.wellness_data;
      });
      
      expect(sessionData).toContainEqual({ simple: 'object' });
      expect(sessionData).toContain(null);
      expect(sessionData).toContain('string data');
      // Check if array exists in any form (parsed or as part of data)
      const hasArrayData = sessionData.some((data: any) => {
        if (Array.isArray(data)) {
          return JSON.stringify(data) === JSON.stringify([1, 2, 3]);
        }
        if (typeof data === 'string') {
          try {
            const parsed = JSON.parse(data);
            return Array.isArray(parsed) && JSON.stringify(parsed) === JSON.stringify([1, 2, 3]);
          } catch {
            return false;
          }
        }
        return false;
      });
      expect(hasArrayData).toBe(true);
      expect(sessionData).toContainEqual({ complex: { nested: { data: true } } });
    });

    it('should maintain data integrity across multiple users and sessions', async () => {
      const users = [
        { email: 'integrity1@example.com', sessionCount: 2 },
        { email: 'integrity2@example.com', sessionCount: 4 },
        { email: 'integrity3@example.com', sessionCount: 1 }
      ];

      // Create sessions for multiple users
      for (const userData of users) {
        for (let i = 0; i < userData.sessionCount; i++) {
          await request(app)
            .post('/api/interviews')
            .send({
              email: userData.email,
              transcription: `${userData.email} session ${i + 1}`,
              summary: `Summary for ${userData.email} session ${i + 1}`,
              wellness_data: { session_number: i + 1, user: userData.email }
            });
          
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      const response = await request(app)
        .get('/api/users');

      expect(response.status).toBe(200);

      // Verify each user has correct number of sessions
      for (const userData of users) {
        const user = response.body.users.find((u: any) => u.email === userData.email);
        expect(user).toBeTruthy();
        expect(user.session_count).toBe(userData.sessionCount);
        expect(user.sessions).toHaveLength(userData.sessionCount);

        // Verify all sessions belong to correct user
        for (const session of user.sessions) {
          const actualWellnessData = typeof session.wellness_data === 'string' 
            ? JSON.parse(session.wellness_data) 
            : session.wellness_data;
          expect(actualWellnessData.user).toBe(userData.email);
        }
      }

      // Verify total user count
      const testUsers = response.body.users.filter((u: any) => 
        users.some(userData => userData.email === u.email)
      );
      expect(testUsers).toHaveLength(users.length);
    });
  });
});
