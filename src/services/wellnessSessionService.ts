import { Knex } from 'knex';
import { WellnessSession, CreateWellnessSessionRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WellnessSessionService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createWellnessSession(email: string, data: CreateWellnessSessionRequest): Promise<WellnessSession> {
    const id = uuidv4();
    const now = new Date().toISOString();
    const sessionData = {
      id,
      user_id: email,
      transcription: data.transcription,
      summary: data.summary,
      created_at: now,
      updated_at: now,
    };

    await this.db('wellness_sessions').insert(sessionData);
    
    // Return the created session
    const result = await this.db('wellness_sessions')
      .select('*')
      .where('id', id)
      .first();

    return result;
  }

  async getWellnessSessionsByUserId(email: string, limit = 50, offset = 0): Promise<WellnessSession[]> {
    return await this.db('wellness_sessions')
      .select('*')
      .where('user_id', email)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async getAllWellnessSessions(limit = 50, offset = 0): Promise<WellnessSession[]> {
    return await this.db('wellness_sessions')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);
  }

  async getWellnessSessionById(id: string, email: string): Promise<WellnessSession | null> {
    const result = await this.db('wellness_sessions')
      .select('*')
      .where('id', id)
      .where('user_id', email)
      .first();

    return result || null;
  }

  async updateWellnessSession(id: string, email: string, updates: Partial<CreateWellnessSessionRequest>): Promise<WellnessSession | null> {
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (updates.transcription !== undefined) {
      updateData.transcription = updates.transcription;
    }
    if (updates.summary !== undefined) {
      updateData.summary = updates.summary;
    }

    const updatedRows = await this.db('wellness_sessions')
      .where('id', id)
      .where('user_id', email)
      .update(updateData);

    if (updatedRows === 0) {
      return null;
    }

    // Return the updated session
    const result = await this.db('wellness_sessions')
      .select('*')
      .where('id', id)
      .where('user_id', email)
      .first();

    return result || null;
  }

  async deleteWellnessSession(id: string, email: string): Promise<boolean> {
    const result = await this.db('wellness_sessions')
      .where('id', id)
      .where('user_id', email)
      .del();

    return result > 0;
  }
}
