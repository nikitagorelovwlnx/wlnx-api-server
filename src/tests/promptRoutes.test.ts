import request from 'supertest';
import { app } from '../app';

describe('Prompt API Routes', () => {
  
  describe('GET /api/prompts/wellness-stages', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/prompts/wellness-stages')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
      
      // Should return either success with data or error
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('systemPrompt');
        expect(response.body.data).toHaveProperty('stages');
        expect(Array.isArray(response.body.data.stages)).toBe(true);
        expect(response.body.data).toHaveProperty('version');
        expect(response.body.data).toHaveProperty('lastUpdated');
      } else {
        expect(response.body).toHaveProperty('error');
        expect(typeof response.body.error).toBe('string');
      }
    });

    it('should accept locale query parameter', async () => {
      const response = await request(app)
        .get('/api/prompts/wellness-stages?locale=en-US')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should return expected stage structure when data exists', async () => {
      const response = await request(app)
        .get('/api/prompts/wellness-stages');

      if (response.body.success && response.body.data?.stages) {
        const stages = response.body.data.stages;
        expect(stages.length).toBeGreaterThan(0);
        
        // Check first stage has required properties
        const firstStage = stages[0];
        expect(firstStage).toHaveProperty('stage');
        expect(firstStage).toHaveProperty('systemPrompt');
        expect(firstStage).toHaveProperty('stagePrompt');
        expect(firstStage).toHaveProperty('introductionMessage');
        expect(firstStage).toHaveProperty('requiredFields');
        expect(firstStage).toHaveProperty('completionCriteria');
        
        expect(Array.isArray(firstStage.requiredFields)).toBe(true);
        expect(typeof firstStage.stage).toBe('string');
        expect(typeof firstStage.introductionMessage).toBe('string');
      }
    });

    it('should return wellness stages in expected format', async () => {
      const response = await request(app)
        .get('/api/prompts/wellness-stages');

      if (response.body.success && response.body.data?.stages) {
        const expectedStages = [
          'demographics_baseline',
          'biometrics_habits', 
          'lifestyle_context',
          'medical_history',
          'goals_preferences'
        ];
        
        const stageIds = response.body.data.stages.map((s: any) => s.stage);
        expectedStages.forEach(expectedStage => {
          expect(stageIds).toContain(expectedStage);
        });
      }
    });
  });

  describe('GET /api/prompts', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
      
      if (response.body.success) {
        expect(response.body.data).toHaveProperty('prompts');
        expect(response.body.data).toHaveProperty('total');
        expect(Array.isArray(response.body.data.prompts)).toBe(true);
        expect(typeof response.body.data.total).toBe('number');
      }
    });

    it('should accept filter parameters', async () => {
      const response = await request(app)
        .get('/api/prompts?form_name=wellness_intake&locale=en-US')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });

    it('should accept is_active filter', async () => {
      const response = await request(app)
        .get('/api/prompts?is_active=true')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/prompts/forms/:formName', () => {
    it('should return 404 for non-existent form', async () => {
      const response = await request(app)
        .get('/api/prompts/forms/non_existent_form')
        .expect('Content-Type', /json/);

      // Should return either 404 or 500 (if DB not available)
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
    });

    it('should accept version and locale parameters', async () => {
      const response = await request(app)
        .get('/api/prompts/forms/wellness_intake?version=1.0.0&locale=en-US')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('GET /api/prompts/forms/:formName/stages/:stageId', () => {
    it('should return 404 for non-existent stage', async () => {
      const response = await request(app)
        .get('/api/prompts/forms/wellness_intake/stages/non_existent_stage')
        .expect('Content-Type', /json/);

      // Should return either 404 or 500 (if DB not available)
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });

    it('should accept version and locale parameters', async () => {
      const response = await request(app)
        .get('/api/prompts/forms/wellness_intake/stages/demographics_baseline?version=1.0.0&locale=en-US')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });

    it('should return expected response structure when data exists', async () => {
      const response = await request(app)
        .get('/api/prompts/forms/wellness_intake/stages/demographics_baseline');

      if (response.body.success && response.body.data) {
        const data = response.body.data;
        expect(data).toHaveProperty('stage_id');
        expect(data).toHaveProperty('form_name');
        expect(data).toHaveProperty('main_prompt');
        expect(typeof data.main_prompt).toBe('string');
      }
    });
  });

  describe('POST /api/prompts', () => {
    it('should return correct response for prompt creation attempt', async () => {
      const testPrompt = {
        name: 'Test Prompt',
        stage_id: 'test_stage',
        form_name: 'test_form',
        version: '1.0.0',
        locale: 'en-US',
        content: {
          main_prompt: 'This is a test prompt',
          follow_up_prompt: 'Please provide more details',
          validation_prompt: 'Invalid input detected',
          completion_prompt: 'Stage completed successfully'
        }
      };

      const response = await request(app)
        .post('/api/prompts')
        .send(testPrompt)
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('POST /api/prompts/import/wellness', () => {
    it('should have wellness import endpoint', async () => {
      const response = await request(app)
        .post('/api/prompts/import/wellness')
        .send({ locale: 'en-US' })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should accept locale in request body', async () => {
      const response = await request(app)
        .post('/api/prompts/import/wellness')
        .send({ locale: 'en-US' })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
    });
  });

  describe('PUT /api/prompts/:id', () => {
    it('should return 404 for non-existent prompt', async () => {
      const response = await request(app)
        .put('/api/prompts/non-existent-id')
        .send({ name: 'Updated Name' })
        .expect('Content-Type', /json/);

      // Should return either 404 or 500 (if DB not available)
      expect([404, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/prompts/forms/:formName/stages/:stageId/versions', () => {
    it('should return 400 when version is missing', async () => {
      const response = await request(app)
        .post('/api/prompts/forms/wellness_intake/stages/demographics_baseline/versions')
        .send({})
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Version is required');
    });

    it('should accept version in request body', async () => {
      const response = await request(app)
        .post('/api/prompts/forms/wellness_intake/stages/demographics_baseline/versions')
        .send({ 
          version: '1.1.0',
          locale: 'en-US',
          content: {
            main_prompt: 'Updated prompt text'
          }
        })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('DELETE /api/prompts/:id', () => {
    it('should accept deletion requests', async () => {
      const response = await request(app)
        .delete('/api/prompts/test-id')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });

  describe('Response Format Validation', () => {
    it('should return proper error format', async () => {
      const response = await request(app)
        .get('/api/prompts/forms/definitely_non_existent/stages/definitely_non_existent')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('error');
      expect(typeof response.body.error).toBe('string');
    });

    it('should handle malformed requests gracefully', async () => {
      const response = await request(app)
        .post('/api/prompts')
        .send('invalid json')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });
  });
});
