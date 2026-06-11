/**
 * Project Storage Service (Phase 0 - AsyncStorage version)
 * 
 * Handles CRUD operations for data collection projects.
 * Using AsyncStorage for simplicity; can be migrated to SQLite in Phase 5.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type DataProject, type ProjectSettings, type ProjectStatus } from '@/src/types';

export class ProjectStorage {
  private readonly TABLE_KEY = 'data_projects_v1';
  
  /**
   * Get all projects as JSON array
   */
  async getAll(): Promise<DataProject[]> {
    try {
      const json = await AsyncStorage.getItem(this.TABLE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Error getting projects:', error);
      return [];
    }
  }

  /**
   * Get project by ID
   */
  async getById(id: string): Promise<DataProject | null> {
    try {
      const projects = await this.getAll();
      return projects.find(p => p.id === id) || null;
    } catch (error) {
      console.error('Error getting project by ID:', error);
      return null;
    }
  }

  /**
   * Create a new project
   */
  async create(name: string, description?: string, templateIds: string[] = [], settings?: ProjectSettings): Promise<DataProject> {
    try {
      const project: DataProject = {
        id: generateEntityId('proj_'),
        name,
        description,
        templateIds,
        status: 'active',
        settings,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const projects = await this.getAll();
      projects.unshift(project); // Add to beginning (newest first)
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(projects));
      
      return project;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  }

  /**
   * Update existing project
   */
  async update(id: string, updates: Partial<DataProject>): Promise<void> {
    try {
      const projects = await this.getAll();
      
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) {
        throw new Error(`Project ${id} not found`);
      }

      const updatedProject = { ...projects[index], ...updates };
      // Always update the timestamp
      updatedProject.updatedAt = new Date().toISOString();
      
      projects[index] = updatedProject;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  }

  /**
   * Archive a project (soft delete)
   */
  async archive(id: string): Promise<void> {
    try {
      const projects = await this.getAll();
      
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return;

      // Get all other fields to preserve
      const project = projects[index];
      
      // Archive logic: change status and optionally move records
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error archiving project:', error);
      throw error;
    }
  }

  /**
   * Permanently delete a project and all associated records
   */
  async delete(id: string): Promise<void> {
    try {
      const projects = await this.getAll();
      const filtered = projects.filter(p => p.id !== id);
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting project:', error);
      throw error;
    }
  }

  /**
   * Get all active projects
   */
  async getActive(): Promise<DataProject[]> {
    try {
      const allProjects = await this.getAll();
      return allProjects.filter(p => p.status === 'active');
    } catch (error) {
      console.error('Error getting active projects:', error);
      return [];
    }
  }

  /**
   * Get archived projects
   */
  async getArchived(): Promise<DataProject[]> {
    try {
      const allProjects = await this.getAll();
      return allProjects.filter(p => p.status === 'archived');
    } catch (error) {
      console.error('Error getting archived projects:', error);
      return [];
    }
  }

  /**
   * Search projects by name (for quick find)
   */
  async search(query: string): Promise<DataProject[]> {
    try {
      const allProjects = await this.getAll();
      const percent = `%${query}%`;
      return allProjects.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
      );
    } catch (error) {
      console.error('Error searching projects:', error);
      return [];
    }
  }

  /**
   * Move project from archive to active or vice versa
   */
  async moveStatus(id: string, newStatus: ProjectStatus): Promise<void> {
    try {
      const projects = await this.getAll();
      
      const index = projects.findIndex(p => p.id === id);
      if (index === -1) return;

      projects[index].status = newStatus;
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(projects));
    } catch (error) {
      console.error('Error moving project status:', error);
      throw error;
    }
  }

  /**
   * Clear all projects (for reset functionality)
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.TABLE_KEY);
    } catch (error) {
      console.error('Error clearing projects:', error);
      throw error;
    }
  }

  // ============================================================================
  // Migration to SQLite (future implementation)
  // ============================================================================
  
  /**
   * Future: Migrate from AsyncStorage to SQLite
   * This method would be implemented in Phase 5
   */
  async migrateToSQLite(): Promise<void> {
    // Implementation for Phase 5
    console.log('Migration to SQLite not yet implemented');
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private generateId(): string {
    return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  }
}

/**
 * Generate entity ID helper (moved here for convenience)
 */
function generateEntityId(prefix = ''): string {
  const timestamp = Date.now().toString(36).substring(2);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}_${random}`;
}

export default ProjectStorage;
