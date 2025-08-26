import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionItem } from '../types/collection';
import { AppSettings } from '../types/user';

const STORAGE_KEY = 'curateCollection';
const SETTINGS_KEY = 'curateSettings';

export class StorageService {
  static async getInventory(): Promise<CollectionItem[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading inventory:', error);
      return [];
    }
  }

  static async saveInventory(inventory: CollectionItem[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    } catch (error) {
      console.error('Error saving inventory:', error);
    }
  }

  static async addItem(item: CollectionItem): Promise<CollectionItem[]> {
    const inventory = await this.getInventory();
    const newInventory = [...inventory, item];
    await this.saveInventory(newInventory);
    return newInventory;
  }

  static async updateItem(updatedItem: CollectionItem): Promise<CollectionItem[]> {
    const inventory = await this.getInventory();
    const newInventory = collection.map(item => 
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