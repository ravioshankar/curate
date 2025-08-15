import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem } from '../types/inventory';
import { AppSettings } from '../types/user';

class DatabaseService {
  constructor() {
    // Using AsyncStorage for all platforms
  }



  // Inventory operations
  async saveInventoryItem(item: InventoryItem): Promise<void> {
    const items = await this.getInventoryItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    await AsyncStorage.setItem('inventory', JSON.stringify(items));
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    const data = await AsyncStorage.getItem('inventory');
    return data ? JSON.parse(data) : [];
  }

  async deleteInventoryItem(id: string): Promise<void> {
    const items = await this.getInventoryItems();
    const filtered = items.filter(item => item.id !== id);
    await AsyncStorage.setItem('inventory', JSON.stringify(filtered));
  }

  // Settings operations
  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  }

  async getSettings(): Promise<AppSettings | null> {
    const data = await AsyncStorage.getItem('settings');
    return data ? JSON.parse(data) : null;
  }
}

export const databaseService = new DatabaseService();