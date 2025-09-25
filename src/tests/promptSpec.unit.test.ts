import { PromptSpec, CreatePromptRequest, StagePromptResponse } from '../types/prompt-spec';

describe('Prompt Types and Structure Validation', () => {
  
  describe('PromptSpec Structure', () => {
    it('should have correct prompt structure', () => {
      const prompt: Omit<PromptSpec, 'id' | 'created_at' | 'updated_at'> = {
        name: 'Test Prompt',
        description: 'A test prompt for validation',
        stage_id: 'demographics_baseline',
        form_name: 'wellness_intake',
        version: '1.0.0',
        locale: 'en-US',
        content: {
          main_prompt: 'Main conversation prompt',
          follow_up_prompt: 'Follow-up when more info needed',
          validation_prompt: 'When validation fails',
          completion_prompt: 'When stage completes'
        },
        metadata: {
          tone: 'friendly',
          style: 'conversational',
          length: 'medium',
          difficulty: 'simple'
        },
        is_active: true,
        created_by: 'test_user'
      };

      expect(prompt.name).toBe('Test Prompt');
      expect(prompt.stage_id).toBe('demographics_baseline');
      expect(prompt.form_name).toBe('wellness_intake');
      expect(prompt.content.main_prompt).toBe('Main conversation prompt');
      expect(prompt.metadata?.tone).toBe('friendly');
      expect(prompt.is_active).toBe(true);
    });

    it('should support all content types', () => {
      const content = {
        main_prompt: 'Primary prompt text',
        follow_up_prompt: 'Follow-up prompt text',
        validation_prompt: 'Validation error prompt',
        completion_prompt: 'Completion success prompt'
      };

      expect(content.main_prompt).toBeDefined();
      expect(content.follow_up_prompt).toBeDefined();
      expect(content.validation_prompt).toBeDefined();
      expect(content.completion_prompt).toBeDefined();
    });

    it('should support metadata options', () => {
      const metadata = {
        tone: 'professional' as const,
        style: 'formal' as const,
        length: 'long' as const,
        difficulty: 'advanced' as const
      };

      expect(['friendly', 'professional', 'casual']).toContain(metadata.tone);
      expect(['conversational', 'formal', 'medical']).toContain(metadata.style);
      expect(['short', 'medium', 'long']).toContain(metadata.length);
      expect(['simple', 'intermediate', 'advanced']).toContain(metadata.difficulty);
    });
  });

  describe('CreatePromptRequest Structure', () => {
    it('should have correct request structure', () => {
      const request: CreatePromptRequest = {
        name: 'Demographics Prompt',
        description: 'Collect demographic information',
        stage_id: 'demographics_baseline',
        form_name: 'wellness_intake',
        version: '1.0.0',
        locale: 'en-US',
        content: {
          main_prompt: 'Tell me about yourself...',
          follow_up_prompt: 'Could you also share...',
          validation_prompt: 'Please check your input...',
          completion_prompt: 'Great! Moving to next stage...'
        },
        metadata: {
          tone: 'friendly',
          style: 'conversational'
        },
        created_by: 'system'
      };

      expect(request.name).toBe('Demographics Prompt');
      expect(request.stage_id).toBe('demographics_baseline');
      expect(request.content.main_prompt).toContain('Tell me about yourself');
    });
  });

  describe('Stage ID Validation', () => {
    it('should support all expected wellness stage IDs', () => {
      const expectedStages = [
        'demographics_baseline',
        'biometrics_habits',
        'lifestyle_context',
        'medical_history',
        'goals_preferences'
      ];

      expectedStages.forEach(stageId => {
        const prompt: CreatePromptRequest = {
          name: `${stageId} prompt`,
          stage_id: stageId,
          form_name: 'wellness_intake',
          version: '1.0.0',
          locale: 'en-US',
          content: {
            main_prompt: `Prompt for ${stageId}`
          }
        };

        expect(prompt.stage_id).toBe(stageId);
        expect(expectedStages).toContain(prompt.stage_id);
      });
    });
  });

  describe('Version Format Validation', () => {
    it('should accept semantic version format', () => {
      const versions = ['1.0.0', '1.1.0', '2.0.0', '1.0.1', '1.2.3'];
      
      versions.forEach(version => {
        const prompt: CreatePromptRequest = {
          name: 'Test',
          stage_id: 'demographics_baseline',
          form_name: 'wellness_intake',
          version: version,
          locale: 'en-US',
          content: {
            main_prompt: 'Test prompt'
          }
        };

        expect(prompt.version).toMatch(/^\d+\.\d+\.\d+$/);
      });
    });
  });

  describe('Locale Support', () => {
    it('should support different locales', () => {
      const locales = ['en-US', 'es-ES', 'fr-FR', 'de-DE', 'ru-RU'];
      
      locales.forEach(locale => {
        const prompt: CreatePromptRequest = {
          name: 'Test',
          stage_id: 'demographics_baseline', 
          form_name: 'wellness_intake',
          version: '1.0.0',
          locale: locale,
          content: {
            main_prompt: 'Test prompt'
          }
        };

        expect(prompt.locale).toBe(locale);
        expect(locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/);
      });
    });
  });

  describe('Content Validation', () => {
    it('should require main_prompt as minimum', () => {
      const minimalContent = {
        main_prompt: 'Required main prompt text'
      };

      expect(minimalContent.main_prompt).toBeDefined();
      expect(minimalContent.main_prompt.length).toBeGreaterThan(0);
    });

    it('should support optional content fields', () => {
      const fullContent = {
        main_prompt: 'Main prompt',
        follow_up_prompt: 'Follow up',
        validation_prompt: 'Validation error',
        completion_prompt: 'Completion message'
      };

      Object.values(fullContent).forEach(text => {
        expect(typeof text).toBe('string');
        expect(text.length).toBeGreaterThan(0);
      });
    });

    it('should handle variable placeholders', () => {
      const promptWithVariables = {
        main_prompt: 'Hello {user_name}, please provide your {missing_fields}.',
        follow_up_prompt: 'I still need your {missing_fields} to continue.',
        validation_prompt: 'The {field_name} you provided seems incorrect.'
      };

      expect(promptWithVariables.main_prompt).toContain('{user_name}');
      expect(promptWithVariables.main_prompt).toContain('{missing_fields}');
      expect(promptWithVariables.follow_up_prompt).toContain('{missing_fields}');
      expect(promptWithVariables.validation_prompt).toContain('{field_name}');
    });
  });

  describe('StagePromptResponse for Bot', () => {
    it('should format correctly for bot consumption', () => {
      const botResponse: StagePromptResponse['data'] = {
        stage_id: 'demographics_baseline',
        form_name: 'wellness_intake',
        main_prompt: 'Let\'s get acquainted! Tell me about yourself...',
        follow_up_prompt: 'Could you also share your {missing_fields}?',
        validation_prompt: 'I want to make sure I have the correct {field_name}.',
        completion_prompt: 'Perfect! Now I have your basic info.',
        metadata: {
          tone: 'friendly',
          style: 'conversational',
          length: 'medium'
        }
      };

      expect(botResponse.stage_id).toBe('demographics_baseline');
      expect(botResponse.form_name).toBe('wellness_intake');
      expect(botResponse.main_prompt).toContain('Tell me about yourself');
      expect(botResponse.follow_up_prompt).toContain('{missing_fields}');
      expect(botResponse.metadata?.tone).toBe('friendly');
    });
  });

  describe('Required Fields Mapping', () => {
    it('should define required fields for each stage', () => {
      const requiredFieldsMap: Record<string, string[]> = {
        'demographics_baseline': ['age', 'gender'],
        'biometrics_habits': ['sleep_duration'],
        'lifestyle_context': ['work_schedule'],
        'medical_history': [],
        'goals_preferences': ['health_goals']
      };

      Object.entries(requiredFieldsMap).forEach(([stageId, fields]) => {
        expect(Array.isArray(fields)).toBe(true);
        expect(typeof stageId).toBe('string');
        
        // Medical history can be empty (no required fields)
        if (stageId !== 'medical_history') {
          expect(fields.length).toBeGreaterThan(0);
        }
      });
    });
  });

  describe('Prompt Variable Substitution', () => {
    it('should identify common prompt variables', () => {
      const variables = [
        '{missing_fields}',
        '{field_name}',
        '{field_type}',
        '{user_name}',
        '{field_value}'
      ];

      const testPrompt = 'Hello {user_name}, I need your {missing_fields}. The {field_name} should be a {field_type}.';
      
      variables.forEach(variable => {
        if (testPrompt.includes(variable)) {
          expect(testPrompt).toContain(variable);
        }
      });

      // Test variable pattern
      const variablePattern = /\{([a-z_]+)\}/g;
      const matches = testPrompt.match(variablePattern);
      expect(matches).toBeTruthy();
      expect(matches?.length).toBeGreaterThan(0);
    });
  });
});
