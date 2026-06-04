/**
 * Migration Service (Phase 0)
 * 
 * Handles data migration from existing iQRate inventory collection to new data model.
 * Preserves existing data while converting to new schema.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { DataProject, DataTemplate, TemplateField, DataRecord, type GeoLocation } from '@/types/data-collection';

export class MigrationService {
  private readonly INVENTORY_DATA_KEY = 'collection_items_v1';
  
  /**
   * Run full migration from old inventory items to new data model
   */
  async migrate(): Promise<{ 
    project: DataProject; 
    records: DataRecord[];
    itemsMigrated: number;
    itemsFailed: number;
  }> {
    try {
      // Get all existing collection items
      const json = await AsyncStorage.getItem(this.INVENTORY_DATA_KEY);
      const existingItems: any[] = json ? JSON.parse(json) : [];
      
      if (existingItems.length === 0) {
        return {
          project: null as any,
          records: [],
          itemsMigrated: 0,
          itemsFailed: 0
        };
      }

      // Create the Inventory project and template
      const inventoryTemplate = this.createInventoryTemplate();
      const inventoryProject: DataProject = {
        id: 'proj_my_inventory',
        name: 'My Inventory',
        description: 'Personal collection of owned items (migrated from legacy format)',
        templateIds: [inventoryTemplate.id],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        settings: {
          defaultRecordStatus: 'submitted',
          autoSubmitOnComplete: true,
          showAttachmentsInGallery: true
        }
      };

      // Migrate each item to new record format
      const records: DataRecord[] = [];
      let itemsMigrated = 0;
      let itemsFailed = 0;

      for (const item of existingItems) {
        try {
          const record = await this.migrateInventoryItem(item, inventoryProject.id, inventoryTemplate.id);
          records.push(record);
          itemsMigrated++;
        } catch (error: any) {
          console.error(`Failed to migrate item "${item.name}":`, error.message);
          itemsFailed++;
        }
      }

      // Save migration result
      await AsyncStorage.setItem('migration_complete', 'true');
      
      return {
        project: inventoryProject,
        records,
        itemsMigrated,
        itemsFailed
      };

    } catch (error) {
      console.error('Migration failed:', error);
      throw error;
    }
  }

  /**
   * Migrate a single inventory item to new record format
   */
  async migrateInventoryItem(
    item: any, 
    projectId: string, 
    templateId: string
  ): Promise<DataRecord> {
    
    // Map existing fields to new structure
    const values: Record<string, unknown> = {};

    // Name -> text field
    if (item.name) {
      values.name = item.name;
    }

    // Category -> select field with default 'General' if not specified
    const category = item.category || 'General';
    values.category = category;

    // Location -> long text field
    if (item.location) {
      values.location = item.location;
    }

    // Last used -> date field
    if (item.lastUsed) {
      values.lastUsed = item.lastUsed;
    }

    // Price paid -> currency field
    if (item.pricePaid !== undefined && item.pricePaid !== null) {
      values.pricePaid = parseFloat(item.pricePaid) || 0;
    }

    // Price expected -> currency field (nullable)
    if (item.priceExpected !== undefined && item.priceExpected !== null) {
      values.priceExpected = parseFloat(item.priceExpected);
    } else {
      // Keep as string if it's descriptive text like "Fair market value"
      values.priceExpected = item.priceExpected;
    }

    // Notes -> long text field
    if (item.notes) {
      values.notes = item.notes;
    }

    // Handle price history - could be array or string
    let priceHistory: any[] | string;
    if (Array.isArray(item.priceHistory)) {
      priceHistory = item.priceHistory;
    } else if (typeof item.priceHistory === 'string') {
      try {
        priceHistory = JSON.parse(item.priceHistory);
      } catch {
        priceHistory = item.priceHistory;
      }
    }

    // Photos -> photo attachments
    const photoAttachments: any[] = [];
    if (Array.isArray(item.image)) {
      for (const img of item.image) {
        photoAttachments.push({
          id: generateEntityId('att_'),
          recordId: '', // Will be set after creation
          fieldKey: null,
          type: 'photo' as const,
          uri: img,
          fileName: this.generateImageFileName(img),
          mimeType: 'image/jpeg',
          createdAt: new Date().toISOString()
        });
      }
    } else if (item.image) {
      photoAttachments.push({
        id: generateEntityId('att_'),
        recordId: '', // Will be set after creation
        fieldKey: null,
        type: 'photo' as const,
        uri: item.image,
        fileName: this.generateImageFileName(item.image),
        mimeType: 'image/jpeg',
        createdAt: new Date().toISOString()
      });
    }

    // Create record
    const record: DataRecord = {
      id: generateEntityId('rec_'),
      projectId,
      templateId,
      values,
      attachments: photoAttachments.length > 0 ? photoAttachments : undefined,
      metadata: {
        capturedAt: new Date().toISOString(), // Migration timestamp
        deviceId: Platform.OS,
        appVersion: APP_VERSION
      },
      status: 'submitted', // Existing items are already complete
      createdAt: item.lastUsed || new Date().toISOString(), // Or creation time if unknown
      updatedAt: new Date().toISOString()
    };

    return record;
  }

  /**
   * Get count of existing inventory items
   */
  async getInventoryItemCount(): Promise<number> {
    try {
      const json = await AsyncStorage.getItem(this.INVENTORY_DATA_KEY);
      return json ? JSON.parse(json).length : 0;
    } catch (error) {
      console.error('Error getting inventory item count:', error);
      return 0;
    }
  }

  /**
   * Check if migration has already been performed
   */
  async isMigrated(): Promise<boolean> {
    try {
      const result = await AsyncStorage.getItem('migration_complete');
      return result === 'true';
    } catch (error) {
      console.error('Error checking migration status:', error);
      return false;
    }
  }

  /**
   * Create the built-in Inventory Item template
   */
  private createInventoryTemplate(): DataTemplate {
    const fields: TemplateField[] = [
      {
        id: generateEntityId('fld_'),
        label: 'Item Name',
        key: 'name',
        type: 'text',
        required: true,
        placeholder: 'e.g., Sony PlayStation 5'
      },
      {
        id: generateEntityId('fld_'),
        label: 'Category',
        key: 'category',
        type: 'select',
        required: false,
        defaultValue: 'General',
        options: [
          'Electronics',
          'Furniture',
          'Collectibles',
          'Clothing',
          'Books',
          'Sports Equipment',
          'Musical Instruments',
          'Vehicles',
          'Other'
        ]
      },
      {
        id: generateEntityId('fld_'),
        label: 'Location',
        key: 'location',
        type: 'longText',
        required: false,
        placeholder: 'e.g., Bedroom shelf, second from top'
      },
      {
        id: generateEntityId('fld_'),
        label: 'Last Used/Seen',
        key: 'lastUsed',
        type: 'date',
        required: false
      },
      {
        id: generateEntityId('fld_'),
        label: 'Price Paid',
        key: 'pricePaid',
        type: 'currency',
        required: false,
        helpText: 'What you originally paid for the item'
      },
      {
        id: generateEntityId('fld_'),
        label: 'Current Expected Value',
        key: 'priceExpected',
        type: 'currency',
        required: false,
        helpText: 'Estimated current market value'
      }
    ];

    return {
      id: 'tmpl_inventory_default',
      name: 'Inventory Item',
      description: 'Standard template for tracking your personal belongings',
      fields,
      version: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isBuiltIn: true,
      category: 'inventory'
    };
  }

  /**
   * Preview migration results without actually performing it
   */
  async previewMigration(): Promise<PreviewResult> {
    try {
      const existingItems = await this.getExistingInventoryItems();
      
      if (existingItems.length === 0) {
        return {
          itemsCount: 0,
          estimatedSizeMB: 0
        };
      }

      // Preview a sample of migrated records
      const sampleMigration = await this.migrateInventoryItem(
        existingItems[0],
        'proj_preview',
        'tmpl_preview'
      );

      return {
        itemsCount: existingItems.length,
        estimatedSizeMB: 5 + (existingItems.length * 0.1) // Rough estimate
      };

    } catch (error) {
      console.error('Error previewing migration:', error);
      return {
        itemsCount: 0,
        estimatedSizeMB: 0
      };
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  /**
   * Get existing inventory items from AsyncStorage
   */
  private async getExistingInventoryItems(): Promise<any[]> {
    const json = await AsyncStorage.getItem(this.INVENTORY_DATA_KEY);
    return json ? JSON.parse(json) : [];
  }

  /**
   * Generate filename for migrated images
   */
  private generateImageFileName(imageUri: string): string {
    // Extract name from URI path
    const parts = imageUri.split('/');
    const basename = parts[parts.length - 1];
    
    // If it's a file:// URL, extract the filename
    if (basename.startsWith('file://')) {
      return basename.replace('file://', '').split(/[?#]/)[0];
    }

    return basename || `item_${Date.now()}.jpg`;
  }
}

/**
 * Preview result for migration preview
 */
interface PreviewResult {
  itemsCount: number;
  estimatedSizeMB: number;
}

/**
 * Generate entity ID helper
 */
function generateEntityId(prefix = ''): string {
  const timestamp = Date.now().toString(36).substring(2);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}_${random}`;
}

/**
 * Platform.OS from react-native (moved here for convenience in migration)
 */
const Platform = {
  OS: typeof window !== 'undefined' 
    ? (window as any).__reactNativePlatform__ || 'web'
    : (global as any).Platform?.OS || 'unknown'
};

/**
 * APP_VERSION - use from package.json or define here
 */
const APP_VERSION = '1.0.2'; // Migration version number

export default MigrationService;
