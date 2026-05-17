import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import userReducer from './userStore';
import collectionReducer from './collectionStore';
import categoriesReducer from './categoriesStore';
import priceHistoryReducer from './priceHistoryReducer';
import authReducer from './authStore';
import syncReducer from './syncStore';

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
    collection: collectionReducer,
    user: userReducer,
    categories: categoriesReducer,
    priceHistory: priceHistoryReducer,
    auth: authReducer,
    sync: syncReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
