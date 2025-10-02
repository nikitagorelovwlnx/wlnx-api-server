export interface WellnessSession {
  id: string;
  user_id: string;
  transcription: string;
  summary: string;
  bot_conversation?: string; // Full bot conversation transcript
  analysis_results?: any;
  wellness_data?: any; // JSON data with wellness parameters collected during the session
  created_at: Date;
  updated_at: Date;
}

export interface CreateWellnessSessionRequest {
  transcription: string;
  summary: string;
  bot_conversation?: string; // Full bot conversation transcript
  analysis_results?: any;
  wellness_data?: any; // JSON data with wellness parameters
}

export interface UpdateWellnessSessionRequest extends Partial<CreateWellnessSessionRequest> {
  // Additional update-specific fields can be added here
}

export interface Coach {
  id: string;
  name: string;
  description?: string;
  coach_prompt_content: string;
  is_active: boolean;
  tags?: string[];
  created_at: Date;
  updated_at: Date;
}

export interface UpdateCoachRequest {
  coach_prompt_content: string;
}
