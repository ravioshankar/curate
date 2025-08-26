import AsyncStorage from '@react-native-async-storage/async-storage';
import { CollectionItem } from '../types/collection';
import { AppSettings } from '../types/user';

class SQLiteService {
  async init(): Promise<void> {
    // AsyncStorage doesn't need initialization
  }

  async saveProfile(profile: { name?: string; email?: string; avatar?: string }): Promise<void> {
    await AsyncStorage.setItem('profile', JSON.stringify(profile));
  }

  async getProfile(): Promise<{ name?: string; email?: string; avatar?: string } | null> {
    const data = await AsyncStorage.getItem('profile');
    return data ? JSON.parse(data) : null;
  }

  async saveCollectionItem(item: CollectionItem): Promise<void> {
    const items = await this.getCollectionItems();
    const index = items.findIndex(i => i.id === item.id);
    if (index >= 0) {
      items[index] = item;
    } else {
      items.push(item);
    }
    await AsyncStorage.setItem('inventory', JSON.stringify(items));
  }

  async getCollectionItems(): Promise<CollectionItem[]> {
    const data = await AsyncStorage.getItem('inventory');
    return data ? JSON.parse(data) : [];
  }

  async deleteCollectionItem(id: string): Promise<void> {
    const items = await this.getCollectionItems();
    const filtered = items.filter(item => item.id !== id);
    await AsyncStorage.setItem('inventory', JSON.stringify(filtered));
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    await AsyncStorage.setItem('settings', JSON.stringify(settings));
  }

  async getSettings(): Promise<AppSettings | null> {
    const data = await AsyncStorage.getItem('settings');
    return data ? JSON.parse(data) : null;
  }

  private getDefaultCategories(): string[] {
    return [
      'Electronics', 'Kitchen', 'Sports', 'Furniture', 'Music', 'Books', 
      'Clothes', 'Accessories', 'Garden', 'Tools', 'Art', 'Toys', 'Health', 
      'Beauty', 'Office', 'Home', 'Automotive', 'Pet', 'Travel', 'Food',
      'Antiques', 'Jewelry', 'Appliances', 'Cleaning', 'Bathroom', 'Bedroom',
      'Living Room', 'Dining', 'Laundry', 'Storage', 'Lighting', 'Decor',
      'Crafts', 'Games', 'Collectibles', 'Documents', 'Media', 'Baby',
      'Seasonal', 'Outdoor', 'Pool', 'Other'
    ];
  }

  async getCategories(): Promise<string[]> {
    const data = await AsyncStorage.getItem('categories');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Legacy format - migrate to new format
        const defaultCategories = this.getDefaultCategories();
        const userCategories = parsed.filter(cat => !defaultCategories.includes(cat));
        await this.saveCategoryData({ defaultCategories, userCategories });
        return [...defaultCategories, ...userCategories];
      } else {
        // New format
        return [...parsed.defaultCategories, ...parsed.userCategories];
      }
    }
    
    // Return default categories if none exist
    const defaultCategories = this.getDefaultCategories();
    await this.saveCategoryData({ defaultCategories, userCategories: [] });
    return defaultCategories;
  }

  private async saveCategoryData(data: { defaultCategories: string[], userCategories: string[] }): Promise<void> {
    await AsyncStorage.setItem('categories', JSON.stringify(data));
  }

  async saveCategories(categories: string[]): Promise<void> {
    const defaultCategories = this.getDefaultCategories();
    const userCategories = categories.filter(cat => !defaultCategories.includes(cat));
    await this.saveCategoryData({ defaultCategories, userCategories });
  }

  async addCategory(categoryName: string): Promise<void> {
    const data = await AsyncStorage.getItem('categories');
    let categoryData;
    
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Legacy format
        const defaultCategories = this.getDefaultCategories();
        categoryData = { defaultCategories, userCategories: parsed.filter(cat => !defaultCategories.includes(cat)) };
      } else {
        categoryData = parsed;
      }
    } else {
      categoryData = { defaultCategories: this.getDefaultCategories(), userCategories: [] };
    }
    
    if (!categoryData.defaultCategories.includes(categoryName) && !categoryData.userCategories.includes(categoryName)) {
      categoryData.userCategories.push(categoryName);
      await this.saveCategoryData(categoryData);
    }
  }

  async deleteCategory(categoryName: string): Promise<void> {
    const defaultCategories = this.getDefaultCategories();
    if (defaultCategories.includes(categoryName)) {
      throw new Error('Cannot delete default category');
    }
    
    // Move items from deleted category to "Other"
    const items = await this.getCollectionItems();
    const itemsToUpdate = items.filter(item => item.category === categoryName);
    
    for (const item of itemsToUpdate) {
      await this.saveCollectionItem({ ...item, category: 'Other' });
    }
    
    // Remove category from user categories
    const data = await AsyncStorage.getItem('categories');
    if (data) {
      const parsed = JSON.parse(data);
      let categoryData;
      
      if (Array.isArray(parsed)) {
        // Legacy format
        categoryData = { defaultCategories, userCategories: parsed.filter(cat => !defaultCategories.includes(cat)) };
      } else {
        categoryData = parsed;
      }
      
      categoryData.userCategories = categoryData.userCategories.filter((cat: string) => cat !== categoryName);
      await this.saveCategoryData(categoryData);
    }
  }

  async getUserCategories(): Promise<string[]> {
    const data = await AsyncStorage.getItem('categories');
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed)) {
        // Legacy format
        const defaultCategories = this.getDefaultCategories();
        return parsed.filter(cat => !defaultCategories.includes(cat));
      } else {
        return parsed.userCategories || [];
      }
    }
    return [];
  }

  async isCategoryDeletable(categoryName: string): Promise<boolean> {
    const defaultCategories = this.getDefaultCategories();
    return !defaultCategories.includes(categoryName);
  }
}

export const sqliteService = new SQLiteService();