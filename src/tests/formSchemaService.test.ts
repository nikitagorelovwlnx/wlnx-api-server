import { FormSchemaService } from '../services/formSchemaService';
import { testDb } from '../database/knex.test';

describe('FormSchemaService', () => {
  let formSchemaService: FormSchemaService;

  beforeAll(async () => {
    formSchemaService = new FormSchemaService(testDb);
  });

  beforeEach(async () => {
    // Clean up test data - handled by setup.ts
  });

  afterAll(async () => {
    // Connection closed by setup.ts
  });

  describe('importWellnessSchema', () => {
    it('should create wellness form schema with all required fields', async () => {
      const schema = await formSchemaService.importWellnessSchema();
      
      expect(schema).toBeDefined();
      expect(schema.name).toBe('wellness_intake');
      expect(schema.version).toBe('1.0.0');
      expect(schema.locale).toBe('en-US');
      expect(schema.fields).toHaveLength(18); // Based on our wellness fields
      expect(schema.stages).toHaveLength(5); // 5-stage dialog
    });

    it('should create fields with proper UI metadata', async () => {
      const schema = await formSchemaService.importWellnessSchema();
      
      const ageField = schema.fields.find(f => f.key === 'age');
      expect(ageField).toBeDefined();
      expect(ageField?.type).toBe('number');
      expect(ageField?.required).toBe(true);
      expect(ageField?.ui?.label).toBe('Age');
      expect(ageField?.ui?.group).toBe('demographics');
      expect(ageField?.validation?.min).toBe(16);
      expect(ageField?.validation?.max).toBe(100);
    });

    it('should create stages with proper targets', async () => {
      const schema = await formSchemaService.importWellnessSchema();
      
      const demographicsStage = schema.stages.find(s => s.id === 'demographics_baseline');
      expect(demographicsStage).toBeDefined();
      expect(demographicsStage?.targets).toContain('age');
      expect(demographicsStage?.targets).toContain('gender');
      expect(demographicsStage?.targets).toContain('weight');
      expect(demographicsStage?.targets).toContain('height');
    });
  });

  describe('getActiveSchemas', () => {
    it('should return empty array when no schemas exist', async () => {
      const schemas = await formSchemaService.getActiveSchemas();
      expect(schemas).toEqual([]);
    });

    it('should return only active schemas', async () => {
      // Create test schema
      await formSchemaService.importWellnessSchema();
      
      // Deactivate it
      await formSchemaService.deactivateSchema('wellness_intake');
      
      const schemas = await formSchemaService.getActiveSchemas();
      expect(schemas).toEqual([]);
    });
  });

  describe('getSchema', () => {
    it('should return specific schema by name', async () => {
      const created = await formSchemaService.importWellnessSchema();
      
      const retrieved = await formSchemaService.getSchema('wellness_intake');
      expect(retrieved).toBeDefined();
      expect(retrieved?.name).toBe(created.name);
      expect(retrieved?.version).toBe(created.version);
    });

    it('should return null for non-existent schema', async () => {
      const schema = await formSchemaService.getSchema('non_existent');
      expect(schema).toBeNull();
    });
  });

  describe('createSchema', () => {
    it('should create new schema successfully', async () => {
      const formSpec = {
        name: 'test_form',
        description: 'Test form',
        version: '1.0.0',
        locale: 'en-US',
        fields: [
          {
            key: 'test_field',
            type: 'string' as const,
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

      const created = await formSchemaService.createSchema(formSpec);
      
      expect(created).toBeDefined();
      expect(created.name).toBe('test_form');
      expect(created.id).toBeDefined();
      expect(created.created_at).toBeDefined();
    });
  });

  describe('updateSchema', () => {
    it('should create new version of existing schema', async () => {
      const original = await formSchemaService.importWellnessSchema();
      
      const updated = await formSchemaService.updateSchema(
        'wellness_intake',
        '1.1.0',
        { description: 'Updated wellness form' }
      );
      
      expect(updated.version).toBe('1.1.0');
      expect(updated.description).toBe('Updated wellness form');
      expect(updated.name).toBe(original.name);
    });

    it('should throw error for non-existent schema', async () => {
      await expect(
        formSchemaService.updateSchema('non_existent', '1.1.0', {})
      ).rejects.toThrow("Schema 'non_existent' not found");
    });
  });
});
