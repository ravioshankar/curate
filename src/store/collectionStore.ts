import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CollectionItem } from '../types/collection';
import { databaseService } from '../services/DatabaseService';
import { loadCategories } from './categoriesStore';

interface CollectionState {
  items: CollectionItem[];
  loading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
  items: [],
  loading: false,
  error: null,
};

export const loadCollection = createAsyncThunk(
  'collection/loadCollection',
  async () => {
    const items = await databaseService.getCollectionItems();
    return items;
  }
);

export const addCollectionItem = createAsyncThunk(
  'collection/addItem',
  async (item: CollectionItem, { dispatch }) => {
    await databaseService.saveCollectionItem(item);
    if (item.category) {
      await databaseService.addCategory(item.category);
      dispatch(loadCategories());
    }
    return item;
  }
);

export const updateCollectionItem = createAsyncThunk(
  'collection/updateItem',
  async (item: CollectionItem, { dispatch }) => {
    await databaseService.saveCollectionItem(item);
    if (item.category) {
      await databaseService.addCategory(item.category);
      dispatch(loadCategories());
    }
    return item;
  }
);

export const deleteCollectionItem = createAsyncThunk(
  'collection/deleteItem',
  async (id: string) => {
    await databaseService.deleteCollectionItem(id);
    return id;
  }
);

const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(loadCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load collection';
      })
      .addCase(addCollectionItem.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateCollectionItem.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteCollectionItem.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export default collectionSlice.reducer;