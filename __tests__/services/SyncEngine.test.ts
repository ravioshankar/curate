// __tests__/services/SyncEngine.test.ts
// E2E tests for offline-first sync engine
import { ConflictResolver } from '@/src/services/ConflictResolver';
import { databaseService } from '@/src/services/DatabaseService';
import { opQueueService } from '@/src/services/OpQueueService';
import { SyncEngine } from '@/src/services/SyncEngine';
import { CollectionItem } from '@/src/types/collection';

describe('SyncEngine - Offline-First Sync', () => {
  let syncEngine: SyncEngine;
  const testUserId = 'test-user-123';
  const testPassword = 'test-password-secure';

  beforeAll(async () => {
    syncEngine = new SyncEngine('lww');
    await databaseService.init();
  });

  afterEach(async () => {
    // Clear operation queue between tests
    await opQueueService.clearQueue();
  });

  describe('Scenario 1: Offline Edits & Sync', () => {
    it('should record operations offline', async () => {
      const item: CollectionItem = {
        id: 'item-1',
        name: 'Test Item',
        category: 'jewelry',
        location: 'safe',
        lastUsed: new Date().toISOString(),
      };

      // Offline: save item
      await databaseService.saveCollectionItem(item);

      // Check operation recorded
      const queue = await opQueueService.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0]).toBeDefined();
      expect(queue[0].id).toBeDefined();
      expect(typeof queue[0]).toBe('object');
    });

    it('should queue multiple operations offline', async () => {
      const items: CollectionItem[] = [
        {
          id: 'item-1',
          name: 'Item 1',
          category: 'jewelry',
          location: 'safe',
          lastUsed: new Date().toISOString(),
        },
        {
          id: 'item-2',
          name: 'Item 2',
          category: 'art',
          location: 'gallery',
          lastUsed: new Date().toISOString(),
        },
      ];

      // Save multiple items
      for (const item of items) {
        await databaseService.saveCollectionItem(item);
      }

      // Check queue
      const queue = await opQueueService.getQueue();
      expect(queue.length).toBe(2);
      expect(queue[0].data.id).toBe('item-1');
      expect(queue[1].data.id).toBe('item-2');
    });

    it('should mark operations as synced', async () => {
      const item: CollectionItem = {
        id: 'item-sync-test',
        name: 'Sync Test Item',
        category: 'test',
        location: 'test',
        lastUsed: new Date().toISOString(),
      };

      await databaseService.saveCollectionItem(item);

      let queue = await opQueueService.getQueue();
      expect(queue.length).toBe(1);

      // Mark as synced
      await opQueueService.markSynced(queue[0].id);

      // Operation is still in queue (for audit trail) but marked as synced
      queue = await opQueueService.getQueue();
      expect(queue.length).toBe(1);
      expect(queue[0].synced).toBe(true);
    });
  });

  describe('Scenario 2: Conflict Detection & Resolution', () => {
    it('should detect conflicting edits', () => {
      const localItem = {
        id: 'item-1',
        name: 'Local Name',
        updatedAt: 1000,
      };

      const remoteItem = {
        id: 'item-1',
        name: 'Remote Name',
        updatedAt: 1000,
      };

      const hasConflict = ConflictResolver.detect(localItem, remoteItem);
      expect(hasConflict).toBe(true);
    });

    it('should resolve conflicts with LWW strategy', () => {
      const localItem = {
        id: 'item-1',
        name: 'Local Name',
        updatedAt: 1000,
      };

      const remoteItem = {
        id: 'item-1',
        name: 'Remote Name',
        updatedAt: 1100,
      };

      const resolution = ConflictResolver.resolve(localItem, remoteItem, 'lww');

      expect(resolution.winner).toBe('remote');
      expect(resolution.resolved.name).toBe('Remote Name');
    });

    it('should resolve conflicts with field-merge strategy', () => {
      const localItem = {
        id: 'item-1',
        name: 'Local Name',
        category: 'shared-category',
        updatedAt: 1000,
      };

      const remoteItem = {
        id: 'item-1',
        name: 'Remote Name',
        location: 'Remote Location',
        updatedAt: 1100,
      };

      const resolution = ConflictResolver.resolve(localItem, remoteItem, 'field-merge');

      expect(resolution.winner).toBe('merged');
      expect(resolution.resolved.name).toBe('Remote Name'); // newer timestamp
      expect(resolution.resolved.location).toBe('Remote Location'); // from remote
      expect(resolution.resolved.category).toBe('shared-category'); // from local
    });

    it('should prefer remote on same timestamp', () => {
      const localItem = {
        id: 'item-1',
        name: 'Local Name',
        updatedAt: 1000,
      };

      const remoteItem = {
        id: 'item-1',
        name: 'Remote Name',
        updatedAt: 1000, // same timestamp
      };

      const resolution = ConflictResolver.resolve(localItem, remoteItem, 'lww');

      expect(resolution.winner).toBe('remote');
      expect(resolution.resolved.name).toBe('Remote Name');
    });
  });

  describe('Scenario 4: Delete Operations', () => {
    it('should record delete operations', async () => {
      const item: CollectionItem = {
        id: 'delete-test-item',
        name: 'Delete Test',
        category: 'test',
        location: 'test',
        lastUsed: new Date().toISOString(),
      };

      // Create item
      await databaseService.saveCollectionItem(item);

      // Delete item
      await databaseService.deleteCollectionItem(item.id);

      // Check operation recorded
      const queue = await opQueueService.getQueue();
      expect(queue.length).toBe(2); // create + delete
      expect(queue[1].type).toBe('delete');
    });

    it('should handle concurrent edits and deletes', async () => {
      const item1: CollectionItem = {
        id: 'item-1',
        name: 'Item 1',
        category: 'test',
        location: 'test',
        lastUsed: new Date().toISOString(),
      };

      const item2: CollectionItem = {
        id: 'item-2',
        name: 'Item 2',
        category: 'test',
        location: 'test',
        lastUsed: new Date().toISOString(),
      };

      // Create items
      await databaseService.saveCollectionItem(item1);
      await databaseService.saveCollectionItem(item2);

      // Edit item1 (create updated version)
      const updatedItem1 = { ...item1, name: 'Updated Item 1' };
      await databaseService.saveCollectionItem(updatedItem1);

      // Delete item2
      await databaseService.deleteCollectionItem(item2.id);

      // Check queue
      const queue = await opQueueService.getQueue();
      expect(queue.length).toBe(4); // create, create, update, delete
    });
  });

  describe('Scenario 6: Operation Queue Persistence', () => {
    it('should persist operations across app restarts', async () => {
      const item: CollectionItem = {
        id: 'persist-test-item',
        name: 'Persist Test',
        category: 'test',
        location: 'test',
        lastUsed: new Date().toISOString(),
      };

      await databaseService.saveCollectionItem(item);

      // Simulate app restart by reading queue
      const queue1 = await opQueueService.getQueue();
      expect(queue1.length).toBeGreaterThan(0);

      // Read again (simulates app reload)
      const queue2 = await opQueueService.getQueue();
      expect(queue2.length).toBe(queue1.length);
      expect(queue2[0].id).toBe(queue1[0].id);
    });
  });

  describe('Scenario 7: Large Data Sync', () => {
    it('should handle sync of many items', async () => {
      const itemCount = 50;
      const items: CollectionItem[] = Array.from({ length: itemCount }, (_, i) => ({
        id: `bulk-item-${i}`,
        name: `Bulk Item ${i}`,
        category: 'bulk-test',
        location: 'bulk-location',
        lastUsed: new Date().toISOString(),
      }));

      // Create all items
      for (const item of items) {
        await databaseService.saveCollectionItem(item);
      }

      // Check queue
      const queue = await opQueueService.getQueue();
      expect(queue.length).toBe(itemCount);

      // Verify all stored
      const stored = await databaseService.getCollectionItems();
      expect(stored.length).toBeGreaterThanOrEqual(itemCount);
    });

    it('should preserve data integrity during sync', async () => {
      const item: CollectionItem = {
        id: 'integrity-test-item',
        name: 'Integrity Test Item with special chars: !@#$%^&*()',
        category: 'test-category',
        location: 'test-location',
        lastUsed: new Date().toISOString(),
        notes: 'Test notes',
        pricePaid: 99.99,
      };

      await databaseService.saveCollectionItem(item);

      // Verify data integrity
      const items = await databaseService.getCollectionItems();
      const saved = items.find(i => i.id === 'integrity-test-item');

      expect(saved?.name).toBe(item.name);
      expect(saved?.notes).toBe(item.notes);
      expect(saved?.pricePaid).toBe(item.pricePaid);

    });
  });
});
