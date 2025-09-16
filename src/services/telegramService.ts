import { Knex } from 'knex';
import { TelegramIntegration, CreateTelegramIntegrationRequest } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TelegramService {
  private db: Knex;

  constructor(db: Knex) {
    this.db = db;
  }

  async createIntegration(userId: string, data: CreateTelegramIntegrationRequest): Promise<TelegramIntegration> {
    const [integration] = await this.db('telegram_integrations')
      .insert({
        id: uuidv4(),
        user_id: userId,
        telegram_user_id: data.telegram_user_id,
        username: data.username || null,
        first_name: data.first_name || null,
        last_name: data.last_name || null,
        chat_id: data.chat_id || null,
      })
      .returning('*');

    return integration;
  }

  async getIntegrationsByUserId(userId: string): Promise<TelegramIntegration[]> {
    return await this.db('telegram_integrations')
      .select('*')
      .where('user_id', userId)
      .where('is_active', true)
      .orderBy('created_at', 'desc');
  }

  async getIntegrationByTelegramUserId(telegramUserId: number): Promise<TelegramIntegration | null> {
    const integration = await this.db('telegram_integrations')
      .select('*')
      .where('telegram_user_id', telegramUserId)
      .where('is_active', true)
      .first();

    return integration || null;
  }

  async updateIntegration(id: string, userId: string, updates: Partial<CreateTelegramIntegrationRequest>): Promise<TelegramIntegration | null> {
    const [integration] = await this.db('telegram_integrations')
      .where('id', id)
      .where('user_id', userId)
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .returning('*');

    return integration || null;
  }

  async deleteIntegration(id: string, userId: string): Promise<boolean> {
    const result = await this.db('telegram_integrations')
      .where('id', id)
      .where('user_id', userId)
      .update({
        is_active: false,
        updated_at: new Date(),
      });

    return result > 0;
  }
}
