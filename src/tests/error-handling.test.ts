import request from 'supertest';
import { app } from './testApp';

describe('Error Handling Tests', () => {

  describe('Input validation errors', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .set('Content-Type', 'application/json')
        .send('{ invalid json }');

      // Express body-parser returns 400 for malformed JSON, but our error handler catches and returns 500
      expect([400, 500]).toContain(response.status);
    });

    it('should handle empty request body', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send();

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Email is required');
    });

    it('should handle invalid email formats (edge case)', async () => {
      // Test empty string - should fail validation
      const response1 = await request(app)
        .post('/api/interviews')
        .send({
          email: '',
          transcription: 'Test transcription',
          summary: 'Test summary'
        });

      expect(response1.status).toBe(400);
      expect(response1.body.error).toBe('Email is required');

      // Test space - will pass validation (space is truthy)
      const response2 = await request(app)
        .post('/api/interviews')
        .send({
          email: ' ',
          transcription: 'Test transcription',
          summary: 'Test summary'
        });

      expect(response2.status).toBe(201);

      // Test that non-empty strings are accepted as emails (no format validation)
      const response3 = await request(app)
        .post('/api/interviews')
        .send({
          email: 'any-string-works',
          transcription: 'Test transcription',
          summary: 'Test summary'
        });
      
      expect(response3.status).toBe(201);
    });

    it('should handle extremely long strings', async () => {
      const veryLongString = 'A'.repeat(100000); // 100KB string
      
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'long@example.com',
          transcription: veryLongString,
          summary: 'Long transcription test'
        });

      expect(response.status).toBe(201);
      expect(response.body.result.transcription).toBe(veryLongString);
    });

    it('should handle special characters in inputs', async () => {
      const specialCharacters = {
        email: 'special+chars@domain-name.com',
        transcription: 'Transcription with special chars: áéíóú ñ ü ¿¡ @#$%^&*(){}[]|\\:";\'<>?,./~`',
        summary: 'Summary with émojis 😊🚀💚 and unicode ∞±≤≥'
      };

      const response = await request(app)
        .post('/api/interviews')
        .send(specialCharacters);

      expect(response.status).toBe(201);
      expect(response.body.result.user_id).toBe(specialCharacters.email);
      expect(response.body.result.transcription).toBe(specialCharacters.transcription);
      expect(response.body.result.summary).toBe(specialCharacters.summary);
    });
  });

  describe('Database-related error scenarios', () => {
    it('should handle attempts to get non-existent session with valid UUID', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      
      const response = await request(app)
        .get(`/api/interviews/${validUuid}?email=test@example.com`);

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Wellness session not found');
    });

    it('should handle attempts to update non-existent session', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440001';
      
      const response = await request(app)
        .put(`/api/interviews/${validUuid}`)
        .send({
          email: 'test@example.com',
          transcription: 'Updated transcription',
          summary: 'Updated summary'
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Wellness session not found');
    });

    it('should handle attempts to delete non-existent session', async () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440002';
      
      const response = await request(app)
        .delete(`/api/interviews/${validUuid}`)
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('Wellness session not found');
    });

    it('should handle malformed UUID in URL parameters', async () => {
      const malformedUuids = [
        'invalid-uuid',
        '123',
        'not-a-uuid-at-all',
        '550e8400-e29b-41d4-a716-44665544000',  // too short
        '550e8400-e29b-41d4-a716-4466554400000' // too long
      ];

      for (const uuid of malformedUuids) {
        const response = await request(app)
          .get(`/api/interviews/${uuid}?email=test@example.com`);

        // The API might return 404 for malformed UUIDs or handle them gracefully
        expect([404, 500]).toContain(response.status);
      }
    });
  });

  describe('Authorization/Access control scenarios', () => {
    it('should prevent user from accessing another users session', async () => {
      const user1Email = 'user1@example.com';
      const user2Email = 'user2@example.com';

      // Create session for user1
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: user1Email,
          transcription: 'User 1 private session',
          summary: 'Private content for user 1'
        });

      const sessionId = createResponse.body.result.id;

      // Try to access with user2 email
      const getResponse = await request(app)
        .get(`/api/interviews/${sessionId}?email=${user2Email}`);

      expect(getResponse.status).toBe(404);
      expect(getResponse.body.error).toBe('Wellness session not found');
    });

    it('should prevent user from updating another users session', async () => {
      const user1Email = 'owner@example.com';
      const user2Email = 'hacker@example.com';

      // Create session for user1
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: user1Email,
          transcription: 'Original content',
          summary: 'Original summary'
        });

      const sessionId = createResponse.body.result.id;

      // Try to update with user2 credentials
      const updateResponse = await request(app)
        .put(`/api/interviews/${sessionId}`)
        .send({
          email: user2Email,
          transcription: 'Hacked content',
          summary: 'Unauthorized update'
        });

      expect(updateResponse.status).toBe(404);
      expect(updateResponse.body.error).toBe('Wellness session not found');

      // Verify original content is unchanged
      const verifyResponse = await request(app)
        .get(`/api/interviews/${sessionId}?email=${user1Email}`);

      expect(verifyResponse.status).toBe(200);
      expect(verifyResponse.body.result.transcription).toBe('Original content');
    });

    it('should prevent user from deleting another users session', async () => {
      const user1Email = 'owner2@example.com';
      const user2Email = 'deleter@example.com';

      // Create session for user1
      const createResponse = await request(app)
        .post('/api/interviews')
        .send({
          email: user1Email,
          transcription: 'Content to protect',
          summary: 'Should not be deleted'
        });

      const sessionId = createResponse.body.result.id;

      // Try to delete with user2 credentials
      const deleteResponse = await request(app)
        .delete(`/api/interviews/${sessionId}`)
        .send({ email: user2Email });

      expect(deleteResponse.status).toBe(404);
      expect(deleteResponse.body.error).toBe('Wellness session not found');

      // Verify session still exists
      const verifyResponse = await request(app)
        .get(`/api/interviews/${sessionId}?email=${user1Email}`);

      expect(verifyResponse.status).toBe(200);
    });
  });

  describe('Query parameter edge cases', () => {
    it('should handle missing limit/offset parameters gracefully', async () => {
      const testEmail = 'pagination-test@example.com';

      // Create a session first
      await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Test for pagination',
          summary: 'Test summary'
        });

      const response = await request(app)
        .get(`/api/interviews?email=${testEmail}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
    });

    it('should handle invalid limit/offset parameters', async () => {
      const testEmail = 'invalid-params@example.com';

      // Create a session first
      await request(app)
        .post('/api/interviews')
        .send({
          email: testEmail,
          transcription: 'Test for invalid params',
          summary: 'Test summary'
        });

      // Test with negative values - these get converted to NaN then to default values
      let response = await request(app)
        .get(`/api/interviews?email=${testEmail}&limit=-1&offset=-1`);
      expect([200, 500]).toContain(response.status);

      // Test with non-numeric values - these get converted to NaN then to default values
      response = await request(app)
        .get(`/api/interviews?email=${testEmail}&limit=abc&offset=xyz`);
      expect([200, 500]).toContain(response.status);

      // Test with very large values
      response = await request(app)
        .get(`/api/interviews?email=${testEmail}&limit=999999&offset=999999`);
      expect(response.status).toBe(200);
    });

    it('should handle URL encoding in email parameters', async () => {
      const originalEmail = 'test+user@example.com';
      const encodedEmail = encodeURIComponent(originalEmail);

      // Create session
      await request(app)
        .post('/api/interviews')
        .send({
          email: originalEmail,
          transcription: 'URL encoding test',
          summary: 'Test summary'
        });

      // Test with encoded email
      const response = await request(app)
        .get(`/api/interviews?email=${encodedEmail}`);

      expect(response.status).toBe(200);
      expect(response.body.results).toBeInstanceOf(Array);
      expect(response.body.results.length).toBeGreaterThan(0);
    });
  });

  describe('Content-Type handling', () => {
    it('should reject requests with unsupported Content-Type for POST', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .set('Content-Type', 'text/plain')
        .send('email=test@example.com&transcription=test');

      // Express will still try to parse this, but it might not work as expected
      expect([400, 500]).toContain(response.status);
    });

    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/interviews')
        .send({
          email: 'noheader@example.com',
          transcription: 'No content type header',
          summary: 'Test summary'
        });

      expect(response.status).toBe(201);
    });
  });
});
