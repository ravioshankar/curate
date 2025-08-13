import { configureStore, createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem } from '../types/inventory';
import { StorageService } from '../services/StorageService';
import { mockInventory } from '../data/mockInventory';

interface InventoryState {
  inventory: InventoryItem[];
  currentPage: string;
  isLoading: boolean;
}

const initialState: InventoryState = {
  inventory: [],
  currentPage: 'home',
  isLoading: false,
};

export const loadInventory = createAsyncThunk(
  'inventory/loadInventory',
  async () => {
    let inventory = await StorageService.getInventory();
    if (inventory.length === 0) {
      inventory = mockInventory;
      await StorageService.saveInventory(inventory);
    }
    return inventory;
  }
);

export const addItem = createAsyncThunk(
  'inventory/addItem',
  async (item: InventoryItem) => {
    return await StorageService.addItem(item);
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadInventory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(loadInventory.fulfilled, (state, action) => {
        state.inventory = action.payload;
        state.isLoading = false;
      })
      .addCase(loadInventory.rejected, (state) => {
        state.inventory = mockInventory;
        state.isLoading = false;
      })
      .addCase(addItem.fulfilled, (state, action) => {
        state.inventory = action.payload;
      });
  },
});

export const { setCurrentPage } = inventorySlice.actions;

export const store = configureStore({
  reducer: {
    inventory: inventorySlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;