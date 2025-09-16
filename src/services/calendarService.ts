import { Knex } from 'knex';
import { CalendarIntegration, CreateCalendarIntegrationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class CalendarService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createIntegration(userId: string, data: CreateCalendarIntegrationRequest): Promise<CalendarIntegration> {
    const [integration] = await this.db('calendar_integrations')
      .insert({
        id: uuidv4(),
        user_id: userId,
        provider: data.provider,
        access_token: data.access_token || null,
        refresh_token: data.refresh_token || null,
        token_expires_at: data.token_expires_at ? new Date(data.token_expires_at) : null,
        calendar_id: data.calendar_id || null,
      })
      .returning('*');

    return integration;
  }

  async getIntegrationsByUserId(userId: string): Promise<CalendarIntegration[]> {
    return await this.db('calendar_integrations')
      .select('*')
      .where('user_id', userId)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
  }

  async updateIntegration(id: string, userId: string, updates: Partial<CreateCalendarIntegrationRequest>): Promise<CalendarIntegration | null> {
    const [integration] = await this.db('calendar_integrations')
      .where('id', id)
      .where('user_id', userId)
      .update({
        ...updates,
        token_expires_at: updates.token_expires_at ? new Date(updates.token_expires_at) : undefined,
        updated_at: new Date(),
      })
      .returning('*');

    return integration || null;
  }

  async deleteIntegration(id: string, userId: string): Promise<boolean> {
    const result = await this.db('calendar_integrations')
      .where('id', id)
      .where('user_id', userId)
      .update({
        is_active: false,
        updated_at: new Date(),
      });

    return result > 0;
  }
}
