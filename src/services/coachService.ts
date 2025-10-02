import { getDb } from '../database';
import { Coach, UpdateCoachRequest } from '../types';

/**
 * Get all coaches from the database
 */
export async function getAllCoaches(): Promise<Coach[]> {
  const db = getDb();
  return await db('coaches')
    .select('*')
    .orderBy('created_at', 'asc');
}

/**
 * Get a specific coach by ID
 */
export async function getCoachById(id: string): Promise<Coach | null> {
  const db = getDb();
  const coach = await db('coaches')
    .where('id', id)
    .first();
  
  return coach || null;
}

/**
 * Update coach prompt content
 * Only allows updating the coach_prompt_content field
 */
export async function updateCoachPrompt(id: string, updateData: UpdateCoachRequest): Promise<Coach | null> {
  const db = getDb();
  
  // Check if coach exists
  const existingCoach = await getCoachById(id);
  if (!existingCoach) {
    throw new Error(`Coach with id ${id} not found`);
  }
  
  // Update only the coach_prompt_content
  await db('coaches')
    .where('id', id)
    .update({
      coach_prompt_content: updateData.coach_prompt_content,
      updated_at: new Date()
    });
  
  // Return updated coach
  return await getCoachById(id);
}

