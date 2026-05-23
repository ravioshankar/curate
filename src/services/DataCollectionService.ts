import AsyncStorage from '@react-native-async-storage/async-storage';
import { builtInTemplates } from '../data/builtInTemplates';
import {
  CreateProjectInput,
  CreateRecordInput,
  DataProject,
  DataRecord,
  DataTemplate,
} from '../types/dataCollection';

const PROJECTS_KEY = 'curate_data_projects';
const RECORDS_KEY = 'curate_data_records';
const CUSTOM_TEMPLATES_KEY = 'curate_custom_templates';

const createId = (prefix: string) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

class DataCollectionService {
  async getTemplates(): Promise<DataTemplate[]> {
    const customTemplates = await this.getCustomTemplates();
    return [...builtInTemplates, ...customTemplates];
  }

  async getCustomTemplates(): Promise<DataTemplate[]> {
    try {
      const data = await AsyncStorage.getItem(CUSTOM_TEMPLATES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('DataCollectionService: failed to load custom templates', error);
      return [];
    }
  }

  async getProjects(): Promise<DataProject[]> {
    try {
      const data = await AsyncStorage.getItem(PROJECTS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('DataCollectionService: failed to load projects', error);
      return [];
    }
  }

  async createProject(input: CreateProjectInput): Promise<DataProject> {
    const projects = await this.getProjects();
    const now = new Date().toISOString();
    const project: DataProject = {
      id: createId('project'),
      name: input.name.trim(),
      description: input.description?.trim(),
      templateIds: [input.templateId],
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify([project, ...projects]));
    return project;
  }

  async getRecords(): Promise<DataRecord[]> {
    try {
      const data = await AsyncStorage.getItem(RECORDS_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('DataCollectionService: failed to load records', error);
      return [];
    }
  }

  async createRecord(input: CreateRecordInput): Promise<DataRecord> {
    const records = await this.getRecords();
    const now = new Date().toISOString();
    const record: DataRecord = {
      id: createId('record'),
      projectId: input.projectId,
      templateId: input.templateId,
      values: input.values,
      metadata: {
        capturedAt: now,
      },
      status: input.status,
      createdAt: now,
      updatedAt: now,
      submittedAt: input.status === 'submitted' ? now : undefined,
    };

    await AsyncStorage.setItem(RECORDS_KEY, JSON.stringify([record, ...records]));
    await this.touchProject(input.projectId);
    return record;
  }

  private async touchProject(projectId: string): Promise<void> {
    const projects = await this.getProjects();
    const now = new Date().toISOString();
    const updated = projects.map((project) =>
      project.id === projectId ? { ...project, updatedAt: now } : project
    );
    await AsyncStorage.setItem(PROJECTS_KEY, JSON.stringify(updated));
  }
}

export const dataCollectionService = new DataCollectionService();
