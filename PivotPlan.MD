# iQRate Pivot Plan: Data Collection Platform

## Product Thesis

iQRate should evolve from a personal inventory tracker into an offline-first data collection platform for structured field capture, audits, inspections, research logs, asset records, and lightweight operational workflows.

The strongest path is not to abandon inventory. Instead, inventory becomes one built-in template inside a more flexible platform. This preserves the current product DNA while opening iQRate to broader use cases.

## Positioning

iQRate helps users create reusable data templates, collect structured records quickly, attach evidence, review data quality, and export usable datasets.

Target use cases:

- Asset inventories
- Property inspections
- Equipment audits
- Research observations
- Client or participant intake
- Maintenance logs
- Collection cataloging
- Insurance documentation
- Field surveys

## North Star

A user should be able to:

1. Create or choose a data collection template.
2. Start a project from that template.
3. Capture records offline with photos, location, timestamps, and structured fields.
4. Review completeness and quality.
5. Export the dataset as CSV or JSON.

## Core Product Concepts

### Project

A project groups records around a real-world data collection job.

Examples:

- Warehouse Audit May 2026
- Rental Property Inspections
- Museum Collection Catalog
- Field Research Observations

Project fields:

- `id`
- `name`
- `description`
- `templateIds`
- `createdAt`
- `updatedAt`
- `status`
- `settings`

### Template

A template defines the structure of records collected inside a project.

Examples:

- Inventory Item
- Inspection Checklist
- Client Intake
- Maintenance Log
- Research Observation

Template fields:

- `id`
- `name`
- `description`
- `fields`
- `createdAt`
- `updatedAt`
- `version`

### Field

A field is one piece of structured data in a template.

Initial field types:

- Text
- Long text
- Number
- Currency
- Date
- Boolean
- Single select
- Multi select
- Rating
- Photo
- Location
- Barcode or QR code

Field settings:

- Required
- Placeholder
- Help text
- Default value
- Options
- Min/max for numbers
- Validation pattern
- Visible in list/table

### Record

A record is one collected entry.

Record fields:

- `id`
- `projectId`
- `templateId`
- `values`
- `attachments`
- `metadata`
- `status`
- `createdAt`
- `updatedAt`
- `submittedAt`

Record statuses:

- Draft
- Submitted
- Needs review
- Approved
- Archived

### Attachment

Attachments store evidence and context.

Initial attachment types:

- Photo
- Document
- Receipt

Later attachment types:

- Audio note
- Video
- Signature

## Proposed Data Model

```ts
type FieldType =
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

interface DataProject {
  id: string;
  name: string;
  description?: string;
  templateIds: string[];
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

interface DataTemplate {
  id: string;
  name: string;
  description?: string;
  version: number;
  fields: TemplateField[];
  createdAt: string;
  updatedAt: string;
}

interface TemplateField {
  id: string;
  label: string;
  key: string;
  type: FieldType;
  required?: boolean;
  placeholder?: string;
  helpText?: string;
  defaultValue?: unknown;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  display?: {
    showInList?: boolean;
    showInTable?: boolean;
    width?: number;
  };
}

interface DataRecord {
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
}

interface DataAttachment {
  id: string;
  recordId: string;
  fieldKey?: string;
  type: 'photo' | 'document' | 'receipt';
  uri: string;
  fileName?: string;
  mimeType?: string;
  createdAt: string;
}

interface RecordMetadata {
  capturedAt?: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  deviceId?: string;
  appVersion?: string;
}
```

## MVP Feature Set

### 1. Projects

Users can create, rename, archive, and open projects.

Minimum screens:

- Projects list
- Create project
- Project detail

Acceptance criteria:

- A user can create a project from a built-in template.
- A project shows record count and last updated date.
- Archived projects are hidden by default but recoverable.

### 2. Built-In Template Library

Start with a small template library instead of blank-slate template creation only.

Initial templates:

- Inventory Item
- Inspection Checklist
- Asset Audit
- Maintenance Log
- Research Observation

Acceptance criteria:

- A user can preview fields before choosing a template.
- Existing inventory data maps to the Inventory Item template.

### 3. Template Builder

Users can create and edit custom templates.

MVP field types:

- Text
- Number
- Date
- Boolean
- Select
- Photo
- Notes

Acceptance criteria:

- A user can add, reorder, rename, and delete fields.
- Required fields are supported.
- Select fields support options.

### 4. Dynamic Record Form

Replace the fixed item form with a template-driven form renderer.

Acceptance criteria:

- The form renders fields from the selected template.
- Required fields block submission.
- Draft records can be saved without all required fields.
- Submitted records show validation errors clearly.

### 5. Records View

Users need to review collected data, not just enter it.

Views:

- Mobile-friendly list view
- Table-style review view

