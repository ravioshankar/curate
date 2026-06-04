# iQRate Pivot: Implementation Plan & Technical Architecture

## Overview

This document details the phased implementation of iQRate's transformation from a personal inventory tracker to an offline-first data collection platform.

---

## 📋 Phase 0: Foundation Cleanup (Weeks 1-2)

### Goal
Prepare existing codebase for generic data collection while preserving current functionality.

### Technical Architecture

```
src/
├── types/
│   ├── index.ts                 # Type exports
│   └── data-collection.ts       # New core data models
├── services/
│   ├── project-storage.ts       # Project CRUD operations
│   ├── template-storage.ts      # Template CRUD operations  
│   ├── record-storage.ts        # Record CRUD operations
│   └── migration.ts             # Data migration utilities
├── components/
│   └── data-collection/
│       ├── ProjectCard.tsx
│       ├── TemplateCard.tsx
│       └── RecordThumbnail.tsx
```

### Deliverables

1. **Data Models** (`src/types/data-collection.ts`)
   ```typescript
   export type FieldType = 
     | 'text'
     | 'longText' 
     | 'number'
     | 'currency'
     | 'date'
     | 'boolean'
     | 'select'
     | 'multiSelect'
     | 'rating'
     | 'photo'
     | 'location'
     | 'barcode';

   export interface TemplateField {
     id: string;
     label: string;
     key: string;
     type: FieldType;
     required?: boolean;
     placeholder?: string;
     helpText?: string;
     defaultValue?: unknown;
     options?: string[];
     validation?: FieldValidation;
     display?: FieldDisplaySettings;
   }

   export interface TemplateFieldValidation {
     min?: number;
     max?: number;
     pattern?: string;
     minLength?: number;
     maxLength?: number;
   }

   export interface FieldDisplaySettings {
     showInList?: boolean;
     showInTable?: boolean;
     width?: number; // percentage or auto
   }

   export interface DataTemplate {
     id: string;
     name: string;
     description?: string;
     version: number;
     fields: TemplateField[];
     createdAt: string;
     updatedAt: string;
     isBuiltIn?: boolean;
     category?: 'inventory' | 'inspection' | 'audit' | 'maintenance' | 'research';
   }

   export interface DataProject {
     id: string;
     name: string;
     description?: string;
     templateIds: string[];
     createdAt: string;
     updatedAt: string;
     status: 'active' | 'archived';
     settings?: ProjectSettings;
   }

   export interface ProjectSettings {
     defaultRecordStatus: 'draft' | 'submitted';
     showAttachmentsInGallery?: boolean;
     autoSubmitOnComplete?: boolean;
     requireLocation?: boolean;
   }

   export interface DataRecord {
     id: string;
     projectId: string;
     templateId: string;
     values: Record<string, unknown>;
     attachments?: DataAttachment[];
     metadata: RecordMetadata;
     status: 'draft' | 'submitted' | 'needs_review' | 'approved' | 'archived';
     createdAt: string;
     updatedAt: string;
     submittedAt?: string;
     reviewerId?: string;
     reviewerComment?: string;
     reviewDate?: string;
   }

   export interface DataAttachment {
     id: string;
     recordId: string;
     fieldKey?: string; // nullable if general attachment
     type: 'photo' | 'document' | 'receipt';
     uri: string;
     fileName?: string;
     mimeType?: string;
     createdAt: string;
   }

   export interface RecordMetadata {
     capturedAt?: string;
     location?: GeoLocation;
     deviceId?: string;
     appVersion?: string;
   }

   export interface GeoLocation {
     latitude: number;
     longitude: number;
     accuracy?: number;
     altitude?: number;
   }
   ```

