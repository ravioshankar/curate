import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem } from '../types/inventory';

const STORAGE_KEY = 'curateInventory';

export class StorageService {
  static async getInventory(): Promise<InventoryItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inventory:', error);
      return [];
    }
  }

  static async saveInventory(inventory: InventoryItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }

  static async addItem(item: InventoryItem): Promise<InventoryItem[]> {
    const inventory = await this.getInventory();
    const newInventory = [...inventory, item];
    await this.saveInventory(newInventory);
    return newInventory;
  }

  static async updateItem(updatedItem: InventoryItem): Promise<InventoryItem[]> {
    const inventory = await this.getInventory();
    const newInventory = inventory.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    );
    await this.saveInventory(newInventory);
    return newInventory;
  }
}