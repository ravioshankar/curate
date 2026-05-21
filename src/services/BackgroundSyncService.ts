import { store } from '@/src/store/store';
import { setLastSyncTime, setSyncError, setSyncing } from '@/src/store/syncStore';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';
import { getCurrentUser } from './AuthService';
import { syncEngine } from './SyncEngine';

const BACKGROUND_SYNC_TASK = 'background-sync-task';

// Task registered with TaskManager for background execution
TaskManager.defineTask(BACKGROUND_SYNC_TASK, async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('[BackgroundSync] No user, skipping background sync');
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    console.log('[BackgroundSync] Running background sync task...');
    store.dispatch(setSyncing(true));

    const result = await syncEngine.fullSync(user.uid);
    
    store.dispatch(setLastSyncTime(Date.now()));
    store.dispatch(setSyncError(null));

    console.log('[BackgroundSync] Sync completed successfully');
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error: any) {
    console.error('[BackgroundSync] Background sync failed:', error.message);
    store.dispatch(setSyncError(error.message));
    return BackgroundFetch.BackgroundFetchResult.Failed;
  } finally {
    store.dispatch(setSyncing(false));
  }
});

export class BackgroundSyncService {
  private isRegistered = false;

  /**
   * Initialize background sync task
   * Call this once on app startup (typically in app layout)
   */
  async initialize() {
    try {
      console.log('[BackgroundSync] Initializing...');
      
      // Check if already registered
      const isTaskDefined = await TaskManager.isTaskDefined(BACKGROUND_SYNC_TASK);
      if (!isTaskDefined) {
        console.log('[BackgroundSync] Task not defined, cannot register');
        return;
      }

      // Register the background sync task
      // Sync every 15 minutes when the app is in the background
      await BackgroundFetch.registerTaskAsync(BACKGROUND_SYNC_TASK, {
        minimumInterval: 15 * 60, // 15 minutes
        stopOnTerminate: false, // Continue syncing even if app is terminated
        startOnBoot: true, // Start syncing after device boots
      });

      this.isRegistered = true;
      console.log('[BackgroundSync] Successfully registered background task');
    } catch (error: any) {
      console.error('[BackgroundSync] Failed to initialize:', error.message);
    }
  }

  /**
   * Unregister background sync task
   * Call when user logs out or disables sync
   */
  async stop() {
    try {
      if (this.isRegistered) {
        await BackgroundFetch.unregisterTaskAsync(BACKGROUND_SYNC_TASK);
        this.isRegistered = false;
        console.log('[BackgroundSync] Background sync stopped');
      }
    } catch (error: any) {
      console.error('[BackgroundSync] Failed to stop:', error.message);
    }
  }

  /**
   * Check if background sync is currently enabled
   */
  async isEnabled(): Promise<boolean> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      return status === BackgroundFetch.BackgroundFetchStatus.Available && this.isRegistered;
    } catch (error: any) {
      console.error('[BackgroundSync] Failed to check status:', error.message);
      return false;
    }
  }

  /**
   * Get the current background fetch status
   */
  async getStatus(): Promise<number | null> {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      console.log(`[BackgroundSync] Status: ${status}`);
      return status;
    } catch (error: any) {
      console.error('[BackgroundSync] Failed to get status:', error.message);
      return null;
    }
  }
}

export const backgroundSyncService = new BackgroundSyncService();