2. **Storage Services**
   
   **Project Storage** (`src/services/project-storage.ts`):
   ```typescript
   import { Database, type SQLite } from 'expo-sqlite';
   import { DataProject } from '../types/data-collection';
   
   export class ProjectStorage {
     private db: SQLite;
     
     constructor(db: Database) {
       this.db = db;
     }
   
     async init() {
       await this.db.exec(`
         CREATE TABLE IF NOT EXISTS projects (
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           description TEXT,
           template_ids TEXT NOT NULL, -- JSON array
           status TEXT NOT NULL DEFAULT 'active',
           settings TEXT, -- JSON object
           created_at TEXT NOT NULL,
           updated_at TEXT NOT NULL
         )
       `);
       
       await this.db.exec(`CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status)`);
     }

     async getAll(): Promise<DataProject[]> {
       const result = await this.db.getAllAsync('SELECT * FROM projects ORDER BY created_at DESC');
       return result.map(this.toDataProject);
     }

     async getById(id: string): Promise<DataProject | null> {
       const result = await this.db.getFirstAsync('SELECT * FROM projects WHERE id = ?', [id]);
       return result ? this.toDataProject(result) : null;
     }

     async create(name: string, description?: string, templateIds: string[] = [], settings?: any): Promise<DataProject> {
       const project: DataProject = {
         id: this.generateId(),
         name,
         description,
         templateIds,
         status: 'active',
         settings,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
       };
       
       const templateIdsJson = JSON.stringify(templateIds);
       const settingsJson = settings ? JSON.stringify(settings) : null;
       
       await this.db.run(
         'INSERT INTO projects (id, name, description, template_ids, status, settings, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
         [project.id, project.name, project.description, templateIdsJson, project.status, settingsJson, project.createdAt, project.updatedAt]
       );

       return project;
     }

     async update(id: string, updates: Partial<DataProject>): Promise<void> {
       const updatedAt = new Date().toISOString();
       
       await this.db.run(
         `UPDATE projects SET 
          name = COALESCE(? , name),
          description = COALESCE(? , description),
          template_ids = COALESCE(? , template_ids),
          status = COALESCE(? , status),
          settings = COALESCE(? , settings),
          updated_at = ?
         WHERE id = ?`,
         [
           updates.name,
           updates.description,
           JSON.stringify(updates.templateIds),
           updates.status,
           JSON.stringify(updates.settings),
           updatedAt,
           id
         ]
       );
       
       await this.db.run('UPDATE projects SET updated_at = ? WHERE id = ?', [updatedAt, id]);
     }

     async archive(id: string): Promise<void> {
       const archivedProject = await this.getById(id);
       if (archivedProject) {
         await this.update(id, { status: 'archived' });
         
         // Optionally delete records in archived project
         const db = require('expo-sqlite'); // access to main db instance
         await db.getAllAsync('DELETE FROM records WHERE project_id = ?', [id]);
       }
     }

     async delete(id: string): Promise<void> {
       await this.db.run('DELETE FROM projects WHERE id = ?', [id]);
       
       const db = require('expo-sqlite');
       await db.getAllAsync('DELETE FROM records WHERE project_id = ?', [id]);
     }

     private toDataProject(row: any): DataProject {
       return {
         id: row.id,
         name: row.name,
         description: row.description || null,
         templateIds: JSON.parse(row.template_ids),
         status: row.status,
         settings: row.settings ? JSON.parse(row.settings) : null,
         createdAt: row.created_at,
         updatedAt: row.updated_at
       };
     }

     private generateId(): string {
       return `proj_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
     }
   }
   ```

3. **Migration Utilities** (`src/services/migration.ts`):
   ```typescript
   import { CollectionItem } from '../types'; // existing types
   import { DataProject, DataTemplate, TemplateField, DataRecord } from '../types/data-collection';
   
   export class MigrationService {
     /**
      * Convert existing CollectionItem to new data model
      */
     async migrateInventoryItem(
       item: CollectionItem,
       projectId: string,
       templateId: string
     ): Promise<DataRecord> {
       // Map existing fields to new structure
       const values: Record<string, unknown> = {
         name: item.name || '',
         category: item.category || 'General',
         location: item.location || '',
         lastUsed: item.lastUsed || '',
         pricePaid: item.pricePaid || 0,
         priceExpected: item.priceExpected || null,
         notes: item.notes || ''
       };

       // Handle price history as nested object or attachment
       if (item.priceHistory && item.priceHistory.length > 0) {
         values.priceHistory = item.priceHistory;
       }

       // Map image to photo attachments
       const attachments: any[] = [];
       if (item.image) {
         attachments.push({
           id: this.generateAttachmentId(),
           recordId: '', // will be set after record creation
           type: 'photo',
           uri: item.image,
           fileName: `item_${item.name.replace(/\s+/g, '_')}.jpg`,
           mimeType: 'image/jpeg',
           createdAt: new Date().toISOString()
         });
       }

       return {
         id: this.generateId(),
         projectId,
         templateId,
         values,
         attachments,
         metadata: {
           capturedAt: new Date().toISOString(),
           deviceId: Platform.OS, // or specific device ID
           appVersion: APP_VERSION
         },
         status: 'submitted', // existing items are already "submitted"
         createdAt: item.lastUsed || new Date().toISOString(),
         updatedAt: new Date().toISOString()
       };
     }

     /**
      * Create Inventory template and project from existing data
      */
     async createInventoryProject(): Promise<{ project: DataProject; records: DataRecord[] }> {
       const inventoryTemplate: DataTemplate = {
         id: 'tmpl_inventory_default',
         name: 'Inventory Item',
         description: 'Standard inventory item template',
         version: 1,
         fields: [
           {
             id: 'fld_name',
             label: 'Item Name',
             key: 'name',
             type: 'text',
             required: true,
             placeholder: 'e.g., Sony PlayStation 5',
             helpText: 'Enter the name of the item'
           },
           {
             id: 'fld_category',
             label: 'Category',
             key: 'category',
             type: 'select',
             required: false,
             defaultValue: 'General',
             options: [
               'Electronics',
               'Furniture',
               'Collectibles',
               'Clothing',
               'Books',
               'Sports Equipment',
               'Musical Instruments',
               'Vehicles',
               'Other'
             ]
           },
           {
             id: 'fld_location',
             label: 'Location',
             key: 'location',
             type: 'longText',
             required: false,
             placeholder: 'e.g., Bedroom shelf, second from top',
             helpText: 'Describe where the item is stored'
           },
           {
             id: 'fld_lastUsed',
             label: 'Last Used/Seen',
             key: 'lastUsed',
             type: 'date',
             required: false,
             placeholder: 'Date you last used this item'
           },
           {
             id: 'fld_pricePaid',
             label: 'Price Paid',
             key: 'pricePaid',
             type: 'currency',
             required: false,
             helpText: 'What you originally paid for the item'
           },
           {
             id: 'fld_priceExpected',
             label: 'Current Expected Value',
             key: 'priceExpected',
             type: 'currency',
             required: false,
             helpText: 'Estimated current market value'
           }
         ],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         isBuiltIn: true,
         category: 'inventory'
       };

       // Migrate all existing items to new structure
       const project: DataProject = {
         id: 'proj_my_inventory',
         name: 'My Inventory',
         description: 'Personal collection of owned items',
         templateIds: ['tmpl_inventory_default'],
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString(),
         status: 'active',
         settings: {
           defaultRecordStatus: 'submitted',
           autoSubmitOnComplete: true
         }
       };

       const records = await Promise.all(
         existingItems.map(item => this.migrateInventoryItem(item, project.id, inventoryTemplate.id))
       );

       return { project, records };
     }
   }
   ```

---

## 🚀 Phase 1: MVP Collection Flow (Weeks 3-5)

### Technical Architecture

```
app/
├── (tabs)/
│   ├── _layout.tsx              # Updated tab layout with Projects, Records, Templates
│   ├── projects/                # NEW PROJECTS TAB
│   │   └── index.tsx            # Projects list screen
│   └── collect/                 # NEW COLLECT TAB
│       └── index.tsx            # Dynamic form renderer screen
├── screens/
│   ├── data-collection/         # NEW SCREENS
│   │   ├── projects-list.tsx
│   │   ├── project-detail.tsx
│   │   ├── create-project.tsx
│   │   ├── templates-list.tsx
│   │   └── select-template.tsx
```

### Key Components to Build

1. **Projects List Screen** (`app/(tabs)/projects/index.tsx`)
2. **Project Detail View** (`app/(tabs)/projects/[id]/detail.tsx`)
3. **Template Selector** (`app/data-collection/collect/template-selector.tsx`)
4. **Dynamic Form Renderer** (`src/components/data-collection/FormRenderer.tsx`)

### Screen Implementation Details

```typescript
// app/(tabs)/projects/index.tsx
import { Stack, useRouter } from 'expo-router';
import { FlatList, View, Text, StyleSheet } from 'react-native';
import { ProjectCard } from '@/components/data-collection/ProjectCard';
import type { DataProject } from '@/types/data-collection';

