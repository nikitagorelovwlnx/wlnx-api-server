import { Knex } from 'knex';
import { WellnessSession, CreateWellnessSessionRequest } from '../types.js';
import { v4 as uuidv4 } from 'uuid';

export class WellnessSessionService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createWellnessSession(email: string, data: CreateWellnessSessionRequest): Promise<WellnessSession> {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Properly serialize wellness_data for PostgreSQL JSONB
    let serializedWellnessData = null;
    if (data.wellness_data !== undefined && data.wellness_data !== null) {
      // Always stringify to ensure valid JSON for PostgreSQL JSONB
      serializedWellnessData = JSON.stringify(data.wellness_data);
    }
    
    const sessionData = {
      id,
      user_id: email,
      transcription: data.transcription,
      summary: data.summary,
      wellness_data: serializedWellnessData,
      created_at: now,
      updated_at: now,
    };

    await this.db('wellness_sessions').insert(sessionData);
    
    // Return the created session with parsed JSON
    const result = await this.db('wellness_sessions')
      .select('*')
      .where('id', id)
      .first();

    // Parse wellness_data back to object if it's a string
    if (result && result.wellness_data && typeof result.wellness_data === 'string') {
      try {
        result.wellness_data = JSON.parse(result.wellness_data);
      } catch (error) {
        // If parsing fails, keep as string
        console.warn('Failed to parse wellness_data:', error);
      }
    }

    return result;
  }

  async getWellnessSessionsByUserId(email: string, limit = 50, offset = 0): Promise<WellnessSession[]> {
    const results = await this.db('wellness_sessions')
      .select('*')
      .where('user_id', email)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Parse wellness_data for each result
    return results.map(result => {
      if (result.wellness_data && typeof result.wellness_data === 'string') {
        try {
          result.wellness_data = JSON.parse(result.wellness_data);
        } catch (error) {
          console.warn('Failed to parse wellness_data:', error);
        }
      }
      return result;
    });
  }

  async getAllWellnessSessions(limit = 50, offset = 0): Promise<WellnessSession[]> {
    const results = await this.db('wellness_sessions')
      .select('*')
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset(offset);

    // Parse wellness_data for each result
    return results.map(result => {
      if (result.wellness_data && typeof result.wellness_data === 'string') {
        try {
          result.wellness_data = JSON.parse(result.wellness_data);
        } catch (error) {
          console.warn('Failed to parse wellness_data:', error);
        }
      }
      return result;
    });
  }

  async getWellnessSessionById(id: string, email: string): Promise<WellnessSession | null> {
    const result = await this.db('wellness_sessions')
      .select('*')
      .where('id', id)
      .where('user_id', email)
      .first();

    if (!result) return null;

    // Parse wellness_data back to object
    if (result.wellness_data && typeof result.wellness_data === 'string') {
      try {
        result.wellness_data = JSON.parse(result.wellness_data);
      } catch (error) {
        console.warn('Failed to parse wellness_data:', error);
      }
    }

    return result;
  }

  async updateWellnessSession(id: string, email: string, updates: Partial<CreateWellnessSessionRequest>): Promise<WellnessSession | null> {
    const updateData: any = { updated_at: new Date().toISOString() };
    
    if (updates.transcription !== undefined) {
      updateData.transcription = updates.transcription;
    }
    if (updates.summary !== undefined) {
      updateData.summary = updates.summary;
    }
    if (updates.wellness_data !== undefined) {
      // Serialize wellness_data for PostgreSQL JSONB
      if (updates.wellness_data === null) {
        updateData.wellness_data = null;
      } else {
        // Always stringify to ensure valid JSON for PostgreSQL JSONB
        updateData.wellness_data = JSON.stringify(updates.wellness_data);
      }
    }

    const updatedRows = await this.db('wellness_sessions')
      .where('id', id)
      .where('user_id', email)
      .update(updateData);

    if (updatedRows === 0) {
      return null;
    }

    // Return the updated session with parsed JSON
    const result = await this.db('wellness_sessions')
      .select('*')
      .where('id', id)
      .where('user_id', email)
      .first();

    if (!result) return null;

    // Parse wellness_data back to object
    if (result.wellness_data && typeof result.wellness_data === 'string') {
      try {
        result.wellness_data = JSON.parse(result.wellness_data);
      } catch (error) {
        console.warn('Failed to parse wellness_data:', error);
      }
    }

    return result;
  }

  async deleteWellnessSession(id: string, email: string): Promise<boolean> {
    const result = await this.db('wellness_sessions')
      .where('id', id)
      .where('user_id', email)
      .del();

    return result > 0;
  }
}
