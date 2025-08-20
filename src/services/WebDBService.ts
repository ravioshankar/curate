import { InventoryItem } from '../types/inventory';
import { AppSettings } from '../types/user';

class WebDBService {
  private dbName = 'CurateDB';
  private version = 1;
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
        
        if (!db.objectStoreNames.contains('inventory')) {
          db.createObjectStore('inventory', { keyPath: 'id' });
        }
        
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
        }
      };
    });
  }

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readwrite');
      const store = transaction.objectStore('inventory');
      const request = store.put(item);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['inventory'], 'readonly');
      const store = transaction.objectStore('inventory');
      const request = store.getAll();
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
    });
  }

  async deleteInventoryItem(id: string): Promise<void> {
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
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.get(1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const existing = request.result || { id: 1 };
        const toSave = { ...existing, id: 1, ...profile };
        const putReq = store.put(toSave);
        putReq.onerror = () => reject(putReq.error);
        putReq.onsuccess = () => {
          console.log('WebDBService: profile saved', profile);
          resolve();
        };
      };
    });
  }

  async getProfile(): Promise<{ name?: string; email?: string; avatar?: string } | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          const { id, currency, theme, notifications, ...profile } = result;
          console.log('WebDBService: profile loaded', profile);
          resolve(profile);
        } else {
          resolve(null);
        }
      };
    });
  }
}

export const webDBService = new WebDBService();