MVP controls:

- Search
- Sort
- Filter by status
- Filter by template

Acceptance criteria:

- A user can find records by text search.
- A user can edit a record from the list.
- A user can identify incomplete records quickly.

### 6. Export

Export is essential to the platform pivot.

MVP formats:

- CSV
- JSON

Later:

- PDF summary
- ZIP with attachments
- Excel

Acceptance criteria:

- A user can export all records in a project.
- CSV includes stable column headers from template fields.
- JSON preserves full values, attachments, metadata, and statuses.

### 7. Offline-First Persistence

The app should remain useful in the field.

Acceptance criteria:

- Records save locally without network.
- Every saved record has a clear local timestamp.
- Export works from local data.

## Phase Plan

### Phase 0: Foundation Cleanup

Goal: prepare the existing codebase for generic data collection.

Tasks:

- Introduce `DataProject`, `DataTemplate`, `TemplateField`, and `DataRecord` types.
- Add storage services for projects, templates, and records.
- Keep current `CollectionItem` support temporarily.
- Create an inventory template that mirrors current inventory fields.
- Create migration utilities from `CollectionItem` to `DataRecord`.

Deliverable:

- Existing inventory data can be represented as records under an Inventory project.

### Phase 1: MVP Collection Flow

Goal: users can create projects and collect records.

Tasks:

- Build project list and project detail screens.
- Add built-in template selector.
- Build dynamic record form renderer.
- Add draft/submitted statuses.
- Save records locally.

Deliverable:

- A user can create a project and collect structured records offline.

### Phase 2: Review and Export

Goal: collected data becomes useful outside the app.

Tasks:

- Build records list and table view.
- Add search, filters, and sorting.
- Add CSV export.
- Add JSON export.
- Add missing required fields indicator.

Deliverable:

- A user can collect, review, and export a usable dataset.

### Phase 3: Template Builder

Goal: users can create custom workflows.

Tasks:

- Add custom template builder.
- Add field reordering.
- Add field validation rules.
- Add template duplication.
- Add template versioning basics.

Deliverable:

- A user can create a custom data collection workflow without code.

### Phase 4: Evidence and Metadata

Goal: records become richer and more trustworthy.

Tasks:

- Add photo fields.
- Add attachment gallery per record.
- Add optional location capture.
- Add capture timestamps and metadata display.
- Add attachment-aware export.

Deliverable:

- Users can collect field evidence with structured records.

### Phase 5: Platform Expansion

Goal: prepare for professional/team use.

Tasks:

- Add review workflow.
- Add project import from CSV.
- Add cloud sync design.
- Add account/workspace model.
- Add collaboration and assignment model.

Deliverable:

- iQRate can move from single-user local tool to collaborative data platform.

## Suggested Navigation

MVP tabs:

- Projects
- Collect
- Records
- Insights
- Settings

Alternative minimal tabs:

- Projects
- Records
- Templates
- Profile

Recommendation:

Use Projects, Records, Templates, Profile for the first pivot. It is simpler and maps directly to the new data model.

## Migration Strategy

Existing iQRate inventory should become the first built-in data collection experience.

Migration mapping:

- `CollectionItem` becomes `DataRecord`
- `name`, `category`, `location`, `lastUsed`, `pricePaid`, `priceExpected`, `notes`, and image fields become `values`
- `priceHistory` can remain a nested value or become a specialized attachment/history extension
- All migrated records belong to an automatically created project named `My Inventory`
- The generated template is named `Inventory Item`

Do not remove old inventory types immediately. Keep them as compatibility types until the migration has been tested.

## First Technical Milestones

1. Add generic data collection types.
2. Add template seed data.
3. Add project/record storage service.
4. Build migration from inventory to project records.
5. Replace dashboard entry point with Projects.
6. Build dynamic record form.
7. Add CSV/JSON export.

## Open Product Questions

- Is the first target user a solo collector, field worker, researcher, small business, or team?
- Should cloud sync be part of the first public pivot release or deferred?
- Should valuation remain as a specialized inventory template feature?
- Should templates be project-specific, global, or both?
- How much spreadsheet-like editing is needed in the first release?
- Should record submission be formal, or is save/edit enough for MVP?

## Risks

- A fully generic template builder can become complex quickly.
- Export quality matters because users will judge the platform by the resulting dataset.
- Media attachments can complicate storage, backup, and export.
- Migration must preserve existing inventory users' data and mental model.
- Too many field types early will slow down the pivot.

## Recommended Next Build

Start with the smallest useful slice:

1. Create `DataTemplate`, `DataProject`, and `DataRecord` types.
2. Seed an `Inventory Item` template.
3. Create a `Projects` screen.
4. Create a template-driven record form.
5. Store records locally.
6. Export project records to CSV.

This creates a real data collection platform while keeping iQRate recognizable.

## MVP Backlog

Use these as implementation tickets for the first pivot cycle.

### P0: Must Have

- Add generic data model types for projects, templates, fields, records, attachments, and metadata.
- Add local storage APIs for projects, templates, and records.
- Seed built-in templates, starting with Inventory Item.
- Add Projects tab/screen.
- Add Create Project flow.
- Add Project Detail screen with record count and recent records.
- Add template-driven Record Form screen.
- Add required field validation.
- Add Record List screen scoped to a project.
- Add CSV export for project records.
- Add migration path from existing collection items to Inventory Item records.

### P1: Should Have

- Add JSON export.
- Add custom template builder.
- Add select field option editor.
- Add record status filters.
- Add incomplete record indicators.
- Add table-like record review mode.
- Add photo field support.
- Add project archive/unarchive.

### P2: Later

- Add location field support.
- Add barcode/QR scanning.
- Add PDF summaries.
- Add ZIP export with attachments.
- Add CSV import.
- Add template version history.
- Add review/approval workflow.
- Add cloud sync and workspaces.
- Add collaboration and record assignment.

## First Sprint Proposal

Goal: prove the pivot with one end-to-end flow.

Sprint scope:

1. Define data collection types.
2. Seed Inventory Item and Inspection Checklist templates.
3. Add storage slices/services for templates, projects, and records.
4. Add Projects screen.
5. Add Create Project screen using built-in templates.
6. Add Dynamic Record Form for text, number, date, boolean, select, and notes.
7. Add Project Records list.

Out of scope for first sprint:

- Custom template builder
- Photo attachments
- Cloud sync
- Team collaboration
- Advanced validation

Definition of done:

- A user can create a project from a built-in template.
- A user can add at least one record to the project.
- The record persists after app restart.
- The project detail view shows the saved record.
- Existing TypeScript and lint checks remain passing with no new errors.

## Second Sprint Proposal

Goal: make collected data useful.

Sprint scope:

1. Add CSV export.
2. Add JSON export.
3. Add required field completeness summary.
4. Add search/filter/sort to project records.
5. Add migration from existing inventory to a default My Inventory project.
6. Add record edit flow.

Definition of done:

- Existing inventory users see their data represented in the new project model.
- A user can export a project to CSV.
- Exported CSV has stable headers and rows that match visible records.
- Incomplete records are easy to identify.

## UX Principles

- Start with the working data experience, not a marketing page.
- Keep capture flows fast and thumb-friendly.
- Make the current project obvious at all times.
- Prefer direct manipulation over configuration-heavy screens.
- Treat exports as a first-class outcome.
- Show data quality issues without blocking draft capture.
- Keep inventory familiar as a built-in workflow.

## Architecture Notes

Recommended folder direction:

```txt
src/
  types/
    dataCollection.ts
  data/
    builtInTemplates.ts
  services/
    DataCollectionService.ts
    ExportService.ts
    DataMigrationService.ts
  store/
    projectStore.ts
    templateStore.ts
    recordStore.ts
  screens/
    ProjectsScreen.tsx
    ProjectDetailScreen.tsx
    TemplateLibraryScreen.tsx
    RecordFormScreen.tsx
    RecordsScreen.tsx
  components/
    data/
      DynamicFieldRenderer.tsx
      FieldEditor.tsx
      RecordList.tsx
      RecordTable.tsx
```

Implementation guidance:

- Keep the first data model local-first.
- Avoid adding a backend until local project/template/record flows are stable.
- Keep `CollectionItem` as a compatibility type until migration is complete.
- Make built-in templates plain TypeScript data so they are easy to test and version.
- Keep export logic separate from UI components.

## Decision Log

| Decision | Status | Reason |
| --- | --- | --- |
| Preserve inventory as a built-in template | Accepted | Reduces churn for existing users and keeps current value intact. |
| Build offline-first before cloud sync | Accepted | Matches current app architecture and field collection use cases. |
| Start with built-in templates before custom builder | Accepted | Lets users experience value faster and reduces early complexity. |
| Make CSV export part of MVP | Accepted | A data platform is only useful if users can use the data elsewhere. |
| Defer collaboration | Accepted | Team features require auth, sync, permissions, and conflict resolution. |

## Success Metrics

MVP success indicators:

- Time to create first project: under 60 seconds.
- Time to submit first record: under 90 seconds.
- Export success rate: above 95%.
- Migration preserves 100% of existing inventory records.
- At least three built-in templates are usable without customization.

Product validation indicators:

- Users create more than one project.
- Users export data more than once.
- Users create or request custom templates.
- Users attach evidence or metadata to records.
- Users ask for sharing or sync after using local collection.
