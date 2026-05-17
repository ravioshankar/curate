// OpQueueService.ts - Manages the local operations queue for offline-first sync
import { store } from '@/src/store/store';
import { addOperation, removeOperation } from '@/src/store/syncStore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { v4 as uuidv4 } from 'uuid';

const OP_QUEUE_STORAGE_KEY = '@curate/op_queue';

export interface Operation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collectionName: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

class OpQueueService {
  async recordOperation(type: 'create' | 'update' | 'delete', collectionName: string, data: any) {
    const op: Operation = {
      id: uuidv4(),
      type,
      collectionName,
      data,
      timestamp: Date.now(),
      synced: false,
    };

    // Add to Redux
    store.dispatch(addOperation(op));

    // Persist to AsyncStorage
    try {
      const queue = await this.getQueue();
      queue.push(op);
      await AsyncStorage.setItem(OP_QUEUE_STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.error('OpQueueService: Failed to record operation:', error);
    }
  }

  async getQueue(): Promise<Operation[]> {
    try {
      const stored = await AsyncStorage.getItem(OP_QUEUE_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('OpQueueService: Failed to get queue:', error);
      return [];
    }
  }

  async clearQueue() {
    try {
      await AsyncStorage.removeItem(OP_QUEUE_STORAGE_KEY);
    } catch (error) {
      console.error('OpQueueService: Failed to clear queue:', error);
    }
  }

  async markSynced(opId: string) {
    try {
      const queue = await this.getQueue();
      const updated = queue.map(op => op.id === opId ? { ...op, synced: true } : op);
      await AsyncStorage.setItem(OP_QUEUE_STORAGE_KEY, JSON.stringify(updated));
      store.dispatch(removeOperation(opId));
    } catch (error) {
      console.error('OpQueueService: Failed to mark synced:', error);
    }
  }

  async export(): Promise<any> {
    const queue = await this.getQueue();
    return {
      version: 1,
      timestamp: Date.now(),
      operations: queue,
    };
  }

  async import(data: any): Promise<void> {
    try {
      if (data.version !== 1) throw new Error('Unsupported backup version');
      const queue = data.operations || [];
      await AsyncStorage.setItem(OP_QUEUE_STORAGE_KEY, JSON.stringify(queue));
      queue.forEach((op: Operation) => store.dispatch(addOperation(op)));
    } catch (error) {
      console.error('OpQueueService: Import failed:', error);
      throw error;
    }
  }
}

export const opQueueService = new OpQueueService();
