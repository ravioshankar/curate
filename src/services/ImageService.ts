import * as FileSystem from 'expo-file-system';
import * as ImagePicker from 'expo-image-picker';

export class ImageService {
  private static readonly IMAGES_DIR = `${FileSystem.documentDirectory}inventory_images/`;

  static async ensureDirectoryExists(): Promise<void> {
    try {
      const dirInfo = await FileSystem.getInfoAsync(this.IMAGES_DIR);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(this.IMAGES_DIR, { intermediates: true });
      }
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw new Error('Cannot create images directory');
    }
  }

  static async saveImage(uri: string, itemId: string): Promise<string> {
    try {
      await this.ensureDirectoryExists();
      const filename = `${itemId}_${Date.now()}.jpg`;
      const localUri = `${this.IMAGES_DIR}${filename}`;
      await FileSystem.copyAsync({ from: uri, to: localUri });
      return localUri;
    } catch (error) {
      console.error('Failed to save image:', error);
      // Return the original URI as fallback
      return uri;
    }
  }

  static async deleteImage(localUri: string): Promise<void> {
    try {
      const fileInfo = await FileSystem.getInfoAsync(localUri);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(localUri);
      }
    } catch (error) {
      console.warn('Failed to delete image:', error);
    }
  }

  static async pickImage(): Promise<string | null> {
    throw new Error('Photo selection not available yet');
  }

  static async takePhoto(): Promise<string | null> {
    throw new Error('Camera not available yet');
  }
}