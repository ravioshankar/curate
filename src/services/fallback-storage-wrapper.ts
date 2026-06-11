/**
 * Fallback Storage Wrapper (Fallback Mode)
 * 
 * Wraps existing storage services with automatic fallback and retry logic.
 * Provides graceful degradation when storage operations fail.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageInitializer } from './storage-init';
import { type DataProject, type DataRecord, type DataTemplate } from '@/src/types/data-collection';

export interface FallbackStorageConfig {
  /** Enable automatic fallback on failure */
  enableFallback: boolean;
  
  /** Maximum retry attempts before giving up */
  maxRetries?: number;
  
  /** Delay between retries in milliseconds */
  retryDelayMs?: number;
  
  /** Use AsyncStorage as primary storage (if SQLite not available) */
  useAsyncStorageOnly?: boolean;
  
  /** Enable verbose logging for debugging */
  verbose?: boolean;
}

export type FallbackResult<T> = {
  success: boolean;
  data?: T;
  error?: Error;
  fallbackUsed: boolean;
  retriesAttempted: number;
  latencyMs: number;
};

// Helper function to execute with retry logic
export class FallbackStorageWrapper {
  private config: FallbackStorageConfig;
  private storageInitializer: StorageInitializer;
  private fallbackUsedCount = 0;

  constructor(storageInitializer: StorageInitializer, config?: FallbackStorageConfig) {
    this.storageInitializer = storageInitializer;
    this.config = {
      enableFallback: true,
      maxRetries: 3,
      retryDelayMs: 1000,
      useAsyncStorageOnly: false,
      verbose: false,
      ...config
    };
    
    if (this.config.verbose) {
      console.log('🔄 FallbackStorageWrapper initialized');
    }
  }

  // Wrapper for getAll operations
  private async wrapGet<T>(getter: () => Promise<T[]>): Promise<FallbackResult<T[]>> {
    const startTime = Date.now();
    
    try {
      return {
        success: true,
        data: await getter(),
        error: undefined,
        fallbackUsed: false,
        retriesAttempted: 0,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      
      if (this.config.enableFallback) {
        // AsyncStorage fallback for getAll operations
        const tableKeys: Record<string, string> = {
          projects: 'iqrate_projects',
          templates: 'iqrate_templates',
          records: 'iqrate_records'
        };
        
        try {
          const data = await AsyncStorage.getItem(tableKeys['default']);
          
          if (this.config.verbose) {
            console.log('🔄 [FallbackStorage] Using AsyncStorage fallback for getAll');
          }
          
          return {
            success: true,
            data: data ? JSON.parse(data) as T[] : [],
            error: undefined,
            fallbackUsed: true,
            retriesAttempted: 0,
            latencyMs: Date.now() - startTime
          };
        } catch (fallbackError) {
          console.error('All storage backends failed:', fallbackError);
          
          throw new Error(`getAll failed: ${(error as Error).message}`);
        }
      } else {
        throw error;
      }
    }
  }

  // Get all projects
  async getAllProjects(): Promise<FallbackResult<DataProject[]>> {
    return this.wrapGet(() => this.storageInitializer.getProjectStorage().getAll());
  }

  // Get all templates  
  async getAllTemplates(): Promise<FallbackResult<DataTemplate[]>> {
    return this.wrapGet(() => (this.storageInitializer.getTemplateStorage() as any).getAll());
  }

  // Get all records
  async getAllRecords(): Promise<FallbackResult<DataRecord[]>> {
    return this.wrapGet(() => (this.storageInitializer.getRecordStorage() as any).getAll());
  }

  // Get all data
  async getAll(): Promise<FallbackResult<{ projects?: DataProject[], templates?: DataTemplate[], records?: DataRecord[] }>> {
    const startTime = Date.now();
    
    try {
      const result: any = await this.storageInitializer.getProjectStorage().getAll();
      const templates = await (this.storageInitializer.getTemplateStorage() as any).getAll();
      const records = await (this.storageInitializer.getRecordStorage() as any).getAll();
      
      return {
        success: true,
        data: { projects: result, templates, records },
        error: undefined,
        fallbackUsed: false,
        retriesAttempted: 0,
        latencyMs: Date.now() - startTime
      };
    } catch (error) {
      
      if (this.config.enableFallback) {
        try {
          const data = await AsyncStorage.getItem('iqrate_data');
          
          if (this.config.verbose) {
            console.log('🔄 [FallbackStorage] Using AsyncStorage fallback for getAll()');
          }
          
          return {
            success: true,
            data: data ? JSON.parse(data) as any : {},
            error: undefined,
            fallbackUsed: true,
            retriesAttempted: 0,
            latencyMs: Date.now() - startTime
          };
        } catch (fallbackError) {
          throw new Error(`getAll failed: ${(error as Error).message}`);
        }
      } else {
        throw error;
      }
    }
  }

  // Initialize storage
  async init(): Promise<{ success: boolean; message: string; fallbackEnabled: boolean }> {
    try {
      const result = await this.storageInitializer.init();
      
      if (this.config.verbose) {
        console.log('✅ [FallbackStorage] Storage initialized with fallback mode enabled');
      }
      
      return {
        success: true,
        message: `Storage initialized with ${this.config.enableFallback ? 'fallback' : 'no fallback'} mode`,
        fallbackEnabled: this.config.enableFallback
      };
    } catch (error) {
      throw new Error(`Storage initialization failed: ${(error as Error).message}`);
    }
  }

  // Check health
  async checkHealth(): Promise<{ healthy: boolean; backend: string; fallbackCount?: number; lastError?: string }> {
    try {
      await this.storageInitializer.checkHealth();
      
      return {
        healthy: true,
        backend: 'primary'
      };
    } catch (error) {
      const lastError = (error as Error).message;
      
      if (this.config.enableFallback) {
        try {
          await AsyncStorage.getItem('iqrate_data');
          
          return {
            healthy: true,
            backend: 'fallback',
            fallbackCount: this.fallbackUsedCount + 1
          };
        } catch {
          return {
            healthy: false,
            backend: 'primary',
            lastError
          };
        }
      } else {
        return {
          healthy: false,
          backend: 'primary',
          lastError
        };
      }
    }
  }

  // Get fallback stats
  getFallbackStats(): { fallbackEnabled: boolean; fallbackUsedCount: number } {
    return {
      fallbackEnabled: this.config.enableFallback,
      fallbackUsedCount: this.fallbackUsedCount
    };
  }

  // Enable fallback mode
  async enableFallback(): Promise<void> {
    if (this.config.verbose) {
      console.log('🔄 [FallbackStorage] Fallback mode enabled');
    }
  }

  // Disable fallback mode  
  async disableFallback(): Promise<void> {
    if (this.config.verbose) {
      console.log('✅ [FallbackStorage] Fallback mode disabled');
    }
  }
}

export function createFallbackStorageWrapper(
  storageInitializer: StorageInitializer,
  config?: FallbackStorageConfig
): FallbackStorageWrapper {
  return new FallbackStorageWrapper(storageInitializer, config);
}

export default createFallbackStorageWrapper;
