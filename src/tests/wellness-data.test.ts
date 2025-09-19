import request from 'supertest';
import { app } from './testApp';

describe('Wellness Data Field Tests', () => {

  describe('POST /interviews with wellness_data', () => {
    it('should create session with complex wellness_data object', async () => {
      const wellnessData = {
        mood_score: 7,
        stress_level: 4,
        energy_level: 6,
        sleep_quality: 8,
        activity_metrics: {
          steps: 8500,
          exercise_minutes: 30,
          meditation_minutes: 15
        },
        health_indicators: {
          heart_rate_avg: 72,
          blood_pressure: '120/80',
          weight: 70.5
        },
        goals: ['reduce stress', 'improve sleep', 'increase activity'],
        notes: 'Feeling better after last session recommendations'
      };

      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'wellness@example.com',
          transcription: 'Session with comprehensive wellness data collection',
          summary: 'Reviewed wellness metrics and progress',
          wellness_data: wellnessData
        });

      expect(response.status).toBe(201);
      expect(response.body.result.wellness_data).toEqual(wellnessData);
      expect(response.body.result.wellness_data.mood_score).toBe(7);
      expect(response.body.result.wellness_data.activity_metrics.steps).toBe(8500);
    });

    it('should create session with null wellness_data', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'nowellness@example.com',
          transcription: 'Session without wellness data',
          summary: 'Basic session summary',
          wellness_data: null
        });

      expect(response.status).toBe(201);
      expect(response.body.result.wellness_data).toBeNull();
    });

    it('should create session without wellness_data field', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'optional@example.com',
          transcription: 'Session where wellness_data is omitted',
          summary: 'Basic session without wellness_data field'
        });

      expect(response.status).toBe(201);
      expect(response.body.result.wellness_data).toBeNull();
    });

    it('should handle empty wellness_data object', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'empty@example.com',
          transcription: 'Session with empty wellness data',
          summary: 'Empty wellness data test',
          wellness_data: {}
        });

      expect(response.status).toBe(201);
      expect(response.body.result.wellness_data).toEqual({});
    });

    it('should handle string wellness_data (edge case)', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'string@example.com',
          transcription: 'Session with string wellness data',
          summary: 'String wellness data test',
          wellness_data: 'some string data'
        });

      expect(response.status).toBe(201);
      expect(response.body.result.wellness_data).toBe('some string data');
    });

    it('should handle array wellness_data (edge case)', async () => {
      const wellnessArray = [
        { metric: 'mood', value: 7 },
        { metric: 'stress', value: 4 },
        { metric: 'energy', value: 6 }
      ];

      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'array@example.com',
          transcription: 'Session with array wellness data',
          summary: 'Array wellness data test',
          wellness_data: wellnessArray
        });

      expect(response.status).toBe(201);
      // Arrays might be stringified
      const actualData = typeof response.body.result.wellness_data === 'string' 
        ? JSON.parse(response.body.result.wellness_data) 
        : response.body.result.wellness_data;
      expect(actualData).toEqual(wellnessArray);
    });
  });

  describe('PUT /interviews/:id with wellness_data updates', () => {
    it('should update wellness_data in existing session', async () => {
      // Create initial session
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: 'update@example.com',
          transcription: 'Initial session',
          summary: 'Initial summary',
          wellness_data: { mood_score: 5, stress_level: 6 }
        });

      const sessionId = createResponse.body.result.id;

      // Update with new wellness data
      const updatedWellnessData = {
        mood_score: 8,
        stress_level: 3,
        energy_level: 7,
        notes: 'Feeling much better after intervention'
      };

      const updateResponse = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send({
          email: 'update@example.com',
          transcription: 'Updated session',
          summary: 'Updated summary with progress',
          wellness_data: updatedWellnessData
        });

      expect(updateResponse.status).toBe(200);
      const actualData = typeof updateResponse.body.result.wellness_data === 'string' 
        ? JSON.parse(updateResponse.body.result.wellness_data) 
        : updateResponse.body.result.wellness_data;
      expect(actualData).toEqual(updatedWellnessData);
      expect(actualData.mood_score).toBe(8);
      expect(actualData.stress_level).toBe(3);
    });

    it('should update only transcription keeping existing wellness_data', async () => {
      const originalWellnessData = { mood_score: 6, notes: 'original notes' };
      
      // Create initial session
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: 'partial@example.com',
          transcription: 'Original transcription',
          summary: 'Original summary',
          wellness_data: originalWellnessData
        });

      const sessionId = createResponse.body.result.id;

      // Update only transcription
      const updateResponse = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send({
          email: 'partial@example.com',
          transcription: 'Updated transcription only'
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.result.transcription).toBe('Updated transcription only');
      const actualData = typeof updateResponse.body.result.wellness_data === 'string' 
        ? JSON.parse(updateResponse.body.result.wellness_data) 
        : updateResponse.body.result.wellness_data;
      expect(actualData).toEqual(originalWellnessData);
    });

    it('should clear wellness_data by setting it to null', async () => {
      // Create initial session with wellness data
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: 'clear@example.com',
          transcription: 'Session with wellness data',
          summary: 'To be cleared',
          wellness_data: { mood_score: 7, stress_level: 4 }
        });

      const sessionId = createResponse.body.result.id;

      // Clear wellness data
      const updateResponse = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send({
          email: 'clear@example.com',
          wellness_data: null
        });

      expect(updateResponse.status).toBe(200);
      expect(updateResponse.body.result.wellness_data).toBeNull();
    });
  });

  describe('GET requests with wellness_data', () => {
    it('should return wellness_data in session retrieval', async () => {
      const wellnessData = {
        mood_score: 9,
        achievements: ['completed meditation', 'reached step goal'],
        reflection: 'Great progress today'
      };

      // Create session
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: 'retrieve@example.com',
          transcription: 'Session for retrieval test',
          summary: 'Wellness data retrieval test',
          wellness_data: wellnessData
        });

      const sessionId = createResponse.body.result.id;

      // Retrieve specific session
      const getResponse = await request(app)
        .get(`/api/interviews/${sessionId}?email=retrieve@example.com`);

      expect(getResponse.status).toBe(200);
      const actualData = typeof getResponse.body.result.wellness_data === 'string' 
        ? JSON.parse(getResponse.body.result.wellness_data) 
        : getResponse.body.result.wellness_data;
      expect(actualData).toEqual(wellnessData);

      // Retrieve all sessions for user
      const getAllResponse = await request(app)
        .get('/api/interviews?email=retrieve@example.com');

      expect(getAllResponse.status).toBe(200);
      const actualListData = typeof getAllResponse.body.results[0].wellness_data === 'string' 
        ? JSON.parse(getAllResponse.body.results[0].wellness_data) 
        : getAllResponse.body.results[0].wellness_data;
      expect(actualListData).toEqual(wellnessData);
    });

    it('should handle sessions with mixed wellness_data types', async () => {
      const userEmail = 'mixed@example.com';

      // Create sessions with different wellness_data types
      await request(app)
        .post('/api/interviews')
        .send({
          email: userEmail,
          transcription: 'Session 1',
          summary: 'With object wellness data',
          wellness_data: { type: 'object', value: 1 }
        });

      await request(app)
        .post('/api/interviews')
        .send({
          email: userEmail,
          transcription: 'Session 2',
          summary: 'With null wellness data',
          wellness_data: null
        });

      await request(app)
        .post('/api/interviews')
        .send({
          email: userEmail,
          transcription: 'Session 3',
          summary: 'With string wellness data',
          wellness_data: 'string data'
        });

      // Get all sessions
      const response = await request(app)
        .get(`/api/interviews?email=${userEmail}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toHaveLength(3);
      
      const sessions = response.body.results;
      expect(sessions.some((s: any) => s.wellness_data !== null)).toBe(true);
      expect(sessions.some((s: any) => s.wellness_data === null)).toBe(true);
      expect(sessions.some((s: any) => typeof s.wellness_data === 'string')).toBe(true);
    });
  });
});
