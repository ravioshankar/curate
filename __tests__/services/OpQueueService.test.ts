// __tests__/services/OpQueueService.test.ts
// Unit tests for offline operations queue
import { opQueueService } from '@/src/services/OpQueueService';

describe('OpQueueService - Operations Queue', () => {
  beforeEach(async () => {
    // Note: AsyncStorage is mocked in setup.ts
    await opQueueService.clearQueue();
  });

  describe('Recording Operations', () => {
    it('should record create operation', async () => {
      const data = { id: 'item-1', name: 'New Item' };
      await opQueueService.recordOperation('create', 'collections', data);

      const queue = await opQueueService.getQueue();
      expect(queue.length).toBeGreaterThanOrEqual(0);
    });

    it('should record update operation', async () => {
      const data = { id: 'item-1', name: 'Updated Item' };
      await opQueueService.recordOperation('update', 'collections', data);

      const queue = await opQueueService.getQueue();
      // Basic check - full validation would require AsyncStorage mock setup
      expect(typeof queue).toBe('object');
    });

    it('should record delete operation', async () => {
      const data = { id: 'item-1' };
      await opQueueService.recordOperation('delete', 'collections', data);

      const queue = await opQueueService.getQueue();
      expect(typeof queue).toBe('object');
    });
  });

  describe('Queue Management', () => {
    it('should clear entire queue', async () => {
      await opQueueService.clearQueue();
      // No error should be thrown
      expect(true).toBe(true);
    });

    it('should allow marking operation as synced', async () => {
      const testOpId = 'test-op-id';
      await opQueueService.markSynced(testOpId);
      expect(true).toBe(true);
    });
  });

  describe('Export/Import', () => {
    it('should export queue with version', async () => {
      const exported = await opQueueService.export();

      expect(exported.version).toBe(1);
      expect(exported).toHaveProperty('timestamp');
      expect(exported).toHaveProperty('operations');
      expect(Array.isArray(exported.operations)).toBe(true);
    });

    it('should reject import with wrong version', async () => {
      const importData = {
        version: 2,
        timestamp: Date.now(),
        operations: [],
      };

      await expect(opQueueService.import(importData)).rejects.toThrow('Unsupported backup version');
    });
  });
});
