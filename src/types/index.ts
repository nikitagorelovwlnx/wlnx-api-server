export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  created_at: Date;
  updated_at: Date;
}

export interface CalendarIntegration {
  id: string;
  user_id: string;
  provider: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: Date;
  calendar_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface TelegramIntegration {
  id: string;
  user_id: string;
  telegram_user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  chat_id?: number;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface InterviewResult {
  id: string;
  user_id: string;
  title?: string;
  content: string;
  metadata: Record<string, any>;
  created_at: Date;
  updated_at: Date;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface CreateCalendarIntegrationRequest {
  provider: string;
  access_token?: string;
  refresh_token?: string;
  token_expires_at?: string;
  calendar_id?: string;
}

export interface CreateTelegramIntegrationRequest {
  telegram_user_id: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  chat_id?: number;
}

export interface CreateInterviewResultRequest {
  title?: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}
