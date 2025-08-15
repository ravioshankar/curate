import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryItem } from '../types/inventory';
import { AppSettings } from '../types/user';

const STORAGE_KEY = 'curateInventory';
const SETTINGS_KEY = 'curateSettings';

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

  static async getSettings(): Promise<AppSettings | null> {
    try {
      const data = await AsyncStorage.getItem(SETTINGS_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error loading settings:', error);
      return null;
    }
  }

  static async saveSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }
}