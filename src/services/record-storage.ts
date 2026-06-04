/**
 * Record Storage Service (Phase 0)
 * 
 * Handles CRUD operations for data collection records.
 * Supports drafts, submissions, and review workflow.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { type DataRecord } from '@/types';

export class RecordStorage {
  private readonly TABLE_KEY = 'data_records_v1';
  
  /**
   * Get all records (optionally filtered by project)
   */
  async getAll(projectId?: string): Promise<DataRecord[]> {
    try {
      const json = await AsyncStorage.getItem(this.TABLE_KEY);
      const records: DataRecord[] = json ? JSON.parse(json) : [];
      
      if (projectId) {
        return records.filter(r => r.projectId === projectId);
      }
      
      return records;
    } catch (error) {
      console.error('Error getting records:', error);
      return [];
    }
  }

  /**
   * Get record by ID
   */
  async getById(id: string): Promise<DataRecord | null> {
    try {
      const records = await this.getAll();
      return records.find(r => r.id === id) || null;
    } catch (error) {
      console.error('Error getting record by ID:', error);
      return null;
    }
  }

  /**
   * Create a new record
   */
  async create(record: Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<DataRecord> {
    try {
      const newRecord: DataRecord = {
        ...record,
        id: generateEntityId('rec_'),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const records = await this.getAll();
      
      // Handle attachment IDs - need to assign record ID after creation
      if (newRecord.attachments) {
        newRecord.attachments.forEach(attachment => {
          delete attachment.recordId; // Will be set below
        });
      }

      records.push(newRecord);
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(records));
      
      // Update record IDs in attachments
      if (newRecord.attachments) {
        newRecord.attachments.forEach(attachment => {
          attachment.recordId = newRecord.id;
        });
      }

      return newRecord;
    } catch (error) {
      console.error('Error creating record:', error);
      throw error;
    }
  }

  /**
   * Update existing record
   */
  async update(id: string, updates: Partial<DataRecord>): Promise<void> {
    try {
      const records = await this.getAll();
      
      const index = records.findIndex(r => r.id === id);
      if (index === -1) {
        throw new Error(`Record ${id} not found`);
      }

      // Don't allow modifying createdAt or status timestamp after creation
      const allowedUpdates = Object.keys(updates).filter(k => 
        k !== 'createdAt' && k !== 'submittedAt' && k !== 'reviewDate' && k !== 'reviewerComment'
      );
      
      const updatedRecord = { ...records[index], ...updates };
      updatedRecord.updatedAt = new Date().toISOString();
      
      records[index] = updatedRecord;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error updating record:', error);
      throw error;
    }
  }

  /**
   * Save only specific fields without changing timestamps
   */
  async updateField(id: string, fieldKey: string, value: unknown): Promise<void> {
    try {
      const records = await this.getAll();
      
      const index = records.findIndex(r => r.id === id);
      if (index === -1) return;

      records[index].values[fieldKey] = value;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error updating record field:', error);
      throw error;
    }
  }

  /**
   * Add attachment to record
   */
  async addAttachment(recordId: string, attachment: Partial<DataAttachment>): Promise<void> {
    try {
      const records = await this.getAll();
      
      const index = records.findIndex(r => r.id === recordId);
      if (index === -1) throw new Error(`Record ${recordId} not found`);

      const existingRecord = records[index];
      const newAttachment: DataAttachment = {
        id: generateEntityId('att_'),
        recordId: recordId,
        fieldKey: attachment.fieldKey || null,
        type: attachment.type,
        uri: attachment.uri,
        fileName: attachment.fileName,
        mimeType: attachment.mimeType,
        createdAt: new Date().toISOString()
      };

      existingRecord.attachments = existingRecord.attachments || [];
      existingRecord.attachments.push(newAttachment);
      
      records[index] = existingRecord;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error adding attachment:', error);
      throw error;
    }
  }

  /**
   * Remove attachment from record
   */
  async removeAttachment(recordId: string, attachmentId: string): Promise<void> {
    try {
      const records = await this.getAll();
      
      const index = records.findIndex(r => r.id === recordId);
      if (index === -1) return;

      const record = records[index];
      if (!record.attachments) return;

      const filteredAttachments = record.attachments.filter(att => att.id !== attachmentId);
      
      // Also delete the actual file? (optional)
      // await this.deleteFile(attachment.uri);
      
      record.attachments = filteredAttachments;
      records[index] = record;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error removing attachment:', error);
      throw error;
    }
  }

  /**
   * Delete a record
   */
  async delete(id: string): Promise<void> {
    try {
      const records = await this.getAll();
      const filtered = records.filter(r => r.id !== id);
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting record:', error);
      throw error;
    }
  }

  /**
   * Change record status
   */
  async changeStatus(id: string, status: DataRecord['status']): Promise<void> {
    try {
      const records = await this.getAll();
      
      const index = records.findIndex(r => r.id === id);
      if (index === -1) return;

      const record = records[index];
      
      // Set timestamps for status changes
      if (status === 'submitted') {
        record.status = status;
        record.submittedAt = new Date().toISOString();
      } else if (status === 'needs_review' && !record.reviewDate) {
        record.status = status;
        record.reviewDate = new Date().toISOString();
      } else if (status === 'approved') {
        record.status = status;
      } else if (status === 'rejected') {
        record.status = status;
      }
      
      records[index] = record;
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(records));
    } catch (error) {
      console.error('Error changing record status:', error);
      throw error;
    }
  }

  /**
   * Get records by status
   */
  async getByStatus(status: DataRecord['status'], projectId?: string): Promise<DataRecord[]> {
    try {
      let records = await this.getAll(projectId);
      return records.filter(r => r.status === status);
    } catch (error) {
      console.error('Error getting records by status:', error);
      return [];
    }
  }

  /**
   * Get records for a specific template in a project
   */
  async getByTemplate(projectId: string, templateId: string): Promise<DataRecord[]> {
    try {
      const allRecords = await this.getAll(projectId);
      return allRecords.filter(r => r.templateId === templateId);
    } catch (error) {
      console.error('Error getting records by template:', error);
      return [];
    }
  }

  /**
   * Search records by field values
   */
  async search(
    projectId: string, 
    searchTerm: string
  ): Promise<DataRecord[]> {
    try {
      const allRecords = await this.getAll(projectId);
      const lowerSearch = searchTerm.toLowerCase();
      
      return allRecords.filter(r => {
        // Search in record values
        const searchableValues = Object.values(r.values).map(v => 
          typeof v === 'string' ? v.toLowerCase() : String(v).toLowerCase()
        );
        
        return searchableValues.some(val => val.includes(lowerSearch));
      });
    } catch (error) {
      console.error('Error searching records:', error);
      return [];
    }
  }

  /**
   * Get draft records for a project
   */
  async getDrafts(projectId?: string): Promise<DataRecord[]> {
    try {
      const allRecords = await this.getAll(projectId);
      return allRecords.filter(r => r.status === 'draft');
    } catch (error) {
      console.error('Error getting draft records:', error);
      return [];
    }
  }

  /**
   * Get submitted but not reviewed records
   */
  async getPendingReview(projectId?: string): Promise<DataRecord[]> {
    try {
      const allRecords = await this.getAll(projectId);
      return allRecords.filter(r => r.status === 'submitted');
    } catch (error) {
      console.error('Error getting pending review records:', error);
      return [];
    }
  }

  // ============================================================================
  // Bulk Operations
  // ============================================================================

  /**
   * Create multiple records at once
   */
  async createBulk(records: Omit<DataRecord, 'id' | 'createdAt' | 'updatedAt'>[]): Promise<DataRecord[]> {
    try {
      const newRecords: DataRecord[] = [];
      
      for (const recordData of records) {
        const newRecord: DataRecord = {
          ...recordData,
          id: generateEntityId('rec_'),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        newRecords.push(newRecord);
      }

      const existingRecords = await this.getAll();
      
      // Merge into existing array
      const merged = [...existingRecords, ...newRecords];
      
      await AsyncStorage.setItem(this.TABLE_KEY, JSON.stringify(merged));
      
      return newRecords;
    } catch (error) {
      console.error('Error creating records in bulk:', error);
      throw error;
    }
  }

  /**
   * Export all records as array (for CSV/JSON export)
   */
  async getAllForExport(projectId?: string): Promise<DataRecord[]> {
    try {
      return await this.getAll(projectId);
    } catch (error) {
      console.error('Error getting records for export:', error);
      return [];
    }
  }

  /**
   * Clear all records
   */
  async clear(): Promise<void> {
    try {
      await AsyncStorage.setItem(this.TABLE_KEY, '[]');
    } catch (error) {
      console.error('Error clearing records:', error);
      throw error;
    }
  }

  // ============================================================================
  // Private Helper Methods
  // ============================================================================

  private generateId(): string {
    return `rec_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
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

export default RecordStorage;
