// BackupService.ts - Encrypted backup and restore for offline-first sync
import { decryptString, encryptString } from '@/src/utils/encryption';
import { getCurrentUser } from './AuthService';
import { databaseService } from './DatabaseService';
import { opQueueService } from './OpQueueService';

class BackupService {
  async createBackup(password: string) {
    const user = getCurrentUser();
    if (!user) throw new Error('Not authenticated');

    try {
      const collections = await databaseService.getCollectionItems();
      const settings = await databaseService.getSettings();
      const profile = await databaseService.getProfile();
      const opQueue = await opQueueService.export();

      const backup = {
        version: 1,
        timestamp: Date.now(),
        userId: user.uid,
        collections,
        settings,
        profile,
        operations: opQueue,
      };

      // Encrypt the backup
      const json = JSON.stringify(backup);
      const encrypted = await encryptString(json, password);

      return {
        encrypted,
        timestamp: backup.timestamp,
        userId: user.uid,
      };
    } catch (error) {
      console.error('BackupService: createBackup failed:', error);
      throw error;
    }
  }

  async restoreBackup(encrypted: string, password: string) {
    try {
      const json = await decryptString(encrypted, password);
      const backup = JSON.parse(json);

      if (backup.version !== 1) throw new Error('Unsupported backup version');

      // Restore collections
      for (const item of backup.collections || []) {
        await databaseService.saveCollectionItem(item);
      }

      // Restore settings
      if (backup.settings) {
        await databaseService.saveSettings(backup.settings);
      }

      // Restore profile
      if (backup.profile) {
        await databaseService.saveProfile(backup.profile);
      }

      // Restore operations queue
      if (backup.operations) {
        await opQueueService.import(backup.operations);
      }

      return {
        success: true,
        itemsRestored: (backup.collections || []).length,
      };
    } catch (error) {
      console.error('BackupService: restoreBackup failed:', error);
      throw error;
    }
  }

  async schedulePeriodicBackup(intervalMs: number = 86400000) {
    // Default: once per day
    // TODO: implement scheduled backup to Firebase Storage
    // For now, this is a placeholder
    console.log(`BackupService: Scheduled periodic backup every ${intervalMs}ms`);
  }
}

export const backupService = new BackupService();
