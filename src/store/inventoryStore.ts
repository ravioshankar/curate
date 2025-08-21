import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { InventoryItem } from '../types/inventory';
import { databaseService } from '../services/DatabaseService';
import { loadCategories } from './categoriesStore';

interface InventoryState {
  items: InventoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: InventoryState = {
  items: [],
  loading: false,
  error: null,
};

export const loadInventory = createAsyncThunk(
  'inventory/loadInventory',
  async () => {
    const items = await databaseService.getInventoryItems();
    return items;
  }
);

export const addInventoryItem = createAsyncThunk(
  'inventory/addItem',
  async (item: InventoryItem, { dispatch }) => {
    await databaseService.saveInventoryItem(item);
    if (item.category) {
      await databaseService.addCategory(item.category);
      dispatch(loadCategories());
    }
    return item;
  }
);

export const updateInventoryItem = createAsyncThunk(
  'inventory/updateItem',
  async (item: InventoryItem, { dispatch }) => {
    await databaseService.saveInventoryItem(item);
    if (item.category) {
      await databaseService.addCategory(item.category);
      dispatch(loadCategories());
    }
    return item;
  }
);

export const deleteInventoryItem = createAsyncThunk(
  'inventory/deleteItem',
  async (id: string) => {
    await databaseService.deleteInventoryItem(id);
    return id;
  }
);

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadInventory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadInventory.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadInventory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load inventory';
      })
      .addCase(addInventoryItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateInventoryItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteInventoryItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default inventorySlice.reducer;