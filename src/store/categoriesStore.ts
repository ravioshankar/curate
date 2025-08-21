import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { databaseService } from '../services/DatabaseService';

interface CategoriesState {
  categories: string[];
  userCategories: string[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoriesState = {
  categories: [],
  userCategories: [],
  loading: false,
  error: null,
};

export const loadCategories = createAsyncThunk(
  'categories/loadCategories',
  async () => {
    const [categories, userCategories] = await Promise.all([
      databaseService.getCategories(),
      databaseService.getUserCategories()
    ]);
    return { categories, userCategories };
  }
);

const categoriesSlice = createSlice({
  name: 'categories',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.categories = action.payload.categories;
        state.userCategories = action.payload.userCategories;
      })
      .addCase(loadCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load categories';
      });
  },
});

export default categoriesSlice.reducer;