import { db as knex } from '../database/knex';
import { 
  PromptSpec, 
  PromptEntity, 
  CreatePromptRequest, 
  UpdatePromptRequest,
  StagePromptResponse,
  FormPromptsResponse
} from '../types/prompt-spec';
import { Knex } from 'knex';

export class PromptService {
  private static readonly TABLE_NAME = 'prompts';
  private database: Knex;

  constructor(database?: Knex) {
    this.database = database || knex;
  }

  /**
   * Get all active prompts for a form
   */
  async getFormPrompts(formName: string, locale: string = 'en-US', version?: string): Promise<PromptSpec[]> {
    let query = this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ form_name: formName, locale, is_active: true });

    if (version) {
      query = query.where({ version });
    } else {
      // Get latest version for each stage
      const subquery = this.database(PromptService.TABLE_NAME)
        .select('stage_id')
        .max('version as latest_version')
        .where({ form_name: formName, locale, is_active: true })
        .groupBy('stage_id');

      query = query.whereIn(['stage_id', 'version'], subquery);
    }

    const entities = await query.orderBy('stage_id');
    return entities.map(this.entityToPromptSpec);
  }

  /**
   * Get prompt for specific stage
   */
  async getStagePrompt(
    formName: string, 
    stageId: string, 
    locale: string = 'en-US', 
    version?: string
  ): Promise<PromptSpec | null> {
    let query = this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ form_name: formName, stage_id: stageId, locale, is_active: true });

    if (version) {
      query = query.where({ version });
    } else {
      // Get latest version
      query = query.orderBy('version', 'desc').limit(1);
    }

    const entity = await query.first();
    return entity ? this.entityToPromptSpec(entity) : null;
  }

  /**
   * Get all prompts with optional filters
   */
  async getPrompts(filters?: {
    formName?: string;
    stageId?: string;
    locale?: string;
    isActive?: boolean;
  }): Promise<PromptSpec[]> {
    let query = this.database<PromptEntity>(PromptService.TABLE_NAME);

    if (filters?.formName) query = query.where('form_name', filters.formName);
    if (filters?.stageId) query = query.where('stage_id', filters.stageId);
    if (filters?.locale) query = query.where('locale', filters.locale);
    if (filters?.isActive !== undefined) query = query.where('is_active', filters.isActive);

    const entities = await query.orderBy(['form_name', 'stage_id', 'version']);
    return entities.map(this.entityToPromptSpec);
  }

  /**
   * Create new prompt
   */
  async createPrompt(request: CreatePromptRequest): Promise<PromptSpec> {
    const entity: Omit<PromptEntity, 'id' | 'created_at' | 'updated_at'> = {
      name: request.name,
      description: request.description,
      stage_id: request.stage_id,
      form_name: request.form_name,
      version: request.version,
      locale: request.locale,
      prompt_data: {
        content: request.content,
        metadata: request.metadata
      },
      is_active: true,
      created_by: request.created_by
    };

    const [insertedId] = await this.database<PromptEntity>(PromptService.TABLE_NAME)
      .insert(entity);

    // SQLite doesn't support returning, so fetch the inserted record by stage_id and form_name
    const inserted = await this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ 
        stage_id: entity.stage_id,
        form_name: entity.form_name,
        version: entity.version,
        locale: entity.locale
      })
      .orderBy('created_at', 'desc')
      .first();

    if (!inserted) {
      throw new Error('Failed to retrieve inserted prompt');
    }
    
    return this.entityToPromptSpec(inserted);
  }

  /**
   * Update existing prompt
   */
  async updatePrompt(id: string, updates: UpdatePromptRequest): Promise<PromptSpec | null> {
    const current = await this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ id })
      .first();

    if (!current) {
      return null;
    }

    // Parse current prompt_data if it's a string
    let currentPromptData = current.prompt_data;
    if (typeof currentPromptData === 'string') {
      try {
        currentPromptData = JSON.parse(currentPromptData);
      } catch (error) {
        currentPromptData = { content: {}, metadata: {} };
      }
    }
    
    const updatedData = {
      ...currentPromptData,
      content: { ...currentPromptData?.content, ...updates.content },
      metadata: { ...currentPromptData?.metadata, ...updates.metadata }
    };

    await this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ id })
      .update({
        name: updates.name || current.name,
        description: updates.description !== undefined ? updates.description : current.description,
        prompt_data: JSON.stringify(updatedData), // Force JSON serialization for SQLite
        updated_at: this.database.fn.now()
      });

    // SQLite doesn't support returning, so fetch the updated record
    const updated = await this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ id })
      .first();
      
    return updated ? this.entityToPromptSpec(updated) : null;
  }

  /**
   * Create new version of existing prompt
   */
  async createPromptVersion(
    formName: string,
    stageId: string,
    newVersion: string,
    updates: Partial<CreatePromptRequest>,
    locale: string = 'en-US'
  ): Promise<PromptSpec | null> {
    const current = await this.getStagePrompt(formName, stageId, locale);
    if (!current) {
      throw new Error(`Prompt for stage '${stageId}' in form '${formName}' not found`);
    }

    const newPrompt: CreatePromptRequest = {
      name: updates.name || current.name,
      description: updates.description || current.description,
      stage_id: stageId,
      form_name: formName,
      version: newVersion,
      locale: locale,
      content: { ...current.content, ...updates.content },
      metadata: { ...current.metadata, ...updates.metadata },
      created_by: updates.created_by
    };

    return this.createPrompt(newPrompt);
  }

  /**
   * Deactivate prompt
   */
  async deactivatePrompt(id: string): Promise<void> {
    await this.database<PromptEntity>(PromptService.TABLE_NAME)
      .where({ id })
      .update({ 
        is_active: false, 
        updated_at: this.database.fn.now() 
      });
  }

  /**
   * Import default wellness interview prompts
   */
  async importDefaultWellnessPrompts(locale: string = 'en-US'): Promise<PromptSpec[]> {
    const defaultPrompts = this.getDefaultWellnessPrompts(locale);
    const createdPrompts: PromptSpec[] = [];

    for (const promptData of defaultPrompts) {
      try {
        const prompt = await this.createPrompt(promptData);
        createdPrompts.push(prompt);
      } catch (error) {
        console.warn(`Failed to create prompt for stage ${promptData.stage_id}:`, error);
      }
    }

    return createdPrompts;
  }

  /**
   * Get formatted prompts for bot consumption
   */
  async getFormPromptsForBot(
    formName: string, 
    locale: string = 'en-US', 
    version?: string
  ): Promise<FormPromptsResponse['data']> {
    const prompts = await this.getFormPrompts(formName, locale, version);
    
    // Group by stage and format for bot
    const stagePrompts = prompts.map(prompt => ({
      stage_id: prompt.stage_id,
      stage_name: prompt.name,
      prompts: {
        stage_id: prompt.stage_id,
        form_name: prompt.form_name,
        main_prompt: prompt.content.main_prompt,
        follow_up_prompt: prompt.content.follow_up_prompt,
        validation_prompt: prompt.content.validation_prompt,
        completion_prompt: prompt.content.completion_prompt,
        metadata: prompt.metadata
      }
    }));

    return {
      form_name: formName,
      version: prompts[0]?.version || '1.0.0',
      locale: locale,
      stages: stagePrompts
    };
  }

  /**
   * Convert database entity to PromptSpec
   */
  private entityToPromptSpec(entity: PromptEntity): PromptSpec {
    // Parse JSON if it's stored as string (SQLite issue)
    let promptData = entity.prompt_data;
    if (typeof promptData === 'string') {
      if (promptData === '[object Object]') {
        // SQLite sometimes returns this invalid string, use fallback
        promptData = { content: {}, metadata: {} };
      } else {
        try {
          promptData = JSON.parse(promptData);
        } catch (error) {
          console.warn('Failed to parse prompt_data JSON:', error);
          promptData = { content: {}, metadata: {} };
        }
      }
    } else if (!promptData || typeof promptData !== 'object') {
      promptData = { content: {}, metadata: {} };
    }
    
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      stage_id: entity.stage_id,
      form_name: entity.form_name,
      version: entity.version,
      locale: entity.locale,
      content: promptData?.content || {},
      metadata: promptData?.metadata || {},
      is_active: Boolean(entity.is_active), // Convert 0/1 to boolean
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      created_by: entity.created_by
    };
  }

  /**
   * Get default wellness interview prompts
   */
  private getDefaultWellnessPrompts(locale: string): CreatePromptRequest[] {
    const basePrompts = [
      {
        stage_id: 'demographics_baseline',
        name: 'Demographics Collection',
        description: 'Collect basic demographic information and physical data',
        content: {
          main_prompt: `Let's get acquainted! 😊 Tell me a bit about yourself - your age, where you live, and basic physical data (height, weight). This will help me understand you better.

I'm looking to learn about:
- Your age
- Gender
- Current weight (in kg) 
- Height (in cm)
- Location/city
- Time zone (if relevant)

Feel free to share whatever you're comfortable with - we can fill in details as we go!`,
          follow_up_prompt: `To get a complete picture, could you also share your {missing_fields}? This helps me give better recommendations.`,
          validation_prompt: `I want to make sure I have the correct {field_name}. Could you double-check that for me?`,
          completion_prompt: `Perfect! Now I have your basic info. Let's talk about your daily habits and lifestyle patterns.`
        }
      },
      {
        stage_id: 'biometrics_habits',
        name: 'Biometrics and Habits',
        description: 'Assess daily habits, sleep, activity, and biometric data',
        content: {
          main_prompt: `Excellent! Now let's talk about your habits 📊 How much do you usually sleep? How about physical activity - walking, steps? What about nutrition and general well-being?

I'm interested in:
- Sleep duration (hours per night)
- Sleep quality (good, poor, average)
- Daily steps or physical activity
- Resting heart rate (if you know it)
- Stress levels (low, moderate, high)
- Nutrition habits and eating patterns
- Hydration, caffeine, alcohol intake

Share what you know - even approximate answers help!`,
          follow_up_prompt: `Could you also tell me about your {missing_fields}? This helps me understand your daily patterns better.`,
          validation_prompt: `I want to make sure I understand your {field_name} correctly. Could you clarify that for me?`,
          completion_prompt: `Great! I'm getting a good picture of your daily habits. Now let's discuss your work and lifestyle context.`
        }
      },
      {
        stage_id: 'lifestyle_context',
        name: 'Lifestyle Context', 
        description: 'Understand work, family, and lifestyle context',
        content: {
          main_prompt: `Good! Now it's important to understand your lifestyle 🏢 Tell me about work, schedule, family matters. What affects your day and how do you recover?

I'd like to know about:
- Work schedule and type of job
- Workload and stress from work
- Business travel or irregular hours
- Night shifts or unusual schedules
- Family obligations and responsibilities
- How you recover and relax
- Cognitive demands of your work

This helps me understand what factors influence your wellness.`,
          follow_up_prompt: `Could you also share about your {missing_fields}? Understanding your full context helps with recommendations.`,
          validation_prompt: `I want to make sure I understand your {field_name} situation correctly. Could you clarify?`,
          completion_prompt: `Perfect! I understand your lifestyle context. Now let's move to an important topic - health considerations.`
        }
      },
      {
        stage_id: 'medical_history',
        name: 'Medical History',
        description: 'Collect medical history, conditions, and contraindications',
        content: {
          main_prompt: `Let's move to an important topic - health 🏥 Are there any health issues, injuries, medications, or limitations? If everything is fine - just say there are no problems.

I'm asking about:
- Chronic health conditions or ongoing issues
- Past injuries that might affect activities
- Current medications or supplements
- Any restrictions or contraindications for exercise
- Health considerations I should know about

Be especially careful with medical information - only share what you're comfortable with and what's relevant.`,
          follow_up_prompt: `If you have any information about {missing_fields}, please share it. Otherwise, that's completely fine.`,
          validation_prompt: `I want to make sure I have accurate information about your {field_name}. Could you clarify that?`,
          completion_prompt: `Thank you for the health information. Finally, let's talk about your goals and what you want to achieve!`
        }
      },
      {
        stage_id: 'goals_preferences',
        name: 'Goals and Preferences',
        description: 'Define health goals and activity preferences',
        content: {
          main_prompt: `And finally - your goals! 🎯 What do you want to achieve? What activities do you enjoy? Do you prefer working out in the morning or evening? What approach works best for you?

I'm interested in:
- Your main health and fitness goals
- Preferred types of physical activities
- Whether you're more of a morning or evening person
- What coaching style works for you (strict, flexible, supportive)
- Current motivation level
- Any specific interests or hobbies
- Lifestyle factors that are important to you

This helps me understand what kind of recommendations will actually work for your life!`,
          follow_up_prompt: `Could you also share your thoughts on {missing_fields}? This helps me tailor recommendations to your preferences.`,
          validation_prompt: `I want to make sure I understand your {field_name} correctly. Could you clarify what you meant?`,
          completion_prompt: `Perfect! I now have all the information I need 🎉 Thank you for sharing so much detail. I can now provide you with personalized wellness recommendations that fit your life and goals!`
        }
      }
    ];

    return basePrompts.map(prompt => ({
      ...prompt,
      form_name: 'wellness_intake',
      version: '1.0.0',
      locale: locale,
      metadata: {
        tone: 'friendly',
        style: 'conversational',
        length: 'medium',
        difficulty: 'simple'
      },
      created_by: 'system'
    }));
  }
}
