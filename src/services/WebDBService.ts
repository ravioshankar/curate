import { CollectionItem } from '../types/collection';
import { AppSettings } from '../types/user';

class WebDBService {
  private dbName = 'CurateDB';
  private version = 4;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const transaction = (event.target as IDBOpenDBRequest).transaction!;
        
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('categories')) {
          db.createObjectStore('categories', { keyPath: 'id' });
        }
        
        // Force update categories on version upgrade
        transaction.oncomplete = () => {
          setTimeout(() => {
            const defaultCategories = [
              'Electronics', 'Kitchen', 'Sports', 'Furniture', 'Music', 'Books', 
              'Clothes', 'Accessories', 'Garden', 'Tools', 'Art', 'Toys', 'Health', 
              'Beauty', 'Office', 'Home', 'Automotive', 'Pet', 'Travel', 'Food',
              'Antiques', 'Jewelry', 'Appliances', 'Cleaning', 'Bathroom', 'Bedroom',
              'Living Room', 'Dining', 'Laundry', 'Storage', 'Lighting', 'Decor',
              'Crafts', 'Games', 'Collectibles', 'Documents', 'Media', 'Baby',
              'Seasonal', 'Outdoor'
            ];
            this.saveCategories(defaultCategories).catch(console.error);
          }, 100);
        };
      };
    });
  }

  async saveCollectionItem(item: CollectionItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readwrite');
      const store = transaction.objectStore('inventory');
      const request = store.put(item);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getCollectionItems(): Promise<CollectionItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readonly');
      const store = transaction.objectStore('inventory');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteCollectionItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readwrite');
      const store = transaction.objectStore('inventory');
      const request = store.delete(id);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ id: 1, ...settings });
      
      request.onerror = () => {
        console.error('WebDBService: saveSettings failed', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        console.log('WebDBService: settings saved', settings);
        resolve();
      };
    });
  }

  async getSettings(): Promise<AppSettings | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(1);
      
      request.onerror = () => {
        console.error('WebDBService: getSettings failed', request.error);
        reject(request.error);
      };
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...settings } = result;
          console.log('WebDBService: settings loaded', settings);
          resolve(settings);
        } else {
          console.log('WebDBService: no settings found');
          resolve(null);
        }
      };
    });
  }

  async saveProfile(profile: { name?: string; email?: string; avatar?: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profile'], 'readwrite');
      const store = transaction.objectStore('profile');
      const request = store.put({ id: 1, ...profile });
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        console.log('WebDBService: profile saved', profile);
        resolve();
      };
    });
  }

  async getProfile(): Promise<{ name?: string; email?: string; avatar?: string } | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['profile'], 'readonly');
      const store = transaction.objectStore('profile');
      const request = store.get(1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, ...profile } = result;
          console.log('WebDBService: profile loaded', profile);
          resolve(profile);
        } else {
          resolve(null);
        }
      };
    });
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
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.get('categories');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          const defaultCategories = this.getDefaultCategories();
          const userCategories = request.result.userCategories || [];
          resolve([...defaultCategories, ...userCategories]);
        } else {
          const defaultCategories = this.getDefaultCategories();
          this.saveCategoryData({ defaultCategories, userCategories: [] }).then(() => resolve(defaultCategories));
        }
      };
    });
  }

  private async saveCategoryData(data: { defaultCategories: string[], userCategories: string[] }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.put({ id: 'categories', ...data });
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async saveCategories(categories: string[]): Promise<void> {
    const defaultCategories = this.getDefaultCategories();
    const userCategories = categories.filter(cat => !defaultCategories.includes(cat));
    await this.saveCategoryData({ defaultCategories, userCategories });
  }

  async addCategory(categoryName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readwrite');
      const store = transaction.objectStore('categories');
      const request = store.get('categories');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const defaultCategories = this.getDefaultCategories();
        const existing = request.result || { defaultCategories, userCategories: [] };
        const userCategories = existing.userCategories || [];
        
        if (!defaultCategories.includes(categoryName) && !userCategories.includes(categoryName)) {
          userCategories.push(categoryName);
          const putReq = store.put({ id: 'categories', defaultCategories, userCategories });
          putReq.onerror = () => reject(putReq.error);
          putReq.onsuccess = () => resolve();
        } else {
          resolve();
        }
      };
    });
  }

  async deleteCategory(categoryName: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const defaultCategories = this.getDefaultCategories();
    if (defaultCategories.includes(categoryName)) {
      throw new Error('Cannot delete default category');
    }
    
    try {
      // Move items from deleted category to "Other"
      const items = await this.getCollectionItems();
      const itemsToUpdate = items.filter(item => item.category === categoryName);
      
      for (const item of itemsToUpdate) {
        await this.saveCollectionItem({ ...item, category: 'Other' });
      }
      
      // Remove category from user categories
      return new Promise((resolve, reject) => {
        const transaction = this.db!.transaction(['categories'], 'readwrite');
        const store = transaction.objectStore('categories');
        const request = store.get('categories');
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const existing = request.result || { defaultCategories, userCategories: [] };
          const userCategories = (existing.userCategories || []).filter((cat: string) => cat !== categoryName);
          
          const putReq = store.put({ id: 'categories', defaultCategories, userCategories });
          putReq.onerror = () => reject(putReq.error);
          putReq.onsuccess = () => resolve();
        };
      });
    } catch (error) {
      throw error;
    }
  }

  async getUserCategories(): Promise<string[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['categories'], 'readonly');
      const store = transaction.objectStore('categories');
      const request = store.get('categories');
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        if (request.result) {
          resolve(request.result.userCategories || []);
        } else {
          resolve([]);
        }
      };
    });
  }

  async isCategoryDeletable(categoryName: string): Promise<boolean> {
    const defaultCategories = this.getDefaultCategories();
    return !defaultCategories.includes(categoryName);
  }
}

export const webDBService = new WebDBService();