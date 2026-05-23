import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { dataCollectionService } from '../services/DataCollectionService';
import {
  CreateProjectInput,
  CreateRecordInput,
  DataProject,
  DataRecord,
  DataTemplate,
} from '../types/dataCollection';

interface DataCollectionState {
  projects: DataProject[];
  templates: DataTemplate[];
  records: DataRecord[];
  loading: boolean;
  error: string | null;
}

const initialState: DataCollectionState = {
  projects: [],
  templates: [],
  records: [],
  loading: false,
  error: null,
};

export const loadDataCollection = createAsyncThunk(
  'dataCollection/loadAll',
  async () => {
    const [templates, projects, records] = await Promise.all([
      dataCollectionService.getTemplates(),
      dataCollectionService.getProjects(),
      dataCollectionService.getRecords(),
    ]);

    return { templates, projects, records };
  }
);

export const createDataProject = createAsyncThunk(
  'dataCollection/createProject',
  async (input: CreateProjectInput) => {
    return dataCollectionService.createProject(input);
  }
);

export const createDataRecord = createAsyncThunk(
  'dataCollection/createRecord',
  async (input: CreateRecordInput) => {
    return dataCollectionService.createRecord(input);
  }
);

const dataCollectionSlice = createSlice({
  name: 'dataCollection',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(loadDataCollection.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loadDataCollection.fulfilled, (state, action) => {
        state.loading = false;
        state.templates = action.payload.templates;
        state.projects = action.payload.projects;
        state.records = action.payload.records;
      })
      .addCase(loadDataCollection.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load data collection workspace';
      })
      .addCase(createDataProject.fulfilled, (state, action) => {
        state.projects.unshift(action.payload);
      })
      .addCase(createDataRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
        const project = state.projects.find((item) => item.id === action.payload.projectId);
        if (project) {
          project.updatedAt = action.payload.updatedAt;
        }
      });
  },
});

export default dataCollectionSlice.reducer;
