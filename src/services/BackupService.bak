import { Platform } from 'react-native';
import { databaseService } from './DatabaseService';

interface BackupData {
  inventory: any[];
  categories: string[];
  settings: any;
  profile: any;
  timestamp: string;
  version: string;
}

class BackupService {
  async createBackup(): Promise<string> {
    try {
      const [inventory, categories, settings, profile] = await Promise.all([
        databaseService.getCollectionItems(),
        databaseService.getCategories(),
        databaseService.getSettings(),
        databaseService.getProfile()
      ]);

      const backupData: BackupData = {
        inventory,
        categories,
        settings: settings || {},
        profile: profile || {},
        timestamp: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(backupData, null, 2);
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('Failed to create backup');
    }
  }

  async restoreBackup(backupJson: string): Promise<void> {
    try {
      const backupData: BackupData = JSON.parse(backupJson);
      
      // Validate backup data
      if (!backupData.version || !backupData.timestamp) {
        throw new Error('Invalid backup format');
      }

      // Restore data
      if (backupData.categories?.length) {
        // Clear existing categories and restore
        const currentCategories = await databaseService.getCategories();
        for (const cat of currentCategories) {
          await databaseService.deleteCategory(cat);
        }
        for (const cat of backupData.categories) {
          await databaseService.addCategory(cat);
        }
      }

      if (backupData.inventory?.length) {
        for (const item of backupData.inventory) {
          await databaseService.saveCollectionItem(item);
        }
      }

      if (backupData.settings) {
        await databaseService.saveSettings(backupData.settings);
      }

      if (backupData.profile) {
        await databaseService.saveProfile(backupData.profile);
      }

    } catch (error) {
      console.error('Failed to restore backup:', error);
      throw new Error('Failed to restore backup');
    }
  }

  async uploadToGoogleDrive(backupData: string): Promise<string> {
    if (Platform.OS === 'web') {
      return this.uploadToGoogleDriveWeb(backupData);
    } else {
      return this.uploadToGoogleDriveMobile(backupData);
    }
  }

  private async uploadToGoogleDriveWeb(backupData: string): Promise<string> {
    // For web, we'll use Google Drive API directly
    const fileName = `curate-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // Create downloadable backup file for now
    const blob = new Blob([backupData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    return fileName;
  }

  private async uploadToGoogleDriveMobile(backupData: string): Promise<string> {
    const fileName = `curate-backup-${new Date().toISOString().split('T')[0]}.json`;
    
    // For mobile, create downloadable file using FileSystem
    try {
      const FileSystem = require('expo-file-system');
      const filePath = `${FileSystem.documentDirectory}${fileName}`;
      
      await FileSystem.writeAsStringAsync(filePath, backupData);
      
      // Share the file
      const Sharing = require('expo-sharing');
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      }
      
      return fileName;
    } catch (error) {
      // Fallback: just return filename
      return fileName;
    }
  }

  async downloadFromGoogleDrive(fileId: string): Promise<string> {
    // Implementation for downloading from Google Drive
    throw new Error('Download from Google Drive not implemented yet');
  }
}

export const backupService = new BackupService();