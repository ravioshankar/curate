// SyncService.ts - skeleton for offline-first sync engine
import { getCurrentUser } from './AuthService';
import { syncEngine } from './SyncEngine';
import { store } from '@/src/store/store';
import { setSyncing, setLastSyncTime, setSyncError } from '@/src/store/syncStore';
import NetInfo from '@react-native-community/netinfo';

export class SyncService {
  private running = false;
  private syncInterval: any = null;
  private unsubscribe: any = null;

  constructor() {}

  start() {
    this.running = true;
    console.log('SyncService: Started');

    // Listen to connectivity changes
    this.unsubscribe = NetInfo.addEventListener((state) => {
      if (state.isConnected && state.isInternetReachable) {
        console.log('SyncService: Connectivity restored, syncing...');
        this.syncNow().catch(err => console.error('Auto-sync failed:', err));
      }
    });

    // Periodic sync every 30 seconds when connected
    this.syncInterval = setInterval(async () => {
      const state = store.getState();
      if (state.sync.operationQueue.length > 0) {
        console.log('SyncService: Periodic sync triggered');
        this.syncNow().catch(err => console.error('Periodic sync failed:', err));
      }
    }, 30000);
  }

  stop() {
    this.running = false;
    if (this.unsubscribe) this.unsubscribe();
    if (this.syncInterval) clearInterval(this.syncInterval);
    console.log('SyncService: Stopped');
  }

  async syncNow() {
    const user = getCurrentUser();
    if (!user) {
      console.log('SyncService: Not authenticated, skipping sync');
      return;
    }

    store.dispatch(setSyncing(true));

    try {
      await syncEngine.fullSync(user.uid);
      store.dispatch(setLastSyncTime(Date.now()));
      store.dispatch(setSyncError(null));
    } catch (error: any) {
      store.dispatch(setSyncError(error.message));
      console.error('SyncService: Sync failed', error);
    } finally {
      store.dispatch(setSyncing(false));
    }
  }

  async resolveConflict(itemId: string, choice: 'local' | 'remote') {
    try {
      console.log(`SyncService: Resolving conflict for ${itemId}, choice: ${choice}`);
      // Import the action
      const { resolveConflict } = require('@/src/store/syncStore');
      // Remove from conflicted items list in Redux
      store.dispatch(resolveConflict(itemId));
      // Re-sync to ensure consistency
      await this.syncNow();
    } catch (error) {
      console.error('SyncService: Failed to resolve conflict', error);
      throw error;
    }
  }
}

export const syncService = new SyncService();

