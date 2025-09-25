// Prompt Management System Types

export interface PromptSpec {
  id: string;
  name: string;
  description?: string;
  stage_id: string; // Links to StageSpec.id (e.g., "S1_demographics")
  form_name: string; // Links to FormSpec.name (e.g., "wellness_intake")
  version: string; // SemVer format
  locale: string;
  
  // Prompt content
  content: {
    main_prompt: string; // Main conversation prompt
    follow_up_prompt?: string; // For clarifications
    validation_prompt?: string; // When validation fails
    completion_prompt?: string; // When stage is complete
  };
  
  // Prompt metadata
  metadata?: {
    tone?: string; // "friendly", "professional", "casual"
    style?: string; // "conversational", "formal", "medical"
    length?: "short" | "medium" | "long";
    difficulty?: "simple" | "intermediate" | "advanced";
  };
  
  // System fields
  is_active: boolean;
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

// Database entity
export interface PromptEntity {
  id: string;
  name: string;
  description?: string;
  stage_id: string;
  form_name: string;
  version: string;
  locale: string;
  prompt_data: any; // JSONB containing content and metadata
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}

// API Request/Response types
export interface CreatePromptRequest {
  name: string;
  description?: string;
  stage_id: string;
  form_name: string;
  version: string;
  locale: string;
  content: PromptSpec['content'];
  metadata?: PromptSpec['metadata'];
  created_by?: string;
}

export interface UpdatePromptRequest {
  name?: string;
  description?: string;
  content?: Partial<PromptSpec['content']>;
  metadata?: Partial<PromptSpec['metadata']>;
}

export interface PromptResponse {
  success: boolean;
  data?: PromptSpec;
  error?: string;
}

export interface PromptsListResponse {
  success: boolean;
  data?: {
    prompts: PromptSpec[];
    total: number;
  };
  error?: string;
}

// For bot integration - simplified response
export interface StagePromptResponse {
  success: boolean;
  data?: {
    stage_id: string;
    form_name: string;
    main_prompt: string;
    follow_up_prompt?: string;
    validation_prompt?: string;
    completion_prompt?: string;
    metadata?: PromptSpec['metadata'];
  };
  error?: string;
}

// Bulk prompts for entire form
export interface FormPromptsResponse {
  success: boolean;
  data?: {
    form_name: string;
    version: string;
    locale: string;
    stages: Array<{
      stage_id: string;
      stage_name: string;
      prompts: StagePromptResponse['data'];
    }>;
  };
  error?: string;
}
