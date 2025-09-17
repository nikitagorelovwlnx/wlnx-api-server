export interface WellnessSession {
  id: string;
  user_id: string;
  transcription: string;
  summary: string;
  analysis_results?: any;
  created_at: Date;
  updated_at: Date;
}

export interface CreateWellnessSessionRequest {
  transcription: string;
  summary: string;
  analysis_results?: any;
}

export interface UpdateWellnessSessionRequest extends Partial<CreateWellnessSessionRequest> {
  // Additional update-specific fields can be added here
}
