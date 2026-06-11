/**
 * Template Storage Service (Phase 0)
 * 
 * Handles CRUD operations for data collection templates.
 * Supports both built-in and custom templates with versioning.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type DataTemplate, type TemplateCategory, type TemplateField } from '@/src/types';

export class TemplateStorage {
  private readonly TABLE_KEY = 'data_templates_v1';
  
  /**
   * Get all templates as JSON array
   */
  async getAll(): Promise<DataTemplate[]> {
    try {
      const json = await AsyncStorage.getItem(this.TABLE_KEY);
      return json ? JSON.parse(json) : [];
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   */
  async getById(id: string): Promise<DataTemplate | null> {
    try {
      const templates = await this.getAll();
      return templates.find(t => t.id === id) || null;
    } catch (error) {
      console.error('Error getting template by ID:', error);
      return null;
    }
  }

  /**
   * Get built-in templates only
   */
  async getBuiltIn(): Promise<DataTemplate[]> {
    try {
      const allTemplates = await this.getAll();
      return allTemplates.filter(t => t.isBuiltIn === true);
    } catch (error) {
      console.error('Error getting built-in templates:', error);
      return [];
    }
  }

  /**
   * Get custom templates only
   */
  async getCustom(): Promise<DataTemplate[]> {
    try {
      const allTemplates = await this.getAll();
      return allTemplates.filter(t => !t.isBuiltIn);
    } catch (error) {
      console.error('Error getting custom templates:', error);
      return [];
    }
  }

  /**
   * Create a new template (for built-in templates, use createBuiltInTemplate())
   */
  async create(template: Omit<DataTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataTemplate> {
    try {
      const newTemplate: DataTemplate = {
        ...template,
        id: generateEntityId('tmpl_'),
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const templates = await this.getAll();
      templates.push(newTemplate);
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(templates));
      
      return newTemplate;
    } catch (error) {
      console.error('Error creating template:', error);
      throw error;
    }
  }

  /**
   * Create a built-in template (e.g., Inventory Item, Inspection Checklist)
   */
  async createBuiltInTemplate(name: string, description?: string, category?: TemplateCategory): Promise<DataTemplate> {
    try {
      // Define field structure based on category
      const fields = this.getDefaultFieldsForCategory(category || 'custom');

      const template: DataTemplate = {
        id: generateEntityId('tmpl_builtin_'),
        name,
        description,
        fields,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isBuiltIn: true,
        category
      };

      const templates = await this.getAll();
      // Add to beginning of list (built-ins first)
      templates.unshift(template);
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(templates));
      
      return template;
    } catch (error) {
      console.error('Error creating built-in template:', error);
      throw error;
    }
  }

  /**
   * Update existing template
   */
  async update(id: string, updates: Partial<DataTemplate>): Promise<void> {
    try {
      const templates = await this.getAll();
      
      const index = templates.findIndex(t => t.id === id);
      if (index === -1) {
        throw new Error(`Template ${id} not found`);
      }

      const updatedTemplate = { ...templates[index], ...updates };
      // Always update the timestamp and version for templates
      if (!updates.version && !updates.fields) {
        updatedTemplate.version = (templates[index].version || 0) + 1;
      }
      updatedTemplate.updatedAt = new Date().toISOString();
      
      templates[index] = updatedTemplate;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(templates));
    } catch (error) {
      console.error('Error updating template:', error);
      throw error;
    }
  }

  /**
   * Delete a template
   */
  async delete(id: string): Promise<void> {
    try {
      const templates = await this.getAll();
      const filtered = templates.filter(t => t.id !== id);
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting template:', error);
      throw error;
    }
  }

  /**
   * Duplicate a template for modification
   */
  async duplicate(id: string): Promise<DataTemplate | null> {
    try {
      const template = await this.getById(id);
      if (!template) return null;

      const duplicatedTemplate: DataTemplate = {
        ...template,
        id: generateEntityId('tmpl_'),
        name: `${template.name} (Copy)`,
        version: 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await this.create(duplicatedTemplate);
      return duplicatedTemplate;
    } catch (error) {
      console.error('Error duplicating template:', error);
      return null;
    }
  }

  /**
   * Get templates by category
   */
  async getByCategory(category?: string): Promise<DataTemplate[]> {
    try {
      const allTemplates = await this.getAll();
      if (!category) return allTemplates;
      
      return allTemplates.filter(t => t.category === category);
    } catch (error) {
      console.error('Error getting templates by category:', error);
      return [];
    }
  }

  /**
   * Search templates by name/description
   */
  async search(query: string): Promise<DataTemplate[]> {
    try {
      const allTemplates = await this.getAll();
      const lowerQuery = query.toLowerCase();
      
      return allTemplates.filter(t => 
        t.name.toLowerCase().includes(lowerQuery) ||
        (t.description && t.description.toLowerCase().includes(lowerQuery)) ||
        (t.fields?.some(f => f.label.toLowerCase().includes(lowerQuery)))
      );
    } catch (error) {
      console.error('Error searching templates:', error);
      return [];
    }
  }

  // ============================================================================
  // Built-in Template Definitions
  // ============================================================================

  /**
   * Get default field structure based on template category
   */
  private getDefaultFieldsForCategory(category: string): TemplateField[] {
    const fieldDefinitions: Record<string, TemplateField[]> = {
      
      // Inventory Category
      'inventory': [
        {
          id: generateEntityId('fld_'),
          label: 'Item Name',
          key: 'name',
          type: 'text',
          required: true,
          placeholder: 'e.g., Sony PlayStation 5'
        },
        {
          id: generateEntityId('fld_'),
          label: 'Category',
          key: 'category',
          type: 'select',
          required: false,
          options: ['Electronics', 'Furniture', 'Collectibles', 'Clothing', 'Books', 'Sports Equipment']
        },
        {
          id: generateEntityId('fld_'),
          label: 'Location',
          key: 'location',
          type: 'longText',
          required: false,
          placeholder: 'e.g., Bedroom shelf, second from top'
        },
        {
          id: generateEntityId('fld_'),
          label: 'Last Used/Seen',
          key: 'lastUsed',
          type: 'date',
          required: false
        },
        {
          id: generateEntityId('fld_'),
          label: 'Price Paid',
          key: 'pricePaid',
          type: 'currency',
          required: false
        }
      ],

      // Inspection Category
      'inspection': [
        {
          id: generateEntityId('fld_'),
          label: 'Room/Area',
          key: 'room',
          type: 'text',
          required: true
        },
        {
          id: generateEntityId('fld_'),
          label: 'Condition',
          key: 'condition',
          type: 'select',
          required: true,
          options: ['Excellent', 'Good', 'Fair', 'Poor']
        },
        {
          id: generateEntityId('fld_'),
          label: 'Notes',
          key: 'notes',
          type: 'longText',
          required: false
        },
        {
          id: generateEntityId('fld_'),
          label: 'Has Issues',
          key: 'hasIssues',
          type: 'boolean',
          required: false
        }
      ],

      // Audit Category
      'audit': [
        {
          id: generateEntityId('fld_'),
          label: 'Asset ID',
          key: 'assetId',
          type: 'barcode',
          required: true
        },
        {
          id: generateEntityId('fld_'),
          label: 'Department',
          key: 'department',
          type: 'select',
          required: true
        },
        {
          id: generateEntityId('fld_'),
          label: 'Status',
          key: 'status',
          type: 'select',
          required: true,
          options: ['In Stock', 'On Loan', 'Damaged', 'Retired']
        },
        {
          id: generateEntityId('fld_'),
          label: 'Quantity',
          key: 'quantity',
          type: 'number',
          required: true,
          validation: { min: 0 }
        }
      ],

      // Maintenance Category
      'maintenance': [
        {
          id: generateEntityId('fld_'),
          label: 'Equipment Name',
          key: 'equipmentName',
          type: 'text',
          required: true
        },
        {
          id: generateEntityId('fld_'),
          label: 'Issue Type',
          key: 'issueType',
          type: 'select',
          required: true,
          options: ['Repair', 'Replacement', 'Upkeep', 'Emergency']
        },
        {
          id: generateEntityId('fld_'),
          label: 'Priority',
          key: 'priority',
          type: 'select',
          required: true,
          options: ['Low', 'Medium', 'High', 'Critical']
        },
        {
          id: generateEntityId('fld_'),
          label: 'Due Date',
          key: 'dueDate',
          type: 'date',
          required: false
        }
      ],

      // Research Category
      'research': [
        {
          id: generateEntityId('fld_'),
          label: 'Observation Title',
          key: 'title',
          type: 'text',
          required: true
        },
        {
          id: generateEntityId('fld_'),
          label: 'Research Topic',
          key: 'topic',
          type: 'select',
          required: false
        },
        {
          id: generateEntityId('fld_'),
          label: 'Notes',
          key: 'notes',
          type: 'longText',
          required: false
        }
      ]
    };

    return fieldDefinitions[category] || [];
  }
}

/**
 * Generate entity ID helper
 */
function generateEntityId(prefix = ''): string {
  const timestamp = Date.now().toString(36).substring(2);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}${timestamp}_${random}`;
}

export default TemplateStorage;
