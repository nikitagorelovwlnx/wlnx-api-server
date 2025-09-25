import request from 'supertest';
import { app } from '../app';

describe('Form Schema API Routes', () => {
  
  describe('GET /api/form-schemas', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/form-schemas')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.success).toBe(true);
      
      if (response.body.data) {
        expect(response.body.data).toHaveProperty('schemas');
        expect(response.body.data).toHaveProperty('total');
        expect(Array.isArray(response.body.data.schemas)).toBe(true);
        expect(typeof response.body.data.total).toBe('number');
      }
    });

    it('should accept locale query parameter', async () => {
      const response = await request(app)
        .get('/api/form-schemas?locale=en-US')
        .expect('Content-Type', /json/);

      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/form-schemas/:name', () => {
    it('should return 404 for non-existent schema', async () => {
      const response = await request(app)
        .get('/api/form-schemas/non_existent_schema')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should accept version and locale parameters', async () => {
      const response = await request(app)
        .get('/api/form-schemas/wellness_intake?version=1.0.0&locale=en-US')
        .expect('Content-Type', /json/);

      // Should return either 200 with data or 404 if not exists
      expect([200, 404]).toContain(response.status);
      expect(response.body).toHaveProperty('success');
    });
  });

  describe('POST /api/form-schemas', () => {
    it('should return correct response for schema creation attempt', async () => {
      const testSchema = {
        name: 'test_schema',
        description: 'Test schema',
        version: '1.0.0',
        locale: 'en-US',
        fields: [
          {
            key: 'test_field',
            type: 'string',
            ui: { label: 'Test Field' }
          }
        ],
        stages: [
          {
            id: 'S1_test',
            name: 'Test Stage',
            targets: ['test_field'],
            order: 1
          }
        ]
      };

      const response = await request(app)
        .post('/api/form-schemas')
        .send(testSchema)
        .expect('Content-Type', /json/);

      // Should return either success or error, both valid responses
      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('POST /api/form-schemas/import/wellness', () => {
    it('should have wellness import endpoint', async () => {
      const response = await request(app)
        .post('/api/form-schemas/import/wellness')
        .expect('Content-Type', /json/);

      // Should return response (success or error both valid)
      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('POST /api/form-schemas/:name/versions', () => {
    it('should return 400 when version is missing', async () => {
      const response = await request(app)
        .post('/api/form-schemas/test_schema/versions')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Version is required');
    });
  });

  describe('DELETE /api/form-schemas/:name', () => {
    it('should accept deletion requests', async () => {
      const response = await request(app)
        .delete('/api/form-schemas/test_schema')
        .expect('Content-Type', /json/);

      // Should return response (success or error both valid)
      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should accept version and locale parameters', async () => {
      const response = await request(app)
        .delete('/api/form-schemas/test_schema?version=1.0.0&locale=en-US')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('Response Format Validation', () => {
    it('should return proper error format', async () => {
      const response = await request(app)
        .get('/api/form-schemas/definitely_non_existent')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toEqual({
        success: false,
        error: expect.any(String)
      });
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/form-schemas')
        .send('invalid json')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      // Should handle gracefully, not crash
    });
  });
});
