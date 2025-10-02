import { testDb, setupTestDb } from '../database/knex.test';
import { getAllCoaches, getCoachById, updateCoachPrompt } from '../services/coachService';

describe('Coach Service', () => {
  let testCoachId: string;

  beforeAll(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    // Clean up and create fresh test coach
    await testDb('coaches').del();
    
    const [coach] = await testDb('coaches').insert({
      name: 'Test Service Coach',
      description: 'Test coach for service testing',
      coach_prompt_content: 'You are a test coach for service layer testing.',
      is_active: true,
      tags: ['test', 'service']
    }).returning('*');
    
    testCoachId = coach.id;
  });

  afterEach(async () => {
    await testDb('coaches').del();
  });

  describe('getAllCoaches', () => {
    it('should return all coaches ordered by created_at', async () => {
      // Add another coach
      await testDb('coaches').insert({
        name: 'Second Coach',
        description: 'Second test coach',
        coach_prompt_content: 'Second coach prompt',
        is_active: false,
        tags: ['test']
      });

      const coaches = await getAllCoaches();
      
      expect(coaches).toHaveLength(2);
      expect(coaches[0].name).toBe('Test Service Coach');
      expect(coaches[1].name).toBe('Second Coach');
      
      // Verify ordering by created_at
      expect(new Date(coaches[0].created_at).getTime()).toBeLessThanOrEqual(
        new Date(coaches[1].created_at).getTime()
      );
    });

    it('should return empty array when no coaches exist', async () => {
      await testDb('coaches').del();
      
      const coaches = await getAllCoaches();
      expect(coaches).toEqual([]);
    });
  });

  describe('getCoachById', () => {
    it('should return coach when found', async () => {
      const coach = await getCoachById(testCoachId);
      
      expect(coach).not.toBeNull();
      expect(coach!.id).toBe(testCoachId);
      expect(coach!.name).toBe('Test Service Coach');
      expect(coach!.coach_prompt_content).toBe('You are a test coach for service layer testing.');
    });

    it('should return null when coach not found', async () => {
      const fakeId = '12345678-1234-1234-1234-123456789012';
      const coach = await getCoachById(fakeId);
      
      expect(coach).toBeNull();
    });

    it('should handle invalid UUID gracefully', async () => {
      // PostgreSQL will throw an error for invalid UUID format
      await expect(getCoachById('invalid-uuid')).rejects.toThrow();
    });
  });

  describe('updateCoachPrompt', () => {
    it('should update coach prompt content successfully', async () => {
      const newPrompt = 'Updated coach prompt content for testing';
      
      const updatedCoach = await updateCoachPrompt(testCoachId, {
        coach_prompt_content: newPrompt
      });
      
      expect(updatedCoach).not.toBeNull();
      expect(updatedCoach!.coach_prompt_content).toBe(newPrompt);
      expect(updatedCoach!.name).toBe('Test Service Coach'); // Should remain unchanged
      
      // Verify updated_at changed
      const originalCoach = await testDb('coaches').where('id', testCoachId).first();
      expect(new Date(updatedCoach!.updated_at).getTime()).toBeGreaterThan(
        new Date(originalCoach.created_at).getTime()
      );
    });

    it('should throw error when coach not found', async () => {
      const fakeId = '12345678-1234-1234-1234-123456789012';
      
      await expect(updateCoachPrompt(fakeId, {
        coach_prompt_content: 'This should fail'
      })).rejects.toThrow(`Coach with id ${fakeId} not found`);
    });

    it('should handle very long prompt content', async () => {
      const longPrompt = 'Very long prompt content. '.repeat(100);
      
      const updatedCoach = await updateCoachPrompt(testCoachId, {
        coach_prompt_content: longPrompt
      });
      
      expect(updatedCoach!.coach_prompt_content).toBe(longPrompt);
      expect(updatedCoach!.coach_prompt_content.length).toBeGreaterThan(1000);
    });

    it('should handle special characters and emojis', async () => {
      const specialPrompt = 'Coach with emojis 😊🎯 and special chars: áéíóú ñ çñ';
      
      const updatedCoach = await updateCoachPrompt(testCoachId, {
        coach_prompt_content: specialPrompt
      });
      
      expect(updatedCoach!.coach_prompt_content).toBe(specialPrompt);
    });
  });

  describe('Database integration', () => {
    it('should handle concurrent updates correctly', async () => {
      const prompt1 = 'First update';
      const prompt2 = 'Second update';
      
      // Simulate concurrent updates
      const [result1, result2] = await Promise.all([
        updateCoachPrompt(testCoachId, { coach_prompt_content: prompt1 }),
        updateCoachPrompt(testCoachId, { coach_prompt_content: prompt2 })
      ]);
      
      // Both should succeed, but the final state should be consistent
      expect(result1).not.toBeNull();
      expect(result2).not.toBeNull();
      
      // Verify final state
      const finalCoach = await getCoachById(testCoachId);
      expect([prompt1, prompt2]).toContain(finalCoach!.coach_prompt_content);
    });
  });
});
