import * as SQLite from 'expo-sqlite';
import { InventoryItem } from '../types/inventory';
import { AppSettings } from '../types/user';

class SQLiteService {
  private db: SQLite.SQLiteDatabase | null = null;

  async init(): Promise<void> {
    try {
      // Use a different database name to avoid conflicts
      this.db = await SQLite.openDatabaseAsync('curate_inventory.db');
      await this.createTables();
    } catch (error) {
      console.error('SQLiteService: init failed', error);
      // Try fallback with in-memory database
      try {
        this.db = await SQLite.openDatabaseAsync(':memory:');
        await this.createTables();
        console.log('SQLiteService: Using in-memory database as fallback');
      } catch (fallbackError) {
        console.error('SQLiteService: Fallback init failed', fallbackError);
        throw fallbackError;
      }
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        location TEXT NOT NULL,
        lastUsed TEXT NOT NULL,
        imageUrl TEXT,
        pricePaid REAL,
        priceExpected REAL
      );
    `);

    await this.db.execAsync(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        currency TEXT NOT NULL,
        theme TEXT NOT NULL,
        notifications INTEGER NOT NULL,
        name TEXT,
        email TEXT,
        avatar TEXT
      );
    `);
  }

  // Profile persistence
  async saveProfile(profile: { name?: string; email?: string; avatar?: string }): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      // Read existing settings to preserve other fields
      const existing = await this.db.getFirstAsync('SELECT * FROM settings WHERE id = 1') as any;
      const currency = existing ? existing.currency : 'USD';
      const theme = existing ? existing.theme : 'auto';
      const notifications = existing ? existing.notifications : 1;

      await this.db.runAsync(
        `INSERT OR REPLACE INTO settings (id, currency, theme, notifications, name, email, avatar) 
         VALUES (1, ?, ?, ?, ?, ?, ?)`,
        [currency, theme, notifications, profile.name || null, profile.email || null, profile.avatar || null]
      );
      console.log('SQLiteService: profile saved', profile);
    } catch (error) {
      console.error('SQLiteService: saveProfile failed', error);
      throw error;
    }
  }

  async getProfile(): Promise<{ name?: string; email?: string; avatar?: string } | null> {
    if (!this.db) throw new Error('Database not initialized');
    try {
      const result = await this.db.getFirstAsync('SELECT * FROM settings WHERE id = 1');
      if (!result) return null;
      const profile = {
        name: (result as any).name,
        email: (result as any).email,
        avatar: (result as any).avatar
      };
      console.log('SQLiteService: profile loaded', profile);
      return profile;
    } catch (error) {
      console.error('SQLiteService: getProfile failed', error);
      throw error;
    }
  }

  async saveInventoryItem(item: InventoryItem): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.runAsync(
      `INSERT OR REPLACE INTO inventory 
       (id, name, category, location, lastUsed, imageUrl, pricePaid, priceExpected) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [item.id, item.name, item.category, item.location, item.lastUsed, 
       item.imageUrl || null, item.pricePaid || null, item.priceExpected || null]
    );
  }

  async getInventoryItems(): Promise<InventoryItem[]> {
    if (!this.db) throw new Error('Database not initialized');

    const result = await this.db.getAllAsync('SELECT * FROM inventory');
    return result.map((row: any) => ({
      id: row.id,
      name: row.name,
      category: row.category,
      location: row.location,
      lastUsed: row.lastUsed,
      imageUrl: row.imageUrl,
      pricePaid: row.pricePaid,
      priceExpected: row.priceExpected
    }));
  }

  async deleteInventoryItem(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    await this.db.runAsync('DELETE FROM inventory WHERE id = ?', [id]);
  }

  async saveSettings(settings: AppSettings): Promise<void> {
    if (!this.db) {
      await this.init();
    }
    if (!this.db) throw new Error('Database not initialized');

    try {
      await this.db.runAsync(
        `INSERT OR REPLACE INTO settings (id, currency, theme, notifications) 
         VALUES (1, ?, ?, ?)`,
        [settings.currency, settings.theme, settings.notifications ? 1 : 0]
      );
    } catch (error) {
      console.error('SQLiteService: saveSettings failed', error);
    }
  }

  async getSettings(): Promise<AppSettings | null> {
    if (!this.db) throw new Error('Database not initialized');

    try {
      const result = await this.db.getFirstAsync('SELECT * FROM settings WHERE id = 1');
      if (!result) {
        console.log('SQLiteService: no settings found');
        return null;
      }
      const settings = {
        currency: (result as any).currency,
        theme: (result as any).theme,
        notifications: (result as any).notifications === 1
      };
      console.log('SQLiteService: settings loaded', settings);
      return settings;
    } catch (error) {
      console.error('SQLiteService: getSettings failed', error);
      throw error;
    }
  }
}

export const sqliteService = new SQLiteService();