import { ConflictResolutionView } from '@/components/ConflictResolutionView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { syncService } from '@/src/services/SyncService';
import { backgroundSyncService } from '@/src/services/BackgroundSyncService';
import { RootState } from '@/src/store/store';
import { useState, useEffect } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';

export function SyncSettingsScreen() {
  const dispatch = useDispatch();
  const auth = useSelector((state: RootState) => state.auth);
  const sync = useSelector((state: RootState) => state.sync);
  const [autoSync, setAutoSync] = useState(true);
  const [backgroundSync, setBackgroundSync] = useState(true);
  const [backupEnabled, setBackupEnabled] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);

  const textColor = useThemeColor({ light: '#1C1917', dark: '#F5F5F4' }, 'text');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');
  const backgroundColor = useThemeColor({ light: '#fff', dark: '#1C1917' }, 'background');
  const tintColor = useThemeColor({}, 'tint');

  // Check background sync status on mount
  useEffect(() => {
    backgroundSyncService.isEnabled().then(enabled => {
      setBackgroundSync(enabled);
    });
  }, []);

  const hasConflicts = (sync.conflictedItems || []).length > 0;
  const lastSyncDisplay = sync.lastSyncTime
    ? new Date(sync.lastSyncTime).toLocaleString()
    : 'Never';

  const handleSyncNow = async () => {
    try {
      setSyncing(true);
      await syncService.syncNow();
      Alert.alert('Success', 'Sync completed successfully');
    } catch (error) {
      Alert.alert('Error', 'Sync failed. Please try again.');
      console.error('Sync error:', error);
    } finally {
      setSyncing(false);
    }
  };

  const handleBackgroundSyncToggle = async (enabled: boolean) => {
    try {
      setBackgroundSync(enabled);
      if (enabled) {
        await backgroundSyncService.initialize();
      } else {
        await backgroundSyncService.stop();
      }
      Alert.alert(
        'Success',
        enabled 
          ? 'Background sync enabled. Your collections will sync every 15 minutes.'
          : 'Background sync disabled.'
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to update background sync settings.');
      console.error('Background sync toggle error:', error);
      // Revert the state
      setBackgroundSync(!enabled);
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor }]}>
      {/* Account Section */}
      {auth.isAuthenticated && (
        <View style={[styles.section, { borderBottomColor: borderColor }]}>
          <View style={styles.sectionHeader}>
            <Icon name="account-circle" size={24} color={tintColor} />
            <Text style={[styles.sectionTitle, { color: textColor }]}>Account</Text>
          </View>
          <View style={styles.sectionContent}>
            <Text style={[styles.label, { color: textColor }]}>Logged in as:</Text>
            <Text style={[styles.value, { color: textColor }]}>{auth.user?.email}</Text>
          </View>
        </View>
      )}

      {/* Sync Status Section */}
      <View style={[styles.section, { borderBottomColor: borderColor }]}>
        <View style={styles.sectionHeader}>
          <Icon name="cloud-sync" size={24} color={tintColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Sync Status</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.statusRow}>
            <Text style={[styles.label, { color: textColor }]}>Last Sync:</Text>
            <Text style={[styles.value, { color: textColor }]}>{lastSyncDisplay}</Text>
          </View>

          <View style={styles.statusRow}>
            <Text style={[styles.label, { color: textColor }]}>Pending Operations:</Text>
            <Text style={[styles.value, { color: tintColor, fontWeight: '600' }]}>
              {sync.operationQueue?.length || 0}
            </Text>
          </View>

          {sync.syncError && (
            <View style={[styles.statusRow, styles.errorRow]}>
              <Icon name="error" size={16} color="#EF4444" />
              <Text style={[styles.errorText]}>
                {sync.syncError}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Conflicts Section */}
      {hasConflicts && (
        <View style={[styles.section, styles.conflictSection, { borderBottomColor: borderColor }]}>
          <TouchableOpacity
            style={styles.conflictHeader}
            onPress={() => setShowConflicts(!showConflicts)}
          >
            <Icon name="warning" size={24} color="#FF9500" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.sectionTitle, { color: '#FF9500' }]}>
                Conflicts ({(sync.conflictedItems || []).length})
              </Text>
              <Text style={[styles.conflictSubtitle, { color: textColor }]}>
                Tap to resolve conflicting changes
              </Text>
            </View>
            <Icon
              name={showConflicts ? 'expand-less' : 'expand-more'}
              size={24}
              color="#FF9500"
            />
          </TouchableOpacity>

          {showConflicts && (
            <View style={styles.conflictDetails}>
              <ConflictResolutionView />
            </View>
          )}
        </View>
      )}

      {/* Auto Sync Section */}
      <View style={[styles.section, { borderBottomColor: borderColor }]}>
        <View style={styles.sectionHeader}>
          <Icon name="schedule" size={24} color={tintColor} />
          <Text style={[styles.sectionTitle, { color: textColor }]}>Sync Options</Text>
        </View>
        <View style={styles.sectionContent}>
          <View style={styles.switchRow}>
            <Text style={[styles.label, { color: textColor }]}>Auto Sync</Text>
            <Switch
              value={autoSync}
              onValueChange={setAutoSync}
              trackColor={{ false: '#ccc', true: tintColor + '50' }}
              thumbColor={autoSync ? tintColor : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.helperText, { color: textColor }]}>
            Automatically sync changes when connected to the internet
          </Text>

          <View style={[styles.switchRow, styles.marginTop]}>
            <Text style={[styles.label, { color: textColor }]}>Background Sync</Text>
            <Switch
              value={backgroundSync}
              onValueChange={handleBackgroundSyncToggle}
              trackColor={{ false: '#ccc', true: tintColor + '50' }}
              thumbColor={backgroundSync ? tintColor : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.helperText, { color: textColor }]}>
            Sync collections every 15 minutes in the background
          </Text>

          <View style={[styles.switchRow, styles.marginTop]}>
            <Text style={[styles.label, { color: textColor }]}>Encrypted Backups</Text>
            <Switch
              value={backupEnabled}
              onValueChange={setBackupEnabled}
              trackColor={{ false: '#ccc', true: tintColor + '50' }}
              thumbColor={backupEnabled ? tintColor : '#f4f3f4'}
            />
          </View>
          <Text style={[styles.helperText, { color: textColor }]}>
            Backup collections to encrypted cloud storage
          </Text>
        </View>
      </View>

      {/* Sync Now Button */}
      <View style={[styles.section, { borderBottomColor: borderColor }]}>
        <TouchableOpacity
          style={[styles.syncButton, { backgroundColor: tintColor }]}
          onPress={handleSyncNow}
          disabled={syncing}
        >
          {syncing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.syncButtonText}>Syncing...</Text>
            </>
          ) : (
            <>
              <Icon name="sync" size={20} color="#fff" />
              <Text style={styles.syncButtonText}>Sync Now</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={[styles.infoTitle, { color: textColor }]}>How Sync Works</Text>
        <View style={styles.infoBullet}>
          <Text style={[styles.infoDot, { color: tintColor }]}>•</Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            Your collections sync automatically when you're online
          </Text>
        </View>
        <View style={styles.infoBullet}>
          <Text style={[styles.infoDot, { color: tintColor }]}>•</Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            Changes work offline and sync when you reconnect
          </Text>
        </View>
        <View style={styles.infoBullet}>
          <Text style={[styles.infoDot, { color: tintColor }]}>•</Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            Conflicting changes are resolved automatically (most recent wins)
          </Text>
        </View>
        <View style={styles.infoBullet}>
          <Text style={[styles.infoDot, { color: tintColor }]}>•</Text>
          <Text style={[styles.infoText, { color: textColor }]}>
            You can manually resolve any conflicting items
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  conflictSection: {
    backgroundColor: '#FFF9E6',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
  conflictSubtitle: {
    fontSize: 12,
    marginLeft: 12,
    marginTop: 2,
  },
  sectionContent: {
    marginLeft: 36,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  errorRow: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  marginTop: {
    marginTop: 8,
  },
  helperText: {
    fontSize: 12,
    marginLeft: 36,
    marginTop: 4,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  syncButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  syncButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  conflictHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  conflictDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFD699',
  },
  infoSection: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginTop: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  infoBullet: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  infoDot: {
    fontSize: 18,
    marginRight: 8,
    fontWeight: 'bold',
  },
  infoText: {
    fontSize: 13,
    flex: 1,
    lineHeight: 18,
  },
});
