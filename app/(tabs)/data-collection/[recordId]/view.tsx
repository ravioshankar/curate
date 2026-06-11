import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { RecordStorage } from '@/src/services/record-storage';
import { type DataRecord } from '@/src/types/data-collection';

const getRecordTitle = (record: DataRecord) =>
  typeof record.values.name === 'string' && record.values.name.trim()
    ? record.values.name
    : 'Untitled record';

const getRecordDescription = (record: DataRecord) =>
  typeof record.values.description === 'string' ? record.values.description : '';

const getRecordValue = (record: DataRecord) =>
  typeof record.values.value === 'number' ? record.values.value : undefined;

export default function RecordViewScreen() {
  const { recordId } = useLocalSearchParams();
  const router = useRouter();
  const normalizedRecordId = Array.isArray(recordId) ? recordId[0] : recordId;
  const recordStorage = useMemo(() => new RecordStorage(), []);
  const [record, setRecord] = useState<DataRecord | null>(null);
  const [loading, setLoading] = useState(true);

  const loadRecord = useCallback(async () => {
    if (!normalizedRecordId) return;

    try {
      setLoading(true);
      setRecord(await recordStorage.getById(normalizedRecordId));
    } catch (error) {
      console.error('Error loading record:', error);
      Alert.alert('Error', 'Failed to load record');
    } finally {
      setLoading(false);
    }
  }, [normalizedRecordId, recordStorage]);

  useEffect(() => {
    loadRecord();
  }, [loadRecord]);

  const handleDeleteRecord = async () => {
    if (!record) return;

    Alert.alert(
      'Delete Record',
      'Delete this record? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recordStorage.delete(record.id);
              router.back();
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Record' }} />
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={styles.loadingText}>Loading record...</Text>
      </View>
    );
  }

  if (!record) {
    return (
      <View style={styles.centered}>
        <Stack.Screen options={{ title: 'Record' }} />
        <Text style={styles.recordName}>Record not found</Text>
        <TouchableOpacity style={styles.secondaryButton} onPress={() => router.back()}>
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const recordDescription = getRecordDescription(record);
  const recordValue = getRecordValue(record);

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <Stack.Screen
        options={{
          title: getRecordTitle(record),
          headerBackTitle: 'Back',
        }}
      />

      <View style={styles.card}>
        <Text style={styles.recordName}>{getRecordTitle(record)}</Text>

        <View style={styles.templateBadgeContainer}>
          <Text style={styles.templateBadgeText}>Template: {record.templateId}</Text>
        </View>

        <View style={[styles.badge, record.status === 'submitted' || record.status === 'approved' ? styles.badgeCompleted : styles.badgePending]}>
          <Text style={styles.badgeText}>{record.status}</Text>
        </View>
      </View>

      {recordDescription ? (
        <View style={styles.card}>
          <Text style={styles.label}>Description</Text>
          <Text style={styles.description}>{recordDescription}</Text>
        </View>
      ) : null}

      {recordValue !== undefined ? (
        <View style={styles.card}>
          <Text style={styles.label}>Value</Text>
          <Text style={styles.value}>{recordValue.toLocaleString()}</Text>
        </View>
      ) : null}

      <View style={styles.card}>
        <Text style={styles.label}>Captured</Text>
        <Text style={styles.timestamp}>
          {new Date(record.metadata.capturedAt || record.createdAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Updated</Text>
        <Text style={styles.timestamp}>
          {new Date(record.updatedAt).toLocaleString()}
        </Text>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Back to Project</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.deleteButton]}
          onPress={handleDeleteRecord}
        >
          <Text style={styles.actionButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  loadingText: {
    color: '#6b7280',
    marginTop: 12,
  },
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
    textAlign: 'center',
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
    alignSelf: 'flex-start',
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
  actionsContainer: {
    marginTop: 8,
    gap: 12,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: '#e5e7eb',
  },
  secondaryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
