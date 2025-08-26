import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { backupService } from '../../services/BackupService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as DocumentPicker from 'expo-document-picker';

interface BackupManagerProps {
  onBack: () => void;
}

export function BackupManager({ onBack }: BackupManagerProps) {
  const [loading, setLoading] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');

  const handleCreateBackup = async () => {
    setLoading(true);
    try {
      const backupData = await backupService.createBackup();
      const fileName = await backupService.uploadToGoogleDrive(backupData);
      
      Alert.alert(
        'Backup Created',
        `Your data has been backed up successfully as ${fileName}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create backup. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestoreBackup = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true
      });

      if (result.canceled) return;

      setLoading(true);
      
      const response = await fetch(result.assets[0].uri);
      const backupData = await response.text();
      
      Alert.alert(
        'Restore Backup',
        'This will replace all your current data. Are you sure?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Restore',
            style: 'destructive',
            onPress: async () => {
              try {
                await backupService.restoreBackup(backupData);
                Alert.alert('Success', 'Backup restored successfully. Please restart the app.');
              } catch (error) {
                Alert.alert('Error', 'Failed to restore backup. Please check the file format.');
              }
            }
          }
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to read backup file.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title">Backup & Sync</ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Create Backup</ThemedText>
        <ThemedText style={styles.description}>
          Save your collection, categories, and settings to a backup file
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: tintColor }]}
          onPress={handleCreateBackup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Icon name="backup" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Create Backup</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={[styles.section, { backgroundColor: cardBg, borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Restore Backup</ThemedText>
        <ThemedText style={styles.description}>
          Restore your data from a previously created backup file
        </ThemedText>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={handleRestoreBackup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" size="small" />
          ) : (
            <>
              <Icon name="restore" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Restore Backup</ThemedText>
            </>
          )}
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={[styles.infoSection, { backgroundColor: cardBg, borderColor }]}>
        <Icon name="info" size={24} color={tintColor} />
        <ThemedView style={styles.infoContent}>
          <ThemedText style={styles.infoTitle}>How it works</ThemedText>
          <ThemedText style={styles.infoText}>
            • Backup includes all collection items, categories, and settings{'\n'}
            • Files are saved in JSON format for easy portability{'\n'}
            • Use the same backup file across different devices{'\n'}
            • Restore will replace all current data
          </ThemedText>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  section: {
    padding: 20,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
    lineHeight: 20,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    opacity: 0.7,
    lineHeight: 20,
  },
});