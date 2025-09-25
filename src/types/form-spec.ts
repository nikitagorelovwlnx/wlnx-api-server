// FormSpec v2 - Types for form schema storage and API

export type FieldType = "string" | "number" | "boolean" | "date" | "array";

export interface FieldSpec {
  key: string;
  type: FieldType;
  required?: boolean;
  defaultValue?: any;
  
  // Validation constraints (for client-side validation)
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
    format?: string; // "date", "email", etc.
    maxItems?: number; // for arrays
  };
  
  // Enum values for select/radio fields
  enum?: string[];
  
  // UI hints for client rendering
  ui?: {
    label?: string;
    placeholder?: string;
    description?: string;
    group?: string; // Group fields together in UI
    priority?: number; // Display order within group
    widget?: string; // "textarea", "select", "radio", "checkbox", etc.
    icon?: string;
  };
}

export interface StageSpec {
  id: string;
  name: string;
  description?: string;
  targets: string[]; // Field keys to collect in this stage
  order: number;
}

export interface FormSpec {
  id: string;
  name: string;
  description?: string;
  version: string; // SemVer format
  locale: string;
  
  fields: FieldSpec[];
  stages: StageSpec[];
  
  // Metadata
  created_at?: Date;
  updated_at?: Date;
  created_by?: string;
}

// API Response types
export interface FormSchemaResponse {
  success: boolean;
  data?: FormSpec;
  error?: string;
}

export interface FormSchemasListResponse {
  success: boolean;
  data?: {
    schemas: FormSpec[];
    total: number;
  };
  error?: string;
}

// Database entity
export interface FormSchemaEntity {
  id: string;
  name: string;
  description?: string;
  version: string;
  locale: string;
  schema_data: any; // JSON with fields and stages
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  created_by?: string;
}
