import { FormSpec, FieldSpec, StageSpec } from '../types/form-spec';

describe('FormSpec v2 Types and Validation', () => {
  
  describe('FieldSpec Structure', () => {
    it('should have correct field structure for number type', () => {
      const field: FieldSpec = {
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
      };

      expect(field.key).toBe('age');
      expect(field.type).toBe('number');
      expect(field.required).toBe(true);
      expect(field.validation?.min).toBe(16);
      expect(field.validation?.max).toBe(100);
      expect(field.ui?.label).toBe('Age');
      expect(field.ui?.widget).toBe('number');
    });

    it('should support enum fields', () => {
      const field: FieldSpec = {
        key: 'gender',
        type: 'string',
        enum: ['male', 'female', 'other'],
        ui: {
          label: 'Gender',
          widget: 'select'
        }
      };

      expect(field.enum).toEqual(['male', 'female', 'other']);
      expect(field.ui?.widget).toBe('select');
    });

    it('should support array fields with validation', () => {
      const field: FieldSpec = {
        key: 'health_goals',
        type: 'array',
        validation: { maxItems: 10 },
        ui: {
          label: 'Health Goals',
          widget: 'tags'
        }
      };

      expect(field.type).toBe('array');
      expect(field.validation?.maxItems).toBe(10);
      expect(field.ui?.widget).toBe('tags');
    });
  });

  describe('StageSpec Structure', () => {
    it('should have correct stage structure', () => {
      const stage: StageSpec = {
        id: 'S1_demographics',
        name: 'Basic Information',
        description: 'Collect basic demographic data',
        targets: ['age', 'gender', 'weight', 'height'],
        order: 1
      };

      expect(stage.id).toBe('S1_demographics');
      expect(stage.name).toBe('Basic Information');
      expect(stage.targets).toHaveLength(4);
      expect(stage.targets).toContain('age');
      expect(stage.order).toBe(1);
    });
  });

  describe('FormSpec Structure', () => {
    it('should have complete form schema structure', () => {
      const formSpec: Omit<FormSpec, 'id' | 'created_at' | 'updated_at'> = {
        name: 'wellness_intake',
        description: 'Comprehensive wellness data collection',
        version: '1.0.0',
        locale: 'en-US',
        fields: [
          {
            key: 'age',
            type: 'number',
            required: true,
            ui: { label: 'Age' }
          }
        ],
        stages: [
          {
            id: 'S1_demographics',
            name: 'Demographics',
            targets: ['age'],
            order: 1
          }
        ]
      };

      expect(formSpec.name).toBe('wellness_intake');
      expect(formSpec.version).toBe('1.0.0');
      expect(formSpec.locale).toBe('en-US');
      expect(formSpec.fields).toHaveLength(1);
      expect(formSpec.stages).toHaveLength(1);
    });
  });

  describe('Field Types', () => {
    it('should support all defined field types', () => {
      const types = ['string', 'number', 'boolean', 'date', 'array'] as const;
      
      types.forEach(type => {
        const field: FieldSpec = {
          key: `test_${type}`,
          type: type,
          ui: { label: `Test ${type}` }
        };
        
        expect(field.type).toBe(type);
      });
    });
  });

  describe('Widget Types', () => {
    it('should support common widget types', () => {
      const widgets = ['text', 'textarea', 'number', 'select', 'radio', 'checkbox', 'tags', 'date'];
      
      widgets.forEach(widget => {
        const field: FieldSpec = {
          key: `test_${widget}`,
          type: 'string',
          ui: { 
            label: `Test ${widget}`,
            widget: widget
          }
        };
        
        expect(field.ui?.widget).toBe(widget);
      });
    });
  });

  describe('Validation Rules', () => {
    it('should support numeric validation', () => {
      const field: FieldSpec = {
        key: 'age',
        type: 'number',
        validation: {
          min: 0,
          max: 120
        },
        ui: { label: 'Age' }
      };

      expect(field.validation?.min).toBe(0);
      expect(field.validation?.max).toBe(120);
    });

    it('should support string validation', () => {
      const field: FieldSpec = {
        key: 'name',
        type: 'string',
        validation: {
          minLength: 2,
          maxLength: 50,
          pattern: '^[A-Za-z\\s]+$'
        },
        ui: { label: 'Name' }
      };

      expect(field.validation?.minLength).toBe(2);
      expect(field.validation?.maxLength).toBe(50);
      expect(field.validation?.pattern).toBe('^[A-Za-z\\s]+$');
    });

    it('should support array validation', () => {
      const field: FieldSpec = {
        key: 'tags',
        type: 'array',
        validation: {
          maxItems: 5
        },
        ui: { label: 'Tags' }
      };

      expect(field.validation?.maxItems).toBe(5);
    });
  });
});
