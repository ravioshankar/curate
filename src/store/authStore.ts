// authStore.ts - Redux slice for auth state
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthUser {
  uid: string;
  email: string;
  displayName?: string;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  loading: true,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.loading = false;
      state.error = null;
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
});

export const { setUser, setAuthError, setAuthLoading, clearAuthError } = authSlice.actions;
export default authSlice.reducer;
