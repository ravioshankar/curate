import { syncService } from '@/src/services/SyncService';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

interface ConflictedItem {
  id: string;
  localValue: any;
  remoteValue: any;
  field: string;
  timestamp: number;
}

export const ConflictResolutionView: React.FC = () => {
  const conflictedItems = useSelector((state: any) => state.sync.conflictedItems || []);
  const [resolving, setResolving] = useState(false);

  if (!conflictedItems || conflictedItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>✓ No conflicts</Text>
        <Text style={styles.emptySubText}>All items are synced</Text>
      </View>
    );
  }

  const handleResolve = async (conflict: ConflictedItem, choice: 'local' | 'remote') => {
    try {
      setResolving(true);
      // Send resolution to sync engine
      await syncService.resolveConflict(conflict.id, choice);
      
      Alert.alert(
        'Resolved',
        `${choice === 'local' ? 'Local' : 'Remote'} version kept`,
        [{ text: 'OK' }]
      );
      
      setSelectedConflict(null);
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve conflict');
      console.error('Conflict resolution error:', error);
    } finally {
      setResolving(false);
    }
  };

  const handleResolveAll = async (strategy: 'local' | 'remote') => {
    try {
      setResolving(true);
      for (const conflict of conflictedItems) {
        await syncService.resolveConflict(conflict.id, strategy);
      }
      
      Alert.alert(
        'Resolved',
        `All conflicts resolved using ${strategy} version`
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to resolve conflicts');
      console.error('Batch resolution error:', error);
    } finally {
      setResolving(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Conflicts ({conflictedItems.length})</Text>
        <Text style={styles.subtitle}>
          These items have conflicting changes on different devices
        </Text>
      </View>

      {resolving && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Resolving...</Text>
        </View>
      )}

      <View style={styles.batchActions}>
        <TouchableOpacity
          style={[styles.button, styles.buttonPrimary]}
          onPress={() => handleResolveAll('local')}
          disabled={resolving}
        >
          <Text style={styles.buttonText}>Keep All Local</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={() => handleResolveAll('remote')}
          disabled={resolving}
        >
          <Text style={styles.buttonText}>Keep All Remote</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.divider} />

      {conflictedItems.map((conflict: ConflictedItem, index: number) => (
        <View key={conflict.id} style={styles.conflictCard}>
          <View style={styles.conflictHeader}>
            <Text style={styles.conflictId}>#{index + 1}</Text>
            <Text style={styles.conflictField}>{conflict.id}</Text>
          </View>

          <View style={styles.conflictContent}>
            <View style={styles.valueContainer}>
              <Text style={styles.label}>Local Version</Text>
              <View style={[styles.value, styles.localValue]}>
                <Text style={styles.valueText} numberOfLines={3}>
                  {JSON.stringify(conflict.localValue, null, 2)}
                </Text>
              </View>
            </View>

            <View style={styles.vsContainer}>
              <Text style={styles.vs}>VS</Text>
            </View>

            <View style={styles.valueContainer}>
              <Text style={styles.label}>Remote Version</Text>
              <View style={[styles.value, styles.remoteValue]}>
                <Text style={styles.valueText} numberOfLines={3}>
                  {JSON.stringify(conflict.remoteValue, null, 2)}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.localButton]}
              onPress={() => handleResolve(conflict, 'local')}
              disabled={resolving}
            >
              <Text style={styles.actionButtonText}>Use Local</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.remoteButton]}
              onPress={() => handleResolve(conflict, 'remote')}
              disabled={resolving}
            >
              <Text style={styles.actionButtonText}>Use Remote</Text>
            </TouchableOpacity>
          </View>
        </View>
      ))}

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          💡 Tip: Use "Keep All Local" to keep your changes, or "Keep All Remote" to
          accept changes from other devices.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  emptySubText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  loadingContainer: {
    padding: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  batchActions: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#007AFF',
  },
  buttonSecondary: {
    backgroundColor: '#E8E8E8',
  },
  buttonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
  },
  divider: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 8,
  },
  conflictCard: {
    marginHorizontal: 16,
    marginVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FF9500',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  conflictId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FF9500',
    marginRight: 8,
  },
  conflictField: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  conflictContent: {
    marginBottom: 12,
  },
  valueContainer: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  value: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  localValue: {
    backgroundColor: '#F0F7FF',
    borderColor: '#B3D9FF',
  },
  remoteValue: {
    backgroundColor: '#FFF5F0',
    borderColor: '#FFD6CC',
  },
  valueText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
    lineHeight: 16,
  },
  vsContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  vs: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  localButton: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  remoteButton: {
    backgroundColor: '#FBE9E7',
    borderWidth: 1,
    borderColor: '#FF5722',
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFF9E6',
    marginTop: 8,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#FF9500',
  },
  footerText: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});
