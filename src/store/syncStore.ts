// syncStore.ts - Redux slice for sync state and operations queue
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SyncOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collectionName: string;
  data: any;
  timestamp: number;
  synced: boolean;
}

interface SyncState {
  operationQueue: SyncOperation[];
  syncing: boolean;
  lastSyncTime: number | null;
  syncError: string | null;
  conflictedItems: any[];
}

const initialState: SyncState = {
  operationQueue: [],
  syncing: false,
  lastSyncTime: null,
  syncError: null,
  conflictedItems: [],
};

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    addOperation: (state, action: PayloadAction<SyncOperation>) => {
      state.operationQueue.push(action.payload);
    },
    removeOperation: (state, action: PayloadAction<string>) => {
      state.operationQueue = state.operationQueue.filter(op => op.id !== action.payload);
    },
    setSyncing: (state, action: PayloadAction<boolean>) => {
      state.syncing = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<number>) => {
      state.lastSyncTime = action.payload;
    },
    setSyncError: (state, action: PayloadAction<string | null>) => {
      state.syncError = action.payload;
    },
    addConflict: (state, action: PayloadAction<any>) => {
      state.conflictedItems.push(action.payload);
    },
    resolveConflict: (state, action: PayloadAction<string>) => {
      state.conflictedItems = state.conflictedItems.filter(item => item.id !== action.payload);
    },
    clearConflicts: (state) => {
      state.conflictedItems = [];
    },
  },
});

export const {
  addOperation,
  removeOperation,
  setSyncing,
  setLastSyncTime,
  setSyncError,
  addConflict,
  resolveConflict,
  clearConflicts,
} = syncSlice.actions;

export default syncSlice.reducer;