export default function ProjectsListScreen() {
  const router = useRouter();
  const [projects] = useState(() => projectStorage.getAll());

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Projects</Text>
        <Button 
          title="+ New Project" 
          onPress={() => router.push('/data-collection/create-project')}
        />
      </View>

      <FlatList
        data={projects}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ProjectCard 
            project={item} 
            onPress={() => router.push(`/data-collection/project/${item.id}`)}
          />
        )}
      />
    </ScrollView>
  );
}
```

---

## 🎨 Phase 2: Dynamic Form Renderer (Weeks 6-8)

### Technical Architecture

```
src/
├── components/
│   └── data-collection/
│       ├── FormRenderer.tsx          # Main form renderer component
│       ├── FieldComponent.tsx        # Generic field wrapper
│       ├── PhotoField.tsx            # Photo capture field
│       ├── LocationField.tsx         # GPS location field
│       └── BarcodeScannerField.tsx   # QR/Barcode scanner
```

### Form Renderer Implementation

```typescript
// src/components/data-collection/FormRenderer.tsx
import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import type { DataTemplate } from '@/types/data-collection';
import FieldComponent from './FieldComponent';
import PhotoField from './PhotoField';

interface FormRendererProps {
  template: DataTemplate;
  recordValues: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => Promise<void>;
  onCancel: () => void;
}

