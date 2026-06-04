/**
 * iQRate Data Collection Platform - Core Type Definitions
 * 
 * These types define the new data model for generic data collection,
 * extending beyond simple inventory tracking.
 */

// ============================================================================
// Field Types
// ============================================================================

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

// ============================================================================
// Field Settings & Display
// ============================================================================

export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  minLength?: number;
  maxLength?: number;
}

export interface FieldDisplaySettings {
  showInList?: boolean;    // Show in record list view
  showInTable?: boolean;   // Show in table view  
  width?: number;          // Column width (percentage or auto)
}

// ============================================================================
// Template Field Definition
// ============================================================================

export interface TemplateField {
  id: string;              // Unique field identifier within template
  label: string;           // Display name for the field
  key: string;             // Programmatic key for values access
  type: FieldType;        // Field type definition
  required?: boolean;      // Is this a required field?
  placeholder?: string;    // Placeholder text when empty
  helpText?: string;       // Helper text explaining the field
  defaultValue?: unknown;  // Default value (or function returning default)
  options?: string[];     // For select/multiSelect: available options
  validation?: FieldValidation;  // Validation rules
  display?: FieldDisplaySettings;  // Display customization
}

// ============================================================================
// Template Definition
// ============================================================================

export type TemplateCategory = 
  | 'inventory' 
  | 'inspection' 
  | 'audit' 
  | 'maintenance' 
  | 'research'
  | 'custom';

export interface DataTemplate {
  id: string;                              // Unique template identifier
  name: string;                            // Display name
  description?: string;                    // Description of purpose
  version: number;                         // Version number for migrations
  fields: TemplateField[];                 // Array of field definitions
  createdAt: string;                       // ISO timestamp
  updatedAt: string;                       // ISO timestamp
  
  // Metadata flags
  isBuiltIn?: boolean;                     // Is this a pre-built template?
  category?: TemplateCategory;             // Template category
}

// ============================================================================
// Project Definition
// ============================================================================

export type ProjectStatus = 'active' | 'archived';

export interface ProjectSettings {
  defaultRecordStatus: 'draft' | 'submitted';   // Default new record status
  showAttachmentsInGallery?: boolean;           // Show attachments in gallery view
  autoSubmitOnComplete?: boolean;               // Auto-submit on field completion
  requireLocation?: boolean;                    // Require GPS for all records
  maxRecords?: number;                          // Maximum records (if applicable)
}

export interface DataProject {
  id: string;                                // Unique project identifier
  name: string;                              // Display name
  description?: string;                      // Project description
  templateIds: string[];                     // IDs of templates this project uses
  createdAt: string;                         // ISO timestamp
  updatedAt: string;                         // ISO timestamp
  
  // State & metadata
  status: ProjectStatus;
  
  // Optional settings (stored as object or JSON serialized)
  settings?: ProjectSettings;
}

// ============================================================================
// Attachment Definition
// ============================================================================

export type AttachmentType = 'photo' | 'document' | 'receipt' | 'audio' | 'video';

export interface DataAttachment {
  id: string;                                // Unique attachment identifier
  recordId: string;                          // Parent record ID
  fieldKey?: string | null;                 // Field this belongs to (null = general)
  type: AttachmentType;                      // Attachment type
  uri: string;                               // File URI/path
  fileName?: string;                         // Original file name
  mimeType?: string;                         // MIME type (e.g., 'image/jpeg')
  createdAt: string;                         // Capture timestamp
}

// ============================================================================
// Record Metadata & Geolocation
// ============================================================================

export interface GeoLocation {
  latitude: number;          // Latitude coordinate
  longitude: number;         // Longitude coordinate
  accuracy?: number;        // GPS accuracy in meters
  altitude?: number;        // Altitude in meters (if available)
}

export interface RecordMetadata {
  capturedAt?: string;          // Capture timestamp
  location?: GeoLocation;       // Location data if captured
  deviceId?: string;            // Device identifier
  appVersion?: string;          // App version at capture time
  userAgent?: string;           // User agent string
}

// ============================================================================
// Record Status & Review Workflow
// ============================================================================

export type RecordStatus = 
  | 'draft'                // Incomplete draft
  | 'submitted'            // Ready for review
  | 'needs_review'         // Requires reviewer attention
  | 'approved'             // Approved by reviewer
  | 'rejected';            // Rejected with feedback

export interface DataRecord {
  id: string;                              // Unique record identifier
  projectId: string;                       // Parent project ID
  templateId: string;                      // Template used for this record
  
  // Core data
  values: Record<string, unknown>;         // Field key-value pairs
  attachments?: DataAttachment[];          // Associated files/media
  
  // Status & metadata
  metadata: RecordMetadata;
  status: RecordStatus;                    // Current record state
  
  // Timestamps
  createdAt: string;                       // Record creation time
  updatedAt: string;                       // Last modification time
  submittedAt?: string;                    // When submitted for review
  
  // Review workflow (if applicable)
  reviewerId?: string;                     // Who reviewed this
  reviewerComment?: string;                // Reviewer feedback
  reviewDate?: string;                     // When reviewed
}

// ============================================================================
// Export/Import Formats
// ============================================================================

export type ExportFormat = 'csv' | 'json' | 'pdf';

export interface ExportOptions {
  format: ExportFormat;
  includeAttachments?: boolean;            // Include attachment paths in JSON
  includeMetadata?: boolean;               // Include metadata fields
  filters?: Record<string, unknown>;       // Filter which records to export
}

// ============================================================================
// API/Remote Data Models (for future cloud sync)
// ============================================================================

export interface RemoteProject {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
  createdAt: string;
  updatedAt: string;
  status: ProjectStatus;
  ownerId: string;
  isSynced: boolean;
}

export interface RemoteTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  isSynced: boolean;
}

export interface RemoteRecord {
  id: string;
  projectId: string;
  templateId: string;
  values: Record<string, unknown>;
  attachments?: DataAttachment[];
  metadata: RecordMetadata;
  status: RecordStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
  reviewerId?: string;
  reviewerComment?: string;
  reviewDate?: string;
  ownerId: string;
  isSynced: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Generate a unique ID for entities
 */
export function generateEntityId(prefix = ''): string {
  const timestamp = Date.now().toString(36).substring(2);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix || ''}${timestamp}_${random}`;
}

/**
 * Get display label for field type
 */
export function getFieldLabel(type: FieldType): string {
  const labels: Record<FieldType, string> = {
    text: 'Text',
    longText: 'Long Text',
    number: 'Number',
    currency: 'Currency',
    date: 'Date',
    boolean: 'Boolean',
    select: 'Dropdown',
    multiSelect: 'Multi-select',
    rating: 'Rating',
    photo: 'Photo',
    location: 'Location',
    barcode: 'Barcode/QR',
  };
  return labels[type] || type;
}

/**
 * Get color coding for field types
 */
export function getFieldColor(type: FieldType): string {
  const colors: Record<FieldType, string> = {
    text: '#6C757D',           // Gray
    longText: '#495057',        // Dark Gray
    number: '#007BFF',          // Blue
    currency: '#28A745',        // Green
    date: '#6F42C1',            // Purple
    boolean: '#FD7E14',         // Orange
    select: '#17A2B8',          // Teal
    multiSelect: '#DC3545',     // Red
    rating: '#FFC107',          // Amber
    photo: '#DD6B20',           // Burnt Orange
    location: '#20C997',        // Emerald
    barcode: '#343A40',         // Dark
  };
  return colors[type] || '#6C757D';
}
