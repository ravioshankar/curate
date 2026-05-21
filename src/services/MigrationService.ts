/**
 * Valuation Tracking Migration Service
 * 
 * Runs on first app launch to migrate existing collection data
 * and enable price history tracking features
 */

import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DatabaseService } from '../services/DatabaseService';
import { StorageService } from '../services/StorageService';
import { collectionStoreActions } from '../store/collectionStore';
import { priceTrackingService } from '../services/PriceTrackingService';

const MIGRATION_STATUS_KEY = 'curate_migration_status';
const MIGRATION_COMPLETE_KEY = 'curate_valuation_tracking_enabled';

class MigrationService {
  private migrationComplete = false;

  /**
   * Run on app launch to enable valuation tracking
   */
  async runOnLaunch(): Promise<void> {
    console.log('MigrationService: Starting valuation tracking initialization...');
    
    try {
      // Check if already migrated
      const completeStatus = await AsyncStorage.getItem(MIGRATION_COMPLETE_KEY);
      if (completeStatus === 'true') {
        console.log('MigrationService: Valuation tracking already enabled');
        return;
      }

      // Step 1: Migrate existing storage service data to database
      await this.migrateStorageToDatabase();

      // Step 2: Enable price history for existing items
      await this.enablePriceHistory();

      // Step 3: Update settings
      await this.updateValuationSettings();

      // Mark as complete
      await AsyncStorage.setItem(MIGRATION_COMPLETE_KEY, 'true');

      console.log('MigrationService: Valuation tracking enabled successfully');
    } catch (error) {
      console.error('MigrationService: Initialization failed:', error);
      
      // Don't crash app on migration errors - it's optional
      Alert.alert(
        'Valuation Tracking',
        'Price history feature is unavailable. Some existing data may have been lost.',
        [{ text: 'OK' }]
      );
    }
  }

  /**
   * Migrate current collection items to new schema
   */
  private async migrateStorageToDatabase(): Promise<void> {
    try {
      // Get current inventory from storage
      const inventory = await StorageService.getInventory();
      
      if (inventory.length === 0) {
        console.log('MigrationService: No items found to migrate');
        return;
      }

      const database = new DatabaseService();
      
      for (const item of inventory) {
        try {
          // Save to database with migration notes
          await database.saveCollectionItem({
            ...item,
            notes: item.notes || `${item.name} (migrated from storage service)`,
          });

          console.log(`MigrationService: Migrated ${item.name} to database`);
        } catch (error) {
          // If database save fails, keep in AsyncStorage
          console.warn(
            `MigrationService: Failed to migrate ${item.name}:`, 
            error.message
          );
        }
      }

      // Clear storage after successful migration
      await StorageService.saveInventory([]);
      
    } catch (error) {
      console.error('MigrationService: Migration failed:', error);
    }
  }

  /**
   * Enable price history tracking for all existing items
   */
  private async enablePriceHistory(): Promise<void> {
    try {
      // Get migration status to track progress
      const currentStatus = await AsyncStorage.getItem(MIGRATION_STATUS_KEY) || '0';
      let completedCount = parseInt(currentStatus, 10);

      const database = new DatabaseService();
      const collection = await database.getCollectionItems();

      if (!collection || collection.length === 0) {
        console.log('MigrationService: No collection items to initialize');
        return;
      }

      for (const item of collection) {
        try {
          completedCount++;
          
          // Update AsyncStorage status
          await AsyncStorage.setItem(
            MIGRATION_STATUS_KEY, 
            completedCount.toString()
          );

          // Initialize price history if not exists
          const hasHistory = Array.isArray(item.priceHistory) && item.priceHistory.length > 0;
          
          if (!hasHistory) {
            // Create initial price record from existing data
            const initialPrice: any = {};
            
            if ('pricePaid' in item && item.pricePaid !== undefined) {
              initialPrice.value = item.pricePaid || 0;
              initialPrice.source = 'initial';
              initialPrice.notes = `Purchase price - ${item.name}`;
            }

            // If there's an expected value, track that too
            if ('priceExpected' in item && item.priceExpected !== undefined) {
              const existingInitial = initialPrice.value || 0;
              
              if (item.pricePaid === undefined || item.pricePaid === null) {
                // Only use expected price if no paid price
                initialPrice.value = item.priceExpected || 0;
                initialPrice.source = 'initial';
                initialPrice.notes = `Estimated value - ${item.name}`;
              } else if (existingInitial === 0) {
                // Add as additional record if no purchase price
                await database.saveCollectionItem({
                  ...item,
                  priceHistory: [
                    ...(item.priceHistory || []),
                    {
                      id: `price_${Date.now()}_expected`,
                      itemId: item.id,
                      itemName: item.name,
                      value: item.priceExpected || 0,
                      currency: 'USD',
                      recordedAt: new Date().toISOString(),
                      source: 'initial',
                      notes: `Expected/research value - ${item.name}`,
                    },
                  ],
                });
              }
            }

          }

        } catch (error) {
          console.error(
            `MigrationService: Failed to enable price history for ${item.name}:`, 
            error.message
          );
        }
      }

      console.log(`MigrationService: Enabled price history for ${collection.length} items`);

    } catch (error) {
      console.error('MigrationService: Enable price history failed:', error);
    }
  }

  /**
   * Update app settings with valuation preferences
   */
  private async updateValuationSettings(): Promise<void> {
    try {
      const database = new DatabaseService();
      const currentSettings = await database.getSettings() || null;

      // Merge with valuation-specific settings
      const defaultSettings: any = {};

      if (currentSettings) {
        Object.assign(defaultSettings, currentSettings);
      }

      defaultSettings.valuationTracking = {
        enabled: true,
        displayCurrency: 'USD', // Default to USD, can be changed in UI
      };

      await database.saveSettings(defaultSettings);
      console.log('MigrationService: Updated settings with valuation tracking');

    } catch (error) {
      console.error('MigrationService: Failed to update settings:', error);
    }
  }

  /**
   * Get current migration progress
   */
  async getMigrationProgress(): Promise<number> {
    try {
      const status = await AsyncStorage.getItem(MIGRATION_STATUS_KEY) || '0';
      return parseInt(status, 10);
    } catch (error) {
      console.error('MigrationService: Failed to get migration progress:', error);
      return 0;
    }
  }

  /**
   * Check if valuation tracking is enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const complete = await AsyncStorage.getItem(MIGRATION_COMPLETE_KEY);
      this.migrationComplete = complete === 'true';
      return this.migrationComplete || false;
    } catch (error) {
      console.error('MigrationService: Failed to check if enabled:', error);
      return false;
    }
  }

  /**
   * Run initial data population (for new installs)
   */
  async populateInitialData(): Promise<void> {
    try {
      const database = new DatabaseService();
      
      // Check if already populated
      const collection = await database.getCollectionItems();
      
      if (collection && collection.length > 0) {
        console.log('MigrationService: Collection already has data');
        return;
      }

      // Import mock data for demonstration
      const devData = await import('../data/mockCollection');
      
      // Only populate in development/debug mode
      if (__DEV__) {
        for (const item of devData.mockCollection) {
          await database.saveCollectionItem(item);
        }

        console.log('MigrationService: Loaded mock collection data');
        
        // Clear storage service
        await StorageService.saveInventory([]);
      } else {
        console.log('MigrationService: Skipping initial data (production mode)');
      }

    } catch (error) {
      console.error('MigrationService: Failed to populate initial data:', error);
    }
  }
}

export const migrationService = new MigrationService();
