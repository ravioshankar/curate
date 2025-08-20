import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { databaseService } from '../services/DatabaseService';
import { AppSettings, UserProfile } from '../types/user';

interface UserState {
  profile: UserProfile;
  settings: AppSettings;
}

const initialState: UserState = {
  profile: {
    name: 'John Doe',
    email: 'john.doe@example.com',
  },
  settings: {
    currency: 'USD',
    theme: 'auto',
    notifications: true,
  },
};

export const loadSettings = createAsyncThunk(
  'user/loadSettings',
  async () => {
    const settings = await databaseService.getSettings();
    return settings;
  }
);

export const loadProfile = createAsyncThunk(
  'user/loadProfile',
  async () => {
    const profile = await databaseService.getProfile();
    return profile;
  }
);

export const saveSettings = createAsyncThunk(
  'user/saveSettings',
  async (settings: AppSettings) => {
    await databaseService.saveSettings(settings);
    return settings;
  }
);

export const saveProfile = createAsyncThunk(
  'user/saveProfile',
  async (profile: Partial<UserProfile>) => {
    await databaseService.saveProfile(profile);
    return profile;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    updateProfile: (state, action: PayloadAction<Partial<UserProfile>>) => {
      state.profile = { ...state.profile, ...action.payload };
    },
    updateSettings: (state, action: PayloadAction<Partial<AppSettings>>) => {
      state.settings = { ...state.settings, ...action.payload };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadSettings.fulfilled, (state, action) => {
        if (action.payload) {
          state.settings = { ...state.settings, ...action.payload };
        }
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        if (action.payload) {
          state.profile = { ...state.profile, ...action.payload };
        }
      })
      .addCase(saveSettings.fulfilled, (state, action) => {
        state.settings = action.payload;
      });
      
    builder.addCase(saveProfile.fulfilled, (state, action) => {
      state.profile = { ...state.profile, ...action.payload } as UserProfile;
    });
  },
});

export const { updateProfile, updateSettings } = userSlice.actions;
export default userSlice.reducer;