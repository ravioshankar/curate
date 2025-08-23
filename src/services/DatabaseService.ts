import { Platform } from 'react-native';
import { InventoryItem } from '../types/inventory';
import { AppSettings } from '../types/user';
import { webDBService } from './WebDBService';

class DatabaseService {
  private initialized = false;
  private isWeb = Platform.OS === 'web';
  private sqliteService: any = null;

  private async getSQLiteService() {
    if (!this.sqliteService) {
      try {
        const { sqliteService } = await import('./SQLiteService');
        this.sqliteService = sqliteService;
      } catch (error) {
        console.error('Failed to load SQLiteService:', error);
        throw error;
      }
    }
    return this.sqliteService;
  }

  async init(): Promise<void> {
    if (!this.initialized) {
      try {
        if (this.isWeb) {
          await webDBService.init();
        } else {
          const sqlite = await this.getSQLiteService();
          await sqlite.init();
        }
        this.initialized = true;
      } catch (error) {
        console.error('DatabaseService: init failed', error);
        this.initialized = false;
      }
    }
  }

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    await this.init();
    if (!this.initialized) {
      throw new Error('Database not initialized');
    }
    
    try {
      if (this.isWeb) {
        await webDBService.saveInventoryItem(item);
      } else {
        const sqlite = await this.getSQLiteService();
        await sqlite.saveInventoryItem(item);
      }
    } catch (error) {
      console.error('DatabaseService: saveInventoryItem failed', error);
      throw error;
    }
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    await this.init();
    if (!this.initialized) return [];
    
    try {
      if (this.isWeb) {
        return await webDBService.getInventoryItems();
      } else {
        const sqlite = await this.getSQLiteService();
        return await sqlite.getInventoryItems();
      }
    } catch (error) {
      console.error('DatabaseService: getInventoryItems failed', error);
      return [];
    }
  }

  async deleteInventoryItem(id: string): Promise<void> {
    await this.init();
    if (!this.initialized) return;
    
    try {
      if (this.isWeb) {
        await webDBService.deleteInventoryItem(id);
      } else {
        const sqlite = await this.getSQLiteService();
        await sqlite.deleteInventoryItem(id);
      }
    } catch (error) {
      console.error('DatabaseService: deleteInventoryItem failed', error);
    }
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await this.init();
    if (!this.initialized) return;
    
    try {
      if (this.isWeb) {
        await webDBService.saveSettings(settings);
      } else {
        const sqlite = await this.getSQLiteService();
        await sqlite.saveSettings(settings);
      }
    } catch (error) {
      console.error('DatabaseService: saveSettings failed', error);
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    await this.init();
    if (!this.initialized) return null;
    
    try {
      if (this.isWeb) {
        return await webDBService.getSettings();
      } else {
        const sqlite = await this.getSQLiteService();
        return await sqlite.getSettings();
      }
    } catch (error) {
      console.error('DatabaseService: getSettings failed', error);
      return null;
    }
  }

  async saveProfile(profile: { name?: string; email?: string; avatar?: string }): Promise<void> {
    await this.init();
    if (!this.initialized) return;
    
    try {
      if (this.isWeb) {
        await webDBService.saveProfile(profile);
      } else {
        const sqlite = await this.getSQLiteService();
        await sqlite.saveProfile(profile);
      }
    } catch (error) {
      console.error('DatabaseService: saveProfile failed', error);
    }
  }

  async getProfile(): Promise<{ name?: string; email?: string; avatar?: string } | null> {
    await this.init();
    if (!this.initialized) return null;
    
    try {
      if (this.isWeb) {
        return await webDBService.getProfile();
      } else {
        const sqlite = await this.getSQLiteService();
        return await sqlite.getProfile();
      }
    } catch (error) {
      console.error('DatabaseService: getProfile failed', error);
      return null;
    }
  }

  async getCategories(): Promise<string[]> {
    await this.init();
    if (!this.initialized) return [];
    
    try {
      if (this.isWeb) {
        return await webDBService.getCategories();
      } else {
        const sqlite = await this.getSQLiteService();
        return await sqlite.getCategories();
      }
    } catch (error) {
      console.error('DatabaseService: getCategories failed', error);
      return [];
    }
  }

  async addCategory(categoryName: string): Promise<void> {
    await this.init();
    if (!this.initialized) return;
    
    try {
      if (this.isWeb) {
        await webDBService.addCategory(categoryName);
      } else {
        const sqlite = await this.getSQLiteService();
        await sqlite.addCategory(categoryName);
      }
    } catch (error) {
      console.error('DatabaseService: addCategory failed', error);
    }
  }

  async deleteCategory(categoryName: string): Promise<void> {
    await this.init();
    if (!this.initialized) return;
    
    try {
      if (this.isWeb) {
        await webDBService.deleteCategory(categoryName);
      } else {
        const sqlite = await this.getSQLiteService();
        await sqlite.deleteCategory(categoryName);
      }
    } catch (error) {
      console.error('DatabaseService: deleteCategory failed', error);
      throw error;
    }
  }

  async getUserCategories(): Promise<string[]> {
    await this.init();
    if (!this.initialized) return [];
    
    try {
      if (this.isWeb) {
        return await webDBService.getUserCategories();
      } else {
        const sqlite = await this.getSQLiteService();
        return await sqlite.getUserCategories();
      }
    } catch (error) {
      console.error('DatabaseService: getUserCategories failed', error);
      return [];
    }
  }

  async isCategoryDeletable(categoryName: string): Promise<boolean> {
    await this.init();
    if (!this.initialized) return false;
    
    try {
      if (this.isWeb) {
        return await webDBService.isCategoryDeletable(categoryName);
      } else {
        const sqlite = await this.getSQLiteService();
        return await sqlite.isCategoryDeletable(categoryName);
      }
    } catch (error) {
      console.error('DatabaseService: isCategoryDeletable failed', error);
      return false;
    }
  }
}

export const databaseService = new DatabaseService();