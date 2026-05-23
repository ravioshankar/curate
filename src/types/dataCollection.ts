export type FieldType =
  | 'text'
  | 'longText'
  | 'number'
  | 'currency'
  | 'date'
  | 'boolean'
  | 'select'
  | 'multiSelect'
  | 'rating'
  | 'photo'
  | 'location'
  | 'barcode';

export interface DataProject {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface DataTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  isBuiltIn?: boolean;
}

export interface TemplateField {
  id: string;
  label: string;
  key: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  display?: {
    showInList?: boolean;
    showInTable?: boolean;
    width?: number;
  };
}

export interface DataRecord {
  id: string;
  projectId: string;
  templateId: string;
  values: Record<string, unknown>;
  attachments?: DataAttachment[];
  metadata: RecordMetadata;
  status: 'draft' | 'submitted' | 'needs_review' | 'approved' | 'archived';
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export interface DataAttachment {
  id: string;
  recordId: string;
  fieldKey?: string;
  type: 'photo' | 'document' | 'receipt';
  uri: string;
  fileName?: string;
  mimeType?: string;
  createdAt: string;
}

export interface RecordMetadata {
  capturedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  deviceId?: string;
  appVersion?: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
  templateId: string;
}

export interface CreateRecordInput {
  projectId: string;
  templateId: string;
  values: Record<string, unknown>;
  status: DataRecord['status'];
}
