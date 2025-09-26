import { db as knex } from '../database/knex';
import { FormSpec, FormSchemaEntity, FieldSpec, StageSpec } from '../types/form-spec';
import { Knex } from 'knex';

export class FormSchemaService {
  private static readonly TABLE_NAME = 'form_schemas';
  private database: Knex;

  constructor(database?: Knex) {
    this.database = database || knex;
  }

  /**
   * Get all active form schemas
   */
  async getActiveSchemas(locale: string = 'en-US'): Promise<FormSpec[]> {
    const entities = await this.database<FormSchemaEntity>(FormSchemaService.TABLE_NAME)
      .where({ is_active: true, locale })
      .orderBy('name')
      .orderBy('version');

    return entities.map(this.entityToFormSpec);
  }

  /**
   * Get specific form schema by name and version
   */
  async getSchema(name: string, version?: string, locale: string = 'en-US'): Promise<FormSpec | null> {
    let query = this.database<FormSchemaEntity>(FormSchemaService.TABLE_NAME)
      .where({ name, locale, is_active: true });

    if (version) {
      query = query.where({ version });
    } else {
      // Get latest version if no version specified
      query = query.orderBy('version', 'desc').limit(1);
    }

    const entity = await query.first();
    return entity ? this.entityToFormSpec(entity) : null;
  }

  /**
   * Get latest version of a schema
   */
  async getLatestVersion(name: string, locale: string = 'en-US'): Promise<FormSpec | null> {
    return this.getSchema(name, undefined, locale);
  }

  /**
   * Create new form schema
   */
  async createSchema(formSpec: Omit<FormSpec, 'id' | 'created_at' | 'updated_at'>): Promise<FormSpec> {
    const entity: Omit<FormSchemaEntity, 'id' | 'created_at' | 'updated_at'> = {
      name: formSpec.name,
      description: formSpec.description,
      version: formSpec.version,
      locale: formSpec.locale,
      schema_data: {
        fields: formSpec.fields,
        stages: formSpec.stages
      },
      is_active: true,
      created_by: formSpec.created_by
    };

    const [inserted] = await this.database<FormSchemaEntity>(FormSchemaService.TABLE_NAME)
      .insert(entity)
      .returning('*');

    return this.entityToFormSpec(inserted);
  }

  /**
   * Update existing schema (creates new version)
   */
  async updateSchema(
    name: string, 
    newVersion: string, 
    updates: Partial<Omit<FormSpec, 'id' | 'name' | 'version' | 'created_at' | 'updated_at'>>,
    locale: string = 'en-US'
  ): Promise<FormSpec> {
    // Get current schema
    const current = await this.getLatestVersion(name, locale);
    if (!current) {
      throw new Error(`Schema '${name}' not found`);
    }

    // Create new version
    const newSchema: Omit<FormSpec, 'id' | 'created_at' | 'updated_at'> = {
      ...current,
      ...updates,
      name,
      version: newVersion
    };

    return this.createSchema(newSchema);
  }

  /**
   * Deactivate schema version
   */
  async deactivateSchema(name: string, version?: string, locale: string = 'en-US'): Promise<void> {
    let query = this.database<FormSchemaEntity>(FormSchemaService.TABLE_NAME)
      .where({ name, locale });

    if (version) {
      query = query.where({ version });
    }

    await query.update({ 
      is_active: false, 
      updated_at: this.database.fn.now() 
    });
  }

  /**
   * Import wellness form schema from WELLNESS_FORM_SCHEMA
   */
  async importWellnessSchema(): Promise<FormSpec> {
    const wellnessFields = this.createWellnessFields();
    const wellnessStages = this.createWellnessStages();

    const formSpec: Omit<FormSpec, 'id' | 'created_at' | 'updated_at'> = {
      name: 'wellness_intake',
      description: 'Comprehensive wellness and lifestyle data collection form',
      version: '1.0.0',
      locale: 'en-US',
      fields: wellnessFields,
      stages: wellnessStages,
      created_by: 'system'
    };

    return this.createSchema(formSpec);
  }

  /**
   * Convert database entity to FormSpec
   */
  private entityToFormSpec(entity: FormSchemaEntity): FormSpec {
    // Parse JSON if it's stored as string (SQLite issue)
    let schemaData = entity.schema_data;
    if (typeof schemaData === 'string') {
      try {
        schemaData = JSON.parse(schemaData);
      } catch (error) {
        console.warn('Failed to parse schema_data JSON:', error);
        schemaData = { fields: [], stages: [] };
      }
    }
    
    return {
      id: entity.id,
      name: entity.name,
      description: entity.description,
      version: entity.version,
      locale: entity.locale,
      fields: schemaData?.fields || [],
      stages: schemaData?.stages || [],
      created_at: entity.created_at,
      updated_at: entity.updated_at,
      created_by: entity.created_by
    };
  }

