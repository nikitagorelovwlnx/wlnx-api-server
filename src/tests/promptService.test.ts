import { PromptService } from '../services/promptService';
import { db } from '../database/knex';
import { CreatePromptRequest } from '../types/prompt-spec';

describe('PromptService', () => {
  let promptService: PromptService;

  beforeAll(async () => {
    promptService = new PromptService();
  });

  beforeEach(async () => {
    // Clean up test data
    await db('prompts').del();
  });

  afterAll(async () => {
    await db.destroy();
  });

  describe('importDefaultWellnessPrompts', () => {
    it('should create default wellness prompts for all 5 stages', async () => {
      const prompts = await promptService.importDefaultWellnessPrompts('en-US');
      
      expect(prompts).toHaveLength(5);
      expect(prompts.every(p => p.form_name === 'wellness_intake')).toBe(true);
      expect(prompts.every(p => p.locale === 'en-US')).toBe(true);
      expect(prompts.every(p => p.version === '1.0.0')).toBe(true);
      
      // Check all stages are covered
      const stageIds = prompts.map(p => p.stage_id).sort();
      expect(stageIds).toEqual([
        'S1_demographics',
        'S2_lifestyle', 
        'S3_health_goals',
        'S4_medical',
        'S5_additional'
      ]);
    });

    it('should create prompts with proper content structure', async () => {
      const prompts = await promptService.importDefaultWellnessPrompts('en-US');
      
      const demographicsPrompt = prompts.find(p => p.stage_id === 'S1_demographics');
      expect(demographicsPrompt).toBeDefined();
      expect(demographicsPrompt?.content.main_prompt).toContain('basic information');
      expect(demographicsPrompt?.content.follow_up_prompt).toBeDefined();
      expect(demographicsPrompt?.content.validation_prompt).toBeDefined();
      expect(demographicsPrompt?.content.completion_prompt).toBeDefined();
      expect(demographicsPrompt?.metadata?.tone).toBe('friendly');
    });
  });

  describe('getFormPrompts', () => {
    beforeEach(async () => {
      await promptService.importDefaultWellnessPrompts('en-US');
    });

    it('should return all prompts for a form', async () => {
      const prompts = await promptService.getFormPrompts('wellness_intake', 'en-US');
      
      expect(prompts).toHaveLength(5);
      expect(prompts.every(p => p.form_name === 'wellness_intake')).toBe(true);
      expect(prompts.every(p => p.is_active === true)).toBe(true);
    });

    it('should return empty array for non-existent form', async () => {
      const prompts = await promptService.getFormPrompts('non_existent_form', 'en-US');
      expect(prompts).toHaveLength(0);
    });
  });

  describe('getStagePrompt', () => {
    beforeEach(async () => {
      await promptService.importDefaultWellnessPrompts('en-US');
    });

    it('should return specific stage prompt', async () => {
      const prompt = await promptService.getStagePrompt(
        'wellness_intake', 
        'S1_demographics', 
        'en-US'
      );
      
      expect(prompt).toBeDefined();
      expect(prompt?.stage_id).toBe('S1_demographics');
      expect(prompt?.form_name).toBe('wellness_intake');
      expect(prompt?.content.main_prompt).toBeDefined();
    });

    it('should return null for non-existent stage', async () => {
      const prompt = await promptService.getStagePrompt(
        'wellness_intake', 
        'S99_non_existent', 
        'en-US'
      );
      
      expect(prompt).toBeNull();
    });
  });

  describe('createPrompt', () => {
    it('should create new prompt successfully', async () => {
      const promptData: CreatePromptRequest = {
        name: 'Test Prompt',
        description: 'A test prompt',
        stage_id: 'S1_test',
        form_name: 'test_form',
        version: '1.0.0',
        locale: 'en-US',
        content: {
          main_prompt: 'This is a test prompt',
          follow_up_prompt: 'Please provide more details',
          validation_prompt: 'Invalid input detected',
          completion_prompt: 'Stage completed successfully'
        },
        metadata: {
          tone: 'professional',
          style: 'formal'
        },
        created_by: 'test_user'
      };

      const prompt = await promptService.createPrompt(promptData);
      
      expect(prompt).toBeDefined();
      expect(prompt.name).toBe('Test Prompt');
      expect(prompt.stage_id).toBe('S1_test');
      expect(prompt.content.main_prompt).toBe('This is a test prompt');
      expect(prompt.metadata?.tone).toBe('professional');
      expect(prompt.is_active).toBe(true);
    });
  });

  describe('updatePrompt', () => {
    it('should update existing prompt', async () => {
      // First create a prompt
      const prompts = await promptService.importDefaultWellnessPrompts('en-US');
      const originalPrompt = prompts[0];

      // Update it
      const updated = await promptService.updatePrompt(originalPrompt.id, {
        name: 'Updated Prompt Name',
        content: {
          main_prompt: 'Updated main prompt text'
        }
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Prompt Name');
      expect(updated?.content.main_prompt).toBe('Updated main prompt text');
      // Other content should remain unchanged
      expect(updated?.content.follow_up_prompt).toBe(originalPrompt.content.follow_up_prompt);
    });

    it('should return null for non-existent prompt', async () => {
      const updated = await promptService.updatePrompt('non-existent-id', {
        name: 'New Name'
      });

      expect(updated).toBeNull();
    });
  });

  describe('getFormPromptsForBot', () => {
    beforeEach(async () => {
      await promptService.importDefaultWellnessPrompts('en-US');
    });

    it('should return formatted prompts for bot consumption', async () => {
      const data = await promptService.getFormPromptsForBot('wellness_intake', 'en-US');
      
      expect(data).toBeDefined();
      expect(data?.form_name).toBe('wellness_intake');
      expect(data?.locale).toBe('en-US');
      expect(data?.stages).toHaveLength(5);
      
      const stage1 = data?.stages.find(s => s.stage_id === 'S1_demographics');
      expect(stage1).toBeDefined();
      expect(stage1?.prompts?.main_prompt).toBeDefined();
      expect(stage1?.prompts?.follow_up_prompt).toBeDefined();
    });
  });

  describe('createPromptVersion', () => {
    beforeEach(async () => {
      await promptService.importDefaultWellnessPrompts('en-US');
    });

    it('should create new version of existing prompt', async () => {
      const newVersion = await promptService.createPromptVersion(
        'wellness_intake',
        'S1_demographics',
        '1.1.0',
        {
          content: {
            main_prompt: 'Updated prompt for version 1.1.0'
          }
        },
        'en-US'
      );

      expect(newVersion).toBeDefined();
      expect(newVersion?.version).toBe('1.1.0');
      expect(newVersion?.content.main_prompt).toBe('Updated prompt for version 1.1.0');
      expect(newVersion?.stage_id).toBe('S1_demographics');
    });

    it('should throw error for non-existent prompt', async () => {
      await expect(
        promptService.createPromptVersion(
          'non_existent_form',
          'S1_demographics',
          '1.1.0',
          {},
          'en-US'
        )
      ).rejects.toThrow("Prompt for stage 'S1_demographics' in form 'non_existent_form' not found");
    });
  });
});
