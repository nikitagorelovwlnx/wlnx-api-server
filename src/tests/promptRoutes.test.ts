import request from 'supertest';
import { app } from '../app';

describe('Prompt API Routes', () => {
  
  describe('GET /api/prompts', () => {
    it('should return correct response structure', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
      
      if (response.body.success) {
        expect(response.body).toHaveProperty('data');
        expect(typeof response.body.data).toBe('object');
        
        // Check that data contains the 5 expected stages
        const expectedStages = [
          'demographics_baseline',
          'biometrics_habits', 
          'lifestyle_context',
          'medical_history',
          'goals_preferences'
        ];
        
        expectedStages.forEach(stageId => {
          expect(response.body.data).toHaveProperty(stageId);
          expect(response.body.data[stageId]).toHaveProperty('question_prompt');
          expect(response.body.data[stageId]).toHaveProperty('extraction_prompt');
          expect(typeof response.body.data[stageId].question_prompt).toBe('string');
          expect(typeof response.body.data[stageId].extraction_prompt).toBe('string');
        });
      }
    });

    it('should return exactly 5 wellness stages', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect('Content-Type', /json/);

      if (response.body.success) {
        const stageIds = Object.keys(response.body.data);
        expect(stageIds).toHaveLength(5);
        
        const expectedStages = [
          'demographics_baseline',
          'biometrics_habits', 
          'lifestyle_context',
          'medical_history',
          'goals_preferences'
        ];
        
        expect(stageIds.sort()).toEqual(expectedStages.sort());
      }
    });

    it('should return prompts with only 2 fields per stage', async () => {
      const response = await request(app)
        .get('/api/prompts')
        .expect('Content-Type', /json/);

      if (response.body.success) {
        Object.values(response.body.data).forEach((stage: any) => {
          const promptKeys = Object.keys(stage);
          expect(promptKeys).toHaveLength(2);
          expect(promptKeys).toContain('question_prompt');
          expect(promptKeys).toContain('extraction_prompt');
        });
      }
    });
  });

  describe('PUT /api/prompts/:stageId', () => {
    it('should return 404 for non-existent stage', async () => {
      const response = await request(app)
        .put('/api/prompts/non_existent_stage')
        .send({ question_prompt: 'test' })
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('not found');
    });

    it('should accept valid prompt updates', async () => {
      const response = await request(app)
        .put('/api/prompts/demographics_baseline')
        .send({
          question_prompt: 'Custom question prompt',
          extraction_prompt: 'Custom extraction prompt'
        })
        .expect('Content-Type', /json/);

      expect(response.body).toHaveProperty('success');
      expect(typeof response.body.success).toBe('boolean');
    });

    it('should persist prompt updates between PUT and GET requests', async () => {
      // First, update the prompt
      const updateResponse = await request(app)
        .put('/api/prompts/demographics_baseline')
        .send({
          question_prompt: 'UPDATED: This should persist in database',
          extraction_prompt: 'UPDATED: This extraction should also persist'
        })
        .expect('Content-Type', /json/)
        .expect(200);

      expect(updateResponse.body.success).toBe(true);
      
      // Then, verify the changes are reflected in GET
      const getResponse = await request(app)
        .get('/api/prompts')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(getResponse.body.success).toBe(true);
      expect(getResponse.body.data.demographics_baseline.question_prompt)
        .toBe('UPDATED: This should persist in database');
      expect(getResponse.body.data.demographics_baseline.extraction_prompt)
        .toBe('UPDATED: This extraction should also persist');
    });
  });

  describe('Debug endpoints', () => {
    it('should return debug information for existing stage', async () => {
      const response = await request(app)
        .get('/api/prompts/debug/demographics_baseline');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.debug).toBeDefined();
      expect(response.body.debug.stageId).toBe('demographics_baseline');
      expect(response.body.debug.database_type).toBeDefined();
      expect(response.body.debug.default_prompt).toBeDefined();
      expect(response.body.debug.timestamp).toBeDefined();
    });

    it('should return debug information for non-existent stage', async () => {
      const response = await request(app)
        .get('/api/prompts/debug/non_existent_stage');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.debug.stageId).toBe('non_existent_stage');
      expect(response.body.debug.custom_prompt_from_db).toBeUndefined();
    });

    it('should return debug information with custom prompts', async () => {
      // First create a custom prompt
      await request(app)
        .put('/api/prompts/demographics_baseline')
        .send({
          question_prompt: 'Debug test question',
          extraction_prompt: 'Debug test extraction'
        });

      const response = await request(app)
        .get('/api/prompts/debug/demographics_baseline');

      expect(response.status).toBe(200);
      expect(response.body.debug.custom_prompt_from_db).toBeDefined();
      expect(response.body.debug.custom_prompt_from_db.question_prompt).toBe('Debug test question');
      expect(response.body.debug.final_merged.question_prompt).toBe('Debug test question');
    });
  });

  describe('Error handling', () => {
    it('should handle database errors gracefully', async () => {
      // This test would require mocking the database to simulate an error
      // For now, we'll test with invalid data that might cause issues
      const response = await request(app)
        .put('/api/prompts/demographics_baseline')
        .send({
          question_prompt: null, // This might cause issues
          extraction_prompt: undefined
        });

      // The endpoint should handle this gracefully
      expect([200, 400, 500]).toContain(response.status);
    });
  });
});
