/**
 * Data Collection Platform - Main Exports
 * 
 * Export all storage services for easy importing.
 */

export { ProjectStorage } from './project-storage';
export { TemplateStorage } from './template-storage';
export { RecordStorage } from './record-storage';
export { MigrationService } from './migration';
export { StorageInitializer, type InitializationResult, type HealthCheckResult } from './storage-init';
export { DatabaseStorage } from './database-storage';
