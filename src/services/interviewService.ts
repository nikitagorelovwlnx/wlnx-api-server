import { Knex } from 'knex';
import { InterviewResult, CreateInterviewResultRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class InterviewService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createInterviewResult(userId: string, data: CreateInterviewResultRequest): Promise<InterviewResult> {
    const [result] = await this.db('interview_results')
      .insert({
        id: uuidv4(),
        user_id: userId,
        title: data.title || null,
        content: data.content,
        metadata: data.metadata || {},
      })
      .returning('*');

    return result;
  }

  async getInterviewResultsByUserId(userId: string, limit = 50, offset = 0): Promise<InterviewResult[]> {
    return await this.db('interview_results')
      .select('*')
      .where('user_id', userId)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async getInterviewResultById(id: string, userId: string): Promise<InterviewResult | null> {
    const result = await this.db('interview_results')
      .select('*')
      .where('id', id)
      .where('user_id', userId)
      .first();

    return result || null;
  }

  async updateInterviewResult(id: string, userId: string, updates: Partial<CreateInterviewResultRequest>): Promise<InterviewResult | null> {
    const [result] = await this.db('interview_results')
      .where('id', id)
      .where('user_id', userId)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');

    return result || null;
  }

  async deleteInterviewResult(id: string, userId: string): Promise<boolean> {
    const result = await this.db('interview_results')
      .where('id', id)
      .where('user_id', userId)
      .del();

    return result > 0;
  }
}
