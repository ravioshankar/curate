/**
 * Fallback Storage Service
 *
 * AsyncStorage is the current primary backend. This facade keeps the fallback
 * API available without pretending there is a second production backend yet.
 */

import { ProjectStorage } from './project-storage';
import { RecordStorage } from './record-storage';
import { TemplateStorage } from './template-storage';
import { type DataProject, type DataRecord, type DataTemplate } from '@/src/types/data-collection';

export type StorageType = 'asyncStorage' | 'sqlite';

export interface FallbackConfig {
  maxRetries?: number;
  retryDelayMs?: number;
  enableAsyncStorageFallback?: boolean;
  failoverTimeoutMs?: number;
  verboseLogging?: boolean;
  logFallbackEvents?: boolean;
}

export interface FallbackStorageResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  usedPrimaryStorage: boolean;
  fallbackUsed?: boolean;
  retryCount?: number;
}

export interface StorageHealth {
  type: 'primary' | 'fallback';
  healthy: boolean;
  lastError?: string;
  latencyMs?: number;
}

export interface DetailedStorageHealth {
  healthy: boolean;
  type: StorageType;
  tables: {
    projects: { count: number; healthy: boolean };
    templates: { count: number; healthy: boolean };
    records: { count: number; healthy: boolean };
  };
  fallbackActive: boolean;
}

type StorageOperation = 'getAll' | 'createProject' | 'updateProject' | 'deleteProject';

export class FallbackStorage {
  private readonly config: Required<Pick<FallbackConfig, 'enableAsyncStorageFallback' | 'maxRetries' | 'retryDelayMs' | 'verboseLogging'>>;
  private readonly projectStorage = new ProjectStorage();
  private readonly templateStorage = new TemplateStorage();
  private readonly recordStorage = new RecordStorage();
  private storageType: StorageType = 'asyncStorage';

  constructor(config?: FallbackConfig) {
    this.config = {
      enableAsyncStorageFallback: config?.enableAsyncStorageFallback ?? true,
      maxRetries: config?.maxRetries ?? 3,
      retryDelayMs: config?.retryDelayMs ?? 1000,
      verboseLogging: config?.verboseLogging ?? false,
    };
  }

  async execute(
    operation: StorageOperation,
    data?: Partial<DataProject> | { name: string; description?: string; templateIds?: string[] },
    id?: string
  ): Promise<FallbackStorageResult<unknown>> {
    try {
      const result = await this.executeOperation(operation, data, id);
      return {
        success: true,
        data: result,
        usedPrimaryStorage: true,
        fallbackUsed: false,
        retryCount: 0,
      };
    } catch (error) {
      if (this.config.verboseLogging) {
        console.warn('[FallbackStorage] Operation failed', operation, error);
      }

      return {
        success: false,
        error: error as Error,
        usedPrimaryStorage: false,
        fallbackUsed: this.config.enableAsyncStorageFallback,
        retryCount: this.config.maxRetries,
      };
    }
  }

  async getAll(): Promise<DataProject[]> {
    return this.projectStorage.getAll();
  }

  async createProject(name: string, description?: string, templateIds: string[] = []): Promise<DataProject> {
    return this.projectStorage.create(name, description, templateIds);
  }

  async updateProject(id: string, updates: Partial<DataProject>): Promise<void> {
    await this.projectStorage.update(id, updates);
  }

  async deleteProject(id: string): Promise<void> {
    await this.projectStorage.delete(id);
  }

  async getTemplates(): Promise<DataTemplate[]> {
    return this.templateStorage.getAll();
  }

  async getRecords(projectId?: string): Promise<DataRecord[]> {
    return this.recordStorage.getAll(projectId);
  }

  async checkHealth(): Promise<StorageHealth> {
    const startTime = Date.now();

    try {
      await this.projectStorage.getAll();
      return {
        type: 'primary',
        healthy: true,
        latencyMs: Date.now() - startTime,
      };
    } catch (error) {
      return {
        type: this.config.enableAsyncStorageFallback ? 'fallback' : 'primary',
        healthy: false,
        lastError: (error as Error).message,
        latencyMs: Date.now() - startTime,
      };
    }
  }

  async forceFallback(): Promise<void> {
    this.storageType = 'asyncStorage';
  }

  async forcePrimary(): Promise<void> {
    this.storageType = 'asyncStorage';
  }

  isInFallbackMode(): boolean {
    return this.storageType === 'asyncStorage' && this.config.enableAsyncStorageFallback;
  }

  async getStatus(): Promise<StorageHealth> {
    return this.checkHealth();
  }

  async resetFallbackState(): Promise<void> {
    this.storageType = 'asyncStorage';
  }

  async getDetailedHealth(): Promise<DetailedStorageHealth> {
    const [projects, templates, records] = await Promise.all([
      this.projectStorage.getAll(),
      this.templateStorage.getAll(),
      this.recordStorage.getAll(),
    ]);

    return {
      healthy: true,
      type: this.storageType,
      tables: {
        projects: { count: projects.length, healthy: true },
        templates: { count: templates.length, healthy: true },
        records: { count: records.length, healthy: true },
      },
      fallbackActive: this.config.enableAsyncStorageFallback,
    };
  }

  private async executeOperation(
    operation: StorageOperation,
    data?: Partial<DataProject> | { name: string; description?: string; templateIds?: string[] },
    id?: string
  ): Promise<unknown> {
    switch (operation) {
      case 'getAll':
        return this.getAll();
      case 'createProject': {
        const payload = data as { name: string; description?: string; templateIds?: string[] };
        return this.createProject(payload.name, payload.description, payload.templateIds);
      }
      case 'updateProject':
        if (!id) throw new Error('Project id is required for updateProject');
        return this.updateProject(id, data as Partial<DataProject>);
      case 'deleteProject':
        if (!id) throw new Error('Project id is required for deleteProject');
        return this.deleteProject(id);
      default:
        throw new Error(`Unsupported storage operation: ${operation}`);
    }
  }
}

export function createFallbackStorage(config?: FallbackConfig): FallbackStorage {
  return new FallbackStorage(config);
}

export default createFallbackStorage;
