/**
 * Database Storage Service Wrapper (Phase 0 - AsyncStorage)
 * 
 * This is a wrapper that can be upgraded to SQLite later.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export type StorageType = 'asyncStorage' | 'sqlite'; // Add 'sqlite' when migrated

export class DatabaseStorage {
  private storageType: StorageType = 'asyncStorage';
  
  constructor() {
    console.log('DatabaseStorage initialized with:', this.storageType);
  }

  /**
   * Upgrade to SQLite (Phase 5)
   */
  async upgradeToSQLite(): Promise<void> {
    console.log('Upgrading from AsyncStorage to SQLite...');
    // Phase 5 implementation
    await AsyncStorage.setItem('databaseVersion', 'sqlite-1.0');
    this.storageType = 'sqlite';
  }

  /**
   * Get current storage type
   */
  getStorageType(): StorageType {
    return this.storageType;
  }

  /**
   * Reset database (clear all tables)
   */
  async reset(): Promise<void> {
    console.log('Resetting all data tables...');
    
    const keysToClear = [
      'data_projects_v1',
      'data_templates_v1', 
      'data_records_v1',
      'migration_complete',
      'databaseVersion'
    ];

    for (const key of keysToClear) {
      await AsyncStorage.setItem(key, this.storageType === 'asyncStorage' ? null : '');
    }
  }
}

export default DatabaseStorage;
