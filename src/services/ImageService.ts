import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

class ImageService {
  private readonly CURATE_FOLDER = 'Curate-Images';

  async pickImage(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access media library is required');
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return await this.uploadToGoogleDrive(result.assets[0].uri);
      }
      return null;
    } catch (error) {
      console.error('Image picker error:', error);
      throw new Error('Photo selection not available on this device');
    }
  }

  async takePhoto(): Promise<string | null> {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission to access camera is required');
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        return await this.uploadToGoogleDrive(result.assets[0].uri);
      }
      return null;
    } catch (error) {
      console.error('Camera error:', error);
      throw new Error('Camera not available on this device');
    }
  }

  private async uploadToGoogleDrive(imageUri: string): Promise<string> {
    try {
      // Generate unique filename
      const timestamp = new Date().getTime();
      const fileName = `curate-image-${timestamp}.jpg`;
      
      if (Platform.OS === 'web') {
        return this.uploadToGoogleDriveWeb(imageUri, fileName);
      } else {
        return await this.uploadToGoogleDriveMobile(imageUri, fileName);
      }
    } catch (error) {
      console.error('Failed to upload image:', error);
      // Fallback to local URI
      return imageUri;
    }
  }

  private uploadToGoogleDriveWeb(imageUri: string, fileName: string): string {
    // For web, return the blob URL for now
    // In production, implement Google Drive API upload
    return imageUri;
  }

  private async uploadToGoogleDriveMobile(imageUri: string, fileName: string): Promise<string> {
    try {
      // Read image as base64
      const base64 = await FileSystem.readAsStringAsync(imageUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // For now, save to local storage and return local path
      // In production, implement Google Drive API upload
      const localPath = `${FileSystem.documentDirectory}${fileName}`;
      await FileSystem.writeAsStringAsync(localPath, base64, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return localPath;
    } catch (error) {
      console.error('Failed to process image:', error);
      return imageUri;
    }
  }

  async deleteImage(imageUrl: string): Promise<void> {
    try {
      // If it's a local file, delete it
      if (imageUrl.startsWith(FileSystem.documentDirectory || '')) {
        await FileSystem.deleteAsync(imageUrl, { idempotent: true });
      }
      // For Google Drive images, implement deletion via API
    } catch (error) {
      console.error('Failed to delete image:', error);
    }
  }
}

export const imageService = new ImageService();