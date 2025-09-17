import { Knex } from 'knex';
import { InterviewResult, CreateInterviewResultRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class InterviewService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createInterviewResult(email: string, data: CreateInterviewResultRequest): Promise<InterviewResult> {
    const [result] = await this.db('interview_results')
      .insert({
        id: uuidv4(),
        user_id: email,
        transcription: data.transcription,
        summary: data.summary,
      })
      .returning('*');

    return result;
  }

  async getInterviewResultsByUserId(email: string, limit = 50, offset = 0): Promise<InterviewResult[]> {
    return await this.db('interview_results')
      .select('*')
      .where('user_id', email)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async getInterviewResultById(id: string, email: string): Promise<InterviewResult | null> {
    const result = await this.db('interview_results')
      .select('*')
      .where('id', id)
      .where('user_id', email)
      .first();

    return result || null;
  }

  async updateInterviewResult(id: string, email: string, updates: Partial<CreateInterviewResultRequest>): Promise<InterviewResult | null> {
    const updateData: any = { updated_at: new Date() };
    
    if (updates.transcription !== undefined) {
      updateData.transcription = updates.transcription;
    }
    if (updates.summary !== undefined) {
      updateData.summary = updates.summary;
    }

    const [result] = await this.db('interview_results')
      .where('id', id)
      .where('user_id', email)
      .update(updateData)
      .returning('*');

    return result || null;
  }

  async deleteInterviewResult(id: string, email: string): Promise<boolean> {
    const result = await this.db('interview_results')
      .where('id', id)
      .where('user_id', email)
      .del();

    return result > 0;
  }
}
