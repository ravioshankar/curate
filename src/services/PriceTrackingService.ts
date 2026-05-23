import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionItemWithValuation, PriceRecord } from '../types/valuation';
import { CollectionItem } from '../types/collection';

const STORAGE_KEY = 'inventory';
type PriceRecordInput = Omit<PriceRecord, 'id' | 'itemId'> & Partial<Pick<PriceRecord, 'id' | 'itemId'>>;
type ChartPoint = { date: string; value: number; source: PriceRecord['source'] };

class PriceTrackingService {
  // Generate unique ID for price records
  private generateId(prefix: string, timestamp: number): string {
    return `${prefix}_${timestamp}_${Math.random().toString(36).substring(2, 8)}`;
  }

  // Initialize price history for existing items (data migration)
  async migrateExistingItems(): Promise<void> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        console.log('PriceTrackingService: No collection found to migrate');
        return;
      }

      const today = new Date().toISOString();
      const migratedCount: Record<string, boolean> = {};

      for (const item of collection) {
        // Create initial price record from existing data
        if ('pricePaid' in item && item.pricePaid !== undefined && !item.priceHistory) {
          await this.addPriceRecord(item.id, {
            itemName: item.name,
            itemId: item.id,
            value: item.pricePaid || 0,
            currency: (item as CollectionItemWithValuation).valSettings?.displayCurrency || 'USD',
            recordedAt: today,
            source: 'initial',
            notes: `Initial valuation - migrated from legacy data`,
          });

          if ('priceExpected' in item && item.priceExpected !== undefined) {
            await this.addPriceRecord(item.id, {
              itemName: item.name,
              itemId: item.id,
              value: item.priceExpected || 0,
              currency: (item as CollectionItemWithValuation).valSettings?.displayCurrency || 'USD',
              recordedAt: today,
              source: 'initial',
              notes: `Expected value - migrated from legacy data`,
            });
          }

          if (!migratedCount[item.id]) {
            migratedCount[item.id] = true;
            console.log(`PriceTrackingService: Migrated ${item.name} (${(item.pricePaid || 0).toFixed(2)})`);
          }
        } else {
          // Item already has price history or no price data
          if (!migratedCount[item.id]) {
            migratedCount[item.id] = true;
            console.log(`PriceTrackingService: ${item.name} - skipping (already has price history)`);
          }
        }
      }

      await this.saveCollection();
      console.log('PriceTrackingService: Migration complete');
    } catch (error) {
      console.error('PriceTrackingService: Migration failed:', error);
    }
  }

  // Add a new price record for an item
  async addPriceRecord(itemId: string, record: PriceRecordInput): Promise<void> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        throw new Error('Collection not found');
      }

      // Find the item
      const itemIndex = collection.findIndex(i => i.id === itemId);
      if (itemIndex === -1) {
        console.log('PriceTrackingService: Item not found');
        return;
      }

      const item = collection[itemIndex];

      // Create price record
      const priceRecord: PriceRecord = {
        ...record,
        id: record.id || this.generateId('price', Date.now()),
        itemId: record.itemId || itemId,
      };
      
      // Generate ID if not provided
      // Add to collection item
      if (!item.priceHistory) {
        item.priceHistory = [];
      }

      item.priceHistory.unshift(priceRecord);

      // Update lastRevaluedAt
      if (!item.lastRevaluedAt) {
        item.lastRevaluedAt = record.recordedAt;
      } else {
        item.lastRevaluedAt = new Date(record.recordedAt).toISOString() > 
          new Date(item.lastRevaluedAt).toISOString() ? record.recordedAt : item.lastRevaluedAt;
      }

      // Save updated collection
      await this.saveCollection(collection);
      
      console.log(`PriceTrackingService: Added price record for ${item.name} - value: ${record.value}`);
    } catch (error) {
      console.error('PriceTrackingService: addPriceRecord failed:', error);
      throw error;
    }
  }

  // Get all price history for an item
  async getPriceHistory(itemId: string): Promise<PriceRecord[]> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return [];
      }

      const item = collection.find(i => i.id === itemId);
      if (!item || !item.priceHistory) {
        return [];
      }

      // Return price history sorted by date (newest first)
      return item.priceHistory.sort((a, b) => 
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
    } catch (error) {
      console.error('PriceTrackingService: getPriceHistory failed:', error);
      return [];
    }
  }

  // Get price history for multiple items
  async getPriceHistoryForItems(itemIds: string[]): Promise<Record<string, any>[]> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return [];
      }

      const results: Record<string, any>[] = [];

      for (const itemId of itemIds) {
        const item = collection.find(i => i.id === itemId);
        if (item && item.priceHistory) {
          results.push({
            id: item.id,
            name: item.name,
            category: item.category,
            priceHistory: item.priceHistory.sort((a, b) => 
              new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
            ),
          });
        }
      }

      return results;
    } catch (error) {
      console.error('PriceTrackingService: getPriceHistoryForItems failed:', error);
      return [];
    }
  }

  // Get current value of an item from price history
  async getCurrentValue(itemId: string): Promise<number | null> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return null;
      }

      const item = collection.find(i => i.id === itemId);
      if (!item || !item.priceHistory) {
        return null;
      }

      // Get the most recent price record
      const sorted = item.priceHistory.sort((a, b) => 
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );

      return sorted[0]?.value || (item.pricePaid || null);
    } catch (error) {
      console.error('PriceTrackingService: getCurrentValue failed:', error);
      return null;
    }
  }

  // Get price change percentage
  async getPriceChangePercent(itemId: string): Promise<number | null> {
    try {
      const currentValue = await this.getCurrentValue(itemId);
      
      if (currentValue === null) {
        return null;
      }

      const collection = await this.getCollection();
      if (!collection) {
        return null;
      }
      const item = collection.find(i => i.id === itemId);

      // Get original purchase price
      const originalPrice = item?.pricePaid || 0;

      if (originalPrice === 0) {
        return null;
      }

      return ((currentValue - originalPrice) / originalPrice) * 100;
    } catch (error) {
      console.error('PriceTrackingService: getPriceChangePercent failed:', error);
      return null;
    }
  }

  // Trigger auto revaluation (manual trigger)
  async triggerRevaluation(itemId: string, newValue?: number): Promise<void> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        throw new Error('Collection not found');
      }

      const item = collection.find(i => i.id === itemId);
      if (!item || !item.priceHistory) {
        console.log('PriceTrackingService: Item or price history not found');
        return;
      }

      // Get current value
      const sorted = item.priceHistory.sort((a, b) => 
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );
      
      const currentValue = sorted[0]?.value || item.pricePaid || 0;
      const currency = (item as CollectionItemWithValuation).valSettings?.displayCurrency || 'USD';

      // If no new value provided, use current value
      const revaluationValue = newValue !== undefined ? newValue : currentValue;

      // Add new price record with manual source
      await this.addPriceRecord(itemId, {
        itemName: item.name,
        itemId: item.id,
        value: revaluationValue,
        currency,
        recordedAt: new Date().toISOString(),
        source: 'manual',
        notes: `Manual revaluation triggered by user`,
      });

      console.log(`PriceTrackingService: Revaluated ${item.name} to ${revaluationValue}`);
    } catch (error) {
      console.error('PriceTrackingService: triggerRevaluation failed:', error);
      throw error;
    }
  }

  // Schedule auto revaluation (runs every N days if setting enabled)
  async scheduleAutoRevaluation(): Promise<void> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return;
      }

      const now = new Date();

      for (const item of collection) {
        if ('lastRevaluedAt' in item && item.lastRevaluedAt) {
          // Parse the date string (could be ISO format or similar)
          let lastRevaluedDate: Date;
          try {
            lastRevaluedDate = new Date(item.lastRevaluedAt);
          } catch {
            continue;
          }

          const daysSinceRevalue = Math.floor(
            (now.getTime() - lastRevaluedDate.getTime()) / (1000 * 60 * 60 * 24)
          );

          const itemSettings = (item as CollectionItemWithValuation).valSettings;
          
          // If auto-revalue is enabled and threshold reached
          if (itemSettings?.autoRevalueEveryDays && daysSinceRevalue >= itemSettings.autoRevalueEveryDays) {
            console.log(`PriceTrackingService: Auto revaluation due for ${item.name} (${daysSinceRevalue} days since last revaluation)`);
            
            // Trigger manual revaluation with current value
            await this.triggerRevaluation(item.id, undefined);
          }
        }
      }

    } catch (error) {
      console.error('PriceTrackingService: scheduleAutoRevaluation failed:', error);
    }
  }

  // Get collection with full valuation data
  async getCollection(): Promise<CollectionItemWithValuation[] | null> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) {
        return null;
      }

      const collection: CollectionItem[] = JSON.parse(data);
      
      // If any items are missing price history array, add it
      for (const item of collection) {
        if ('priceHistory' in item && !item.priceHistory) {
          item.priceHistory = [];
        }
      }

      return collection as CollectionItemWithValuation[];
    } catch (error) {
      console.error('PriceTrackingService: getCollection failed:', error);
      return null;
    }
  }

  // Save collection to storage
  async saveCollection(collectionToSave?: CollectionItemWithValuation[]): Promise<void> {
    try {
      const collection = collectionToSave || await this.getCollection();
      
      if (!collection) {
        return;
      }

      // Convert back to standard CollectionItem type for storage
      const flatCollection: CollectionItem[] = (collection as CollectionItemWithValuation[]).map((item) => {
        // Create a new object to avoid prototype issues
        const newItem = Object.assign({}, item) as any;
        
        // Remove extended types before saving
        delete (newItem as any).valSettings;
        
        return newItem;
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(flatCollection));
    } catch (error) {
      console.error('PriceTrackingService: saveCollection failed:', error);
    }
  }

  // Generate price data for chart visualization
  async generateChartData(itemId: string, limit = 50): Promise<ChartPoint[]> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return [];
      }

      const item = collection.find(i => i.id === itemId);
      if (!item || !item.priceHistory) {
        return [];
      }

      // Sort by date and take recent records
      const sorted = item.priceHistory.sort((a, b) => 
        new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
      );

      // Take most recent N records
      const recentRecords = sorted.slice(0, limit);

      // Format for chart library
      return recentRecords.map((record) => ({
        date: record.recordedAt,
        value: record.value,
        source: record.source,
      }));
    } catch (error) {
      console.error('PriceTrackingService: generateChartData failed:', error);
      return [];
    }
  }

  // Check for alerts and return active ones
  async checkForAlerts(thresholdPercent?: number): Promise<string[]> {
    try {
      const collection = await this.getCollection();
      
      if (!collection) {
        return [];
      }

      const threshold = thresholdPercent || (collection as unknown as CollectionItemWithValuation[])[0]?.valSettings?.alertThresholdPercent || 10;
      const alerts: string[] = [];

      for (const item of collection) {
        if (item.valSettings?.enablePriceAlerts === false) {
          continue;
        }

        const changePercent = await this.getPriceChangePercent(item.id);
        
        if (changePercent !== null && Math.abs(changePercent) >= threshold) {
          // Generate alert message
          const sign = changePercent > 0 ? '📈' : '📉';
          const direction = changePercent > 0 ? 'appreciated' : 'depreciated';
          
          alerts.push(`${sign} ${item.name} has ${direction} by ${Math.abs(changePercent).toFixed(1)}%. Threshold: ${threshold}%`);
        }
      }

      console.log(`PriceTrackingService: Found ${alerts.length} active alerts`);
      return alerts;
    } catch (error) {
      console.error('PriceTrackingService: checkForAlerts failed:', error);
      return [];
    }
  }
}

export const priceTrackingService = new PriceTrackingService();
