import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';

// Import types
import { type DataRecord } from '@/src/types/data-collection';

export default function RecordViewScreen() {
  const { recordId } = useLocalSearchParams();
  const router = useRouter();

  // Placeholder data - in real implementation, this would come from storage
  const placeholderRecord: DataRecord = {
    id: typeof recordId === 'string' ? recordId : '',
    projectId: '',
    templateId: undefined,
    name: 'Sample Record',
    description: 'This is a sample record. Tap the back button to go back to the project details.',
    value: 0,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const handleDeleteRecord = async () => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // In real implementation, call recordStorage.delete(recordId)
              Alert.alert('Action Cancelled', 'Record deletion cancelled.');
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  return (
    <ScrollView 
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen 
        options={{
          title: `${placeholderRecord.name}`,
          headerBackTitle: 'Back',
        }}
      />

      {/* Record Header */}
      <View style={styles.card}>
        <Text style={styles.recordName}>{placeholderRecord.name}</Text>
        
        {placeholderRecord.templateId && (
          <View style={styles.templateBadgeContainer}>
            <Text style={styles.templateBadgeText}>Template ID: {placeholderRecord.templateId?.substring(0, 8)}...</Text>
          </View>
        )}

        <View style={[styles.badge, placeholderRecord.status === 'completed' ? styles.badgeCompleted : styles.badgePending]}>
          <Text style={styles.badgeText}>{placeholderRecord.status}</Text>
        </View>
      </View>

      {/* Record Details */}
      {placeholderRecord.description && (
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>{placeholderRecord.description}</Text>
        </View>
      )}

      {placeholderRecord.value !== undefined && placeholderRecord.value !== null && (
        <View style={styles.card}>
          <Text style={styles.label}>Value</Text>
          <Text style={styles.value}>{placeholderRecord.value.toLocaleString()}</Text>
        </View>
      )}

      {/* Timestamps */}
      <View style={styles.card}>
        <Text style={styles.label}>Created At</Text>
        <Text style={styles.timestamp}>
          {new Date(placeholderRecord.createdAt).toLocaleString()}
        </Text>
      </View>

      {placeholderRecord.updatedAt !== placeholderRecord.createdAt && (
        <>
          <View style={styles.card}>
            <Text style={styles.label}>Updated At</Text>
            <Text style={styles.timestamp}>
              {new Date(placeholderRecord.updatedAt).toLocaleString()}
            </Text>
          </View>
        </>
      )}

      {/* Project ID (if available) */}
      {placeholderRecord.projectId && (
        <View style={styles.card}>
          <Text style={styles.label}>Project ID</Text>
          <Text style={styles.idText}>{placeholderRecord.projectId}</Text>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity 
          style={[styles.actionButton, styles.editButton]}
          onPress={() => router.push({
            pathname: '/data-collection/[recordId]/edit',
            params: { recordId: placeholderRecord.id },
          })}
        >
          <Text style={styles.actionButtonText}>Edit Record</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, styles.deleteButton]}
          onPress={() => handleDeleteRecord()}
        >
          <Text style={styles.actionButtonText} style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  recordName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  templateBadgeContainer: {
    backgroundColor: '#f1f5f9',
    padding: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  templateBadgeText: {
    fontSize: 12,
    color: '#6b7280',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  badgeCompleted: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  badgePending: {
    backgroundColor: '#fef3c7',
    borderColor: '#fcd34d',
  },
  badgeText: {
    color: '#065f46',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  value: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  timestamp: {
    fontSize: 14,
    color: '#9ca3af',
  },
  idText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
  },
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButton: {
    backgroundColor: '#3b82f6',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    shadowColor: '#ef4444',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButtonText: {
    textDecorationLine: 'underline',
  }
});