export default function FormRenderer({ template, recordValues, onSave, onCancel }: FormRendererProps) {
  return (
    <ScrollView style={styles.container}>
      {template.fields.map((field) => {
        const FieldComponent = getFieldTypeComponent(field.type);
        return (
          <FieldComponent 
            key={field.id}
            field={field}
            value={recordValues[field.key]}
            onChange={(value: unknown) => {
              const newValues = { ...recordValues, [field.key]: value };
              // Handle save logic here
            }}
          />
        );
      })}

      <View style={styles.actions}>
        <Button title="Cancel" onPress={onCancel} />
        <Button title="Save" onPress={() => onSave(recordValues)} />
      </View>
    </ScrollView>
  );
}

function getFieldTypeComponent(type: string): any {
  const components: Record<string, any> = {
    text: TextFieldComponent,
    longText: LongTextFieldComponent,
    number: NumberFieldComponent,
    currency: CurrencyFieldComponent,
    date: DateFieldComponent,
    boolean: BooleanFieldComponent,
    select: SelectFieldComponent,
    multiSelect: MultiSelectFieldComponent,
    rating: RatingFieldComponent,
    photo: PhotoField,
    location: LocationField,
    barcode: BarcodeScannerField,
  };

  return components[type] || Text;
}
```

---

## 📤 Phase 3: Export Functionality (Weeks 9-10)

### Technical Architecture

```
src/
└── services/
    └── export-import/
        ├── csv-export.ts            # CSV generation
        ├── json-export.ts           # JSON export with attachments
        ├── pdf-report.ts            # PDF summary reports
        └── import-csv.ts            # Import projects from CSV
```

### CSV Export Implementation

```typescript
// src/services/export-import/csv-export.ts
import { Sharing } from 'expo-sharing';

export async function exportRecordsAsCSV(projectId: string, records: any[]): Promise<string> {
  // Get template to know field order
  const template = await templateStorage.getById(templateId);
  
  // Generate CSV header with template fields
  const headers = template.fields.map(f => f.label).join(',');
  
  // Generate CSV rows
  const rows = records.map(r => {
    const values = r.values as Record<string, unknown>;
    return template.fields
      .map(f => formatCSVValue(values[f.key]))
      .join(',');
  });

  const csvContent = headers + '\n' + rows.join('\n');
  
  // Save to file
  const path = await getExportPath();
  await File.writeAsStringAsync(path, csvContent);
  
  // Share or save
  await Sharing.openDocumentAsync(
    'export.csv',
    path,
    { mimeType: 'text/csv', UTI: null }
  );

  return path;
}

function formatCSVValue(value: unknown): string {
  const str = String(value ?? '').trim();
  
  // If contains comma or quote, wrap in quotes and escape internal quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}
```

---

## 🎯 Recommended Next Steps

1. **Start Phase 0** - Create the data models and storage services
2. **Set up TypeScript types** in `src/types/data-collection.ts`
3. **Build Project Storage** service first (simplest to implement)
4. **Test with mock data** before migration

Would you like me to:
- Generate the actual code files for Phase 0?
- Create visual wireframes for the new screens?
- Implement a specific feature in detail?