  /**
   * Create field specifications from WELLNESS_FORM_SCHEMA
   */
  private createWellnessFields(): FieldSpec[] {
    return [
      // 🟢 High Priority Fields (Core Health Data)
      {
        key: 'age',
        type: 'number',
        required: true,
        validation: { min: 16, max: 100 },
        ui: {
          label: 'Age',
          placeholder: 'Enter your age',
          group: 'demographics',
          priority: 1,
          widget: 'number'
        }
      },
      {
        key: 'gender',
        type: 'string',
        enum: ['male', 'female', 'other'],
        ui: {
          label: 'Gender',
          group: 'demographics',
          priority: 2,
          widget: 'select'
        }
      },
      {
        key: 'weight',
        type: 'number',
        validation: { min: 30, max: 300 },
        ui: {
          label: 'Weight (kg)',
          placeholder: 'Enter your weight',
          group: 'biometrics',
          priority: 3,
          widget: 'number'
        }
      },
      {
        key: 'height',
        type: 'number',
        validation: { min: 100, max: 250 },
        ui: {
          label: 'Height (cm)',
          placeholder: 'Enter your height',
          group: 'biometrics',
          priority: 4,
          widget: 'number'
        }
      },
      {
        key: 'sleep_duration',
        type: 'number',
        validation: { min: 3, max: 12 },
        ui: {
          label: 'Sleep Duration (hours)',
          placeholder: 'How many hours do you sleep',
          group: 'lifestyle',
          priority: 5,
          widget: 'number'
        }
      },
      {
        key: 'stress_level',
        type: 'string',
        enum: ['low', 'moderate', 'high'],
        ui: {
          label: 'Stress Level',
          group: 'lifestyle',
          priority: 6,
          widget: 'select'
        }
      },
      {
        key: 'resting_heart_rate',
        type: 'number',
        validation: { min: 40, max: 150 },
        ui: {
          label: 'Resting Heart Rate (bpm)',
          placeholder: 'Enter your resting heart rate',
          group: 'biometrics',
          priority: 7,
          widget: 'number'
        }
      },
      {
        key: 'health_goals',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Health Goals',
          placeholder: 'Add your health goals',
          group: 'goals',
          priority: 8,
          widget: 'tags'
        }
      },
      {
        key: 'activity_preferences',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Activity Preferences',
          placeholder: 'What activities do you enjoy',
          group: 'goals',
          priority: 9,
          widget: 'tags'
        }
      },

      // 🟡 Medium Priority Fields
      {
        key: 'location',
        type: 'string',
        ui: {
          label: 'Location',
          placeholder: 'City, Country',
          group: 'demographics',
          priority: 10
        }
      },
      {
        key: 'work_schedule',
        type: 'string',
        ui: {
          label: 'Work Schedule',
          placeholder: 'Describe your work schedule',
          group: 'lifestyle',
          priority: 11,
          widget: 'textarea'
        }
      },
      {
        key: 'daily_steps',
        type: 'number',
        validation: { min: 0, max: 50000 },
        ui: {
          label: 'Daily Steps',
          placeholder: 'Average number of steps',
          group: 'activity',
          priority: 12,
          widget: 'number'
        }
      },
      {
        key: 'sleep_quality',
        type: 'string',
        enum: ['poor', 'average', 'good'],
        ui: {
          label: 'Sleep Quality',
          group: 'lifestyle',
          priority: 13,
          widget: 'select'
        }
      },
      {
        key: 'nutrition_habits',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Nutrition Habits',
          placeholder: 'Describe your nutrition habits',
          group: 'lifestyle',
          priority: 14,
          widget: 'tags'
        }
      },

      // 🔴 Medical Fields
      {
        key: 'chronic_conditions',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Chronic Conditions',
          placeholder: 'List any chronic conditions',
          group: 'medical',
          priority: 15,
          widget: 'tags'
        }
      },
      {
        key: 'medications',
        type: 'array',
        validation: { maxItems: 20 },
        ui: {
          label: 'Medications',
          placeholder: 'Medications you are taking',
          group: 'medical',
          priority: 16,
          widget: 'tags'
        }
      },
      {
        key: 'contraindications',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Contraindications',
          placeholder: 'Contraindications to procedures',
          group: 'medical',
          priority: 17,
          widget: 'tags'
        }
      },
      {
        key: 'injuries',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Past Injuries',
          placeholder: 'Past injuries that may affect activities',
          group: 'medical',
          priority: 18,
          widget: 'tags'
        }
      }
    ];
  }

  /**
   * Create stage specifications for 5-stage dialog
   */
  private createWellnessStages(): StageSpec[] {
    return [
      {
        id: 'demographics_baseline',
        name: 'Basic Information',
        description: 'Collect basic demographic data',
        targets: ['age', 'gender', 'weight', 'height', 'location'],
        order: 1
      },
      {
        id: 'biometrics_habits',
        name: 'Biometrics and Habits',
        description: 'Daily habits, sleep, activity, and biometric data',
        targets: ['sleep_duration', 'sleep_quality', 'daily_steps', 'resting_heart_rate', 'stress_level', 'nutrition_habits'],
        order: 2
      },
      {
        id: 'lifestyle_context',
        name: 'Lifestyle Context',
        description: 'Work, family, and lifestyle factors',
        targets: ['work_schedule', 'workload', 'business_travel', 'night_shifts', 'family_obligations', 'recovery_resources'],
        order: 3
      },
      {
        id: 'medical_history',
        name: 'Medical Information',
        description: 'Medical history, conditions, and contraindications',
        targets: ['chronic_conditions', 'medications', 'contraindications', 'injuries', 'supplements'],
        order: 4
      },
      {
        id: 'goals_preferences',
        name: 'Goals and Preferences',
        description: 'Health goals, activity preferences, and coaching style',
        targets: ['health_goals', 'activity_preferences', 'motivation_level', 'morning_evening_type', 'coaching_style_preference'],
        order: 5
      }
    ];
  }
}
