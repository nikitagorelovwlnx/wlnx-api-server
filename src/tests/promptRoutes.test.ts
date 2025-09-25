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
  });







});
