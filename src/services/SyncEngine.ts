// SyncEngine.ts - Implements push/pull/merge logic for offline-first sync
import { store } from '@/src/store/store';
import { addConflict, setLastSyncTime, setSyncError } from '@/src/store/syncStore';
import { ConflictResolver, ConflictStrategy } from './ConflictResolver';
import { databaseService } from './DatabaseService';
import {
    batchPushOperations,
    getRemoteOperationsSince,
    getSyncMetadata,
    initFirestore,
    RemoteOperation,
    updateSyncMetadata
} from './FirestoreSchema';
import { opQueueService } from './OpQueueService';

export class SyncEngine {
  private strategy: ConflictStrategy = 'lww';

  constructor(strategy: ConflictStrategy = 'lww') {
    this.strategy = strategy;
  }

  /**
   * Push local operations to Firestore
   */
  async push(userId: string) {
    try {
      const queue = await opQueueService.getQueue();

      if (queue.length === 0) {
        console.log('SyncEngine: No operations to push');
        return;
      }

      console.log(`SyncEngine: Pushing ${queue.length} operations`);

      // Convert local ops to remote ops
      const remoteOps: RemoteOperation[] = queue.map(op => ({
        id: op.id,
        userId,
        type: op.type,
        collectionName: op.collectionName,
        itemId: op.data.id,
        data: op.data,
        timestamp: op.timestamp,
        version: 1, // TODO: versioning strategy
      }));

      // Push to Firestore
      await batchPushOperations(userId, remoteOps);

      // Mark all as synced locally
      for (const op of queue) {
        await opQueueService.markSynced(op.id);
      }

      console.log('SyncEngine: Push complete');
    } catch (error) {
      console.error('SyncEngine: Push failed', error);
      throw error;
    }
  }

  /**
   * Pull remote changes from Firestore
   */
  async pull(userId: string) {
    try {
      const metadata = await getSyncMetadata(userId);
      const lastSyncTime = metadata?.lastSyncTime || 0;

      console.log(`SyncEngine: Pulling changes since ${lastSyncTime}`);

      // Get remote operations since last sync
      const remoteOps = await getRemoteOperationsSince(userId, lastSyncTime);

      if (remoteOps.length === 0) {
        console.log('SyncEngine: No remote changes');
        return;
      }

      console.log(`SyncEngine: Found ${remoteOps.length} remote changes`);

      // Apply remote operations locally with conflict detection
      for (const remoteOp of remoteOps) {
        await this.applyRemoteOperation(remoteOp);
      }

      // Update sync metadata
      await updateSyncMetadata(userId, {
        lastSyncTime: Date.now(),
        remoteVersion: (metadata?.remoteVersion || 0) + remoteOps.length,
      });

      console.log('SyncEngine: Pull complete');
    } catch (error) {
      console.error('SyncEngine: Pull failed', error);
      throw error;
    }
  }

  /**
   * Apply a remote operation with conflict detection
   */
  private async applyRemoteOperation(remoteOp: RemoteOperation) {
    const { type, itemId, data: remoteData } = remoteOp;

    try {
      if (type === 'create' || type === 'update') {
        // Check if local version exists
        const localItems = await databaseService.getCollectionItems();
        const localItem = localItems.find(item => item.id === itemId);

        if (localItem && type === 'update') {
          // Conflict detected: local and remote both exist
          const hasConflict = ConflictResolver.detect(localItem, remoteData);

          if (hasConflict) {
            console.log(`SyncEngine: Conflict detected on item ${itemId}`);

            const resolution = ConflictResolver.resolve(
              localItem,
              remoteData,
              this.strategy
            );

            // Store conflict in Redux for UI review
            store.dispatch(addConflict({
              id: itemId,
              local: localItem,
              remote: remoteData,
              resolution,
            }));

            // Apply resolution
            await databaseService.saveCollectionItem(resolution.resolved);
          } else {
            // No conflict, apply remote
            await databaseService.saveCollectionItem(remoteData);
          }
        } else {
          // No local item, just save remote
          await databaseService.saveCollectionItem(remoteData);
        }
      } else if (type === 'delete') {
        // Apply delete
        await databaseService.deleteCollectionItem(itemId);
      }
    } catch (error) {
      console.error(`SyncEngine: Failed to apply remote operation ${remoteOp.id}`, error);
    }
  }

  /**
   * Full sync: push → pull → merge
   */
  async fullSync(userId: string) {
    try {
      // Initialize Firestore (in case not already done)
      const app = require('@/src/config/firebaseConfig').default;
      initFirestore(app);

      console.log('SyncEngine: Starting full sync');

      // 1. Push local changes to Firestore
      await this.push(userId);

      // 2. Pull remote changes
      await this.pull(userId);

      console.log('SyncEngine: Full sync complete');
      store.dispatch(setLastSyncTime(Date.now()));
      store.dispatch(setSyncError(null));
    } catch (error: any) {
      console.error('SyncEngine: Full sync failed', error);
      store.dispatch(setSyncError(error.message));
      throw error;
    }
  }

  /**
   * Resolve a conflict (called from UI after user decision)
   */
  async resolveConflict(itemId: string, winner: 'local' | 'remote' | 'merged', mergedData?: any) {
    try {
      const localItems = await databaseService.getCollectionItems();
      const localItem = localItems.find(item => item.id === itemId);

      if (!localItem) throw new Error(`Item ${itemId} not found locally`);

      let resolvedItem = localItem;

      if (winner === 'merged' && mergedData) {
        resolvedItem = mergedData;
      }

      // Save resolved item
      await databaseService.saveCollectionItem(resolvedItem);

      // Record operation
      await opQueueService.recordOperation('update', 'collections', resolvedItem);

      console.log(`SyncEngine: Conflict ${itemId} resolved as ${winner}`);
    } catch (error) {
      console.error('SyncEngine: Conflict resolution failed', error);
      throw error;
    }
  }
}

export const syncEngine = new SyncEngine('lww');
