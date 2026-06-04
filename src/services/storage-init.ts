/**
 * Storage Initialization Service (Phase 0-1)
 * 
 * Initializes all storage services and creates default templates if missing.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { ProjectStorage } from './project-storage';
import { TemplateStorage } from './template-storage';
import { RecordStorage } from './record-storage';
import { MigrationService } from './migration';

export class StorageInitializer {
  private projectStorage: ProjectStorage;
  private templateStorage: TemplateStorage;
  private recordStorage: RecordStorage;
  private migrationService: MigrationService;

  constructor() {
    this.projectStorage = new ProjectStorage();
    this.templateStorage = new TemplateStorage();
    this.recordStorage = new RecordStorage();
    this.migrationService = new MigrationService();
  }

  /**
   * Initialize all storage and create default templates if missing
   */
  async init(): Promise<InitializationResult> {
    console.log('Initializing iQRate storage layer...');

    try {
      // Check if already initialized
      const isInitialized = await this.checkInitialized();
      
      if (isInitialized) {
        console.log('Storage already initialized');
        return {
          success: true,
          message: 'Storage already initialized',
          defaultTemplatesCreated: 0,
          recordsMigrated: 0
        };
      }

      // Create built-in templates if not exist
      await this.createDefaultBuiltInTemplates();

      // Check migration status
      const needsMigration = await this.checkMigrationNeeded();
      
      let recordsMigrated = 0;
      if (needsMigration) {
        const migrationResult = await this.migrateIfNeeded();
        recordsMigrated = migrationResult.itemsMigrated || 0;
      }

      // Mark as initialized
      await AsyncStorage.setItem('storage_initialized', 'true');
      await AsyncStorage.setItem('storageVersion', 'v1.0');

      return {
        success: true,
        message: 'Storage initialized successfully',
        defaultTemplatesCreated: this.countTemplates(),
        recordsMigrated
      };

    } catch (error) {
      console.error('Initialization failed:', error);
      throw new Error(`Storage initialization failed: ${(error as Error).message}`);
    }
  }

  /**
   * Check if storage is already initialized
   */
  private async checkInitialized(): Promise<boolean> {
    try {
      return await AsyncStorage.getItem('storage_initialized') === 'true';
    } catch (error) {
      console.error('Error checking initialization:', error);
      return false;
    }
  }

  /**
   * Create default built-in templates if they don't exist
   */
  private async createDefaultBuiltInTemplates(): Promise<void> {
    const builtInCategories = [
      'inventory',
      'inspection', 
      'audit',
      'maintenance',
      'research'
    ];

    for (const category of builtInCategories) {
      try {
        // Check if template exists for this category
        const allTemplates = await this.templateStorage.getAll();
        
        let templateExists = false;
        for (const template of allTemplates) {
          if (template.isBuiltIn && template.category === category) {
            templateExists = true;
            break;
          }
        }

        if (!templateExists) {
          const templateNames: Record<string, string> = {
            'inventory': 'Inventory Item',
            'inspection': 'Inspection Checklist',
            'audit': 'Asset Audit',
            'maintenance': 'Maintenance Log',
            'research': 'Research Observation'
          };

          console.log(`Creating default template: ${templateNames[category]}`);
          await this.templateStorage.createBuiltInTemplate(
            templateNames[category],
            `Default ${templateNames[category]} template`,
            category
          );
        }
      } catch (error) {
        console.error(`Error creating template for category ${category}:`, error);
      }
    }
  }

  /**
   * Check if migration is needed
   */
  private async checkMigrationNeeded(): Promise<boolean> {
    try {
      // Check if old inventory data exists
      const json = await AsyncStorage.getItem('collection_items_v1');
      
      if (!json) return false;

      const items: any[] = JSON.parse(json);
      
      // Check if new inventory project doesn't exist yet
      const allProjects = await this.projectStorage.getAll();
      const hasNewInventoryProject = allProjects.some(
        (p: any) => p.name === 'My Inventory' && p.templateIds?.includes('tmpl_inventory_default')
      );

      // Migrate only if old data exists AND new project doesn't exist
      return items.length > 0 && !hasNewInventoryProject;
    } catch (error) {
      console.error('Error checking migration needs:', error);
      return false;
    }
  }

  /**
   * Migrate legacy data if needed
   */
  private async migrateIfNeeded(): Promise<{ itemsMigrated?: number; itemsFailed?: number }> {
    try {
      const isMigrated = await AsyncStorage.getItem('migration_complete');
      
      if (isMigrated === 'true') {
        console.log('Migration already completed');
        return { itemsMigrated: 0, itemsFailed: 0 };
      }

      // Preview migration first
      const preview = await this.migrationService.previewMigration();
      
      if ((preview as any).itemsCount === 0) {
        console.log('No items to migrate');
        return { itemsMigrated: 0, itemsFailed: 0 };
      }

      // Log preview info
      console.log(`Found ${preview.itemsCount} items to migrate`);
      
      const result = await this.migrationService.migrate();
      
      if (result.itemsMigrated > 0) {
        console.log(`Successfully migrated ${result.itemsMigrated} items`);
        console.log(`Failed migrations: ${result.itemsFailed || 0}`);
        
        // Show preview of new projects
        const newProjects = await this.projectStorage.getAll();
        console.log('New projects created:', newProjects.map((p: any) => p.name));
      }

      return { itemsMigrated: result.itemsMigrated, itemsFailed: result.itemsFailed };
    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Count existing templates
   */
  private countTemplates(): number {
    try {
      return this.templateStorage.getAll().then(templates => templates.length);
    } catch (error) {
      console.error('Error counting templates:', error);
      return 0;
    }
  }

  /**
   * Get all built-in template IDs
   */
  async getBuiltInTemplateIds(): Promise<string[]> {
    try {
      const templates = await this.templateStorage.getBuiltIn();
      return templates.map((t: any) => t.id);
    } catch (error) {
      console.error('Error getting built-in template IDs:', error);
      return [];
    }
  }

  /**
   * Check storage health
   */
  async checkHealth(): Promise<HealthCheckResult> {
    try {
      const projectsCount = await this.projectStorage.getAll().then(p => p.length);
      const templatesCount = await this.templateStorage.getAll().then(t => t.length);
      const recordsCount = await this.recordStorage.getAll().then(r => r.length);
      
      return {
        healthy: true,
        storageType: 'asyncStorage',
        tables: {
          projects: projects.length,
          templates: templates.length,
          records: records.length
        },
        migrationComplete: await AsyncStorage.getItem('migration_complete') === 'true',
        version: await AsyncStorage.getItem('storageVersion') || 'v1.0'
      };
    } catch (error) {
      console.error('Health check failed:', error);
      return {
        healthy: false,
        error: (error as Error).message
      };
    }
  }

  // ============================================================================
  // Getters for convenience
  // ============================================================================

  getProjectStorage(): ProjectStorage {
    return this.projectStorage;
  }

  getTemplateStorage(): TemplateStorage {
    return this.templateStorage;
  }

  getRecordStorage(): RecordStorage {
    return this.recordStorage;
  }

  getMigrationService(): MigrationService {
    return this.migrationService;
  }
}

/**
 * Result of storage initialization
 */
export interface InitializationResult {
  success: boolean;
  message: string;
  defaultTemplatesCreated: number;
  recordsMigrated: number;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
  healthy: boolean;
  error?: string;
  storageType?: 'asyncStorage' | 'sqlite';
  tables?: {
    projects: number;
    templates: number;
    records: number;
  };
  migrationComplete: boolean;
  version: string;
}

export default StorageInitializer;
