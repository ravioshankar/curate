import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import userReducer from './userStore';
import inventoryReducer from './inventoryStore';
import categoriesReducer from './categoriesStore';

interface AppState {
  currentPage: string;
}

const initialState: AppState = {
  currentPage: 'home',
};

const appSlice = createSlice({
  name: 'app',
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<string>) => {
      state.currentPage = action.payload;
    },
  },
});

export const { setCurrentPage } = appSlice.actions;

export const store = configureStore({
  reducer: {
    app: appSlice.reducer,
    inventory: inventoryReducer,
    user: userReducer,
    categories: categoriesReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;