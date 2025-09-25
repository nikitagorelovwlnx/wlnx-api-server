/**
 * Hardcoded wellness form schema - single source of truth
 * This schema defines the current structure for wellness interviews
 */

import { FormSpec, FieldSpec, StageSpec } from '../types/form-spec';

const WELLNESS_FIELDS: FieldSpec[] = [
  // Demographics
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
      group: 'demographics',
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
      group: 'demographics',
      priority: 4,
      widget: 'number'
    }
  },
  {
    key: 'location',
    type: 'string',
    ui: {
      label: 'Location',
      placeholder: 'City, Country',
      group: 'demographics',
      priority: 5
    }
  },

  // Biometrics and Habits
  {
    key: 'sleep_duration',
    type: 'number',
    validation: { min: 3, max: 12 },
    ui: {
      label: 'Sleep Duration (hours)',
      placeholder: 'How many hours do you sleep',
      group: 'biometrics',
      priority: 6,
      widget: 'number'
    }
  },
  {
    key: 'sleep_quality',
    type: 'string',
    enum: ['poor', 'average', 'good'],
    ui: {
      label: 'Sleep Quality',
      group: 'biometrics',
      priority: 7,
      widget: 'select'
    }
  },
  {
    key: 'daily_steps',
    type: 'number',
    validation: { min: 0, max: 50000 },
    ui: {
      label: 'Daily Steps',
      placeholder: 'Average number of steps',
      group: 'biometrics',
      priority: 8,
      widget: 'number'
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
      priority: 9,
      widget: 'number'
    }
  },
  {
    key: 'stress_level',
    type: 'string',
    enum: ['low', 'moderate', 'high'],
    ui: {
      label: 'Stress Level',
      group: 'biometrics',
      priority: 10,
      widget: 'select'
    }
  },

  // Lifestyle
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
    key: 'nutrition_habits',
    type: 'array',
    validation: { maxItems: 10 },
    ui: {
      label: 'Nutrition Habits',
      placeholder: 'Describe your nutrition habits',
      group: 'lifestyle',
      priority: 12,
      widget: 'tags'
    }
  },

  // Goals
  {
    key: 'health_goals',
    type: 'array',
    validation: { maxItems: 10 },
    ui: {
      label: 'Health Goals',
      placeholder: 'Add your health goals',
      group: 'goals',
      priority: 13,
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
      priority: 14,
      widget: 'tags'
    }
  },

  // Medical
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
  }
];

const WELLNESS_STAGES: StageSpec[] = [
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
    targets: ['sleep_duration', 'sleep_quality', 'daily_steps', 'resting_heart_rate', 'stress_level'],
    order: 2
  },
  {
    id: 'lifestyle_context',
    name: 'Lifestyle Context',
    description: 'Work, family, and lifestyle factors',
    targets: ['work_schedule', 'nutrition_habits'],
    order: 3
  },
  {
    id: 'medical_history',
    name: 'Medical Information',
    description: 'Medical history, conditions, and contraindications',
    targets: ['chronic_conditions', 'medications', 'contraindications'],
    order: 4
  },
  {
    id: 'goals_preferences',
    name: 'Goals and Preferences',
    description: 'Health goals and activity preferences',
    targets: ['health_goals', 'activity_preferences'],
    order: 5
  }
];

export const WELLNESS_FORM_SCHEMA: FormSpec = {
  id: 'wellness_intake',
  name: 'wellness_intake',
  description: 'Comprehensive wellness and lifestyle data collection form',
  version: '1.0.0',
  locale: 'en-US',
  fields: WELLNESS_FIELDS,
  stages: WELLNESS_STAGES,
  created_at: new Date('2024-01-01'),
  updated_at: new Date(),
  created_by: 'system'
};
