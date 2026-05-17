# Firestore Schema & Sync Engine Documentation

## Architecture Overview

```
Local Device              Firestore Cloud
─────────────────────────────────────────────
SQLite DB          ← Sync Engine (push/pull) → Collections
  ├─ collections   ← Conflict Resolver         ├─ collections
  ├─ items                                     ├─ operations
  ├─ settings      ← OpQueue                   ├─ metadata
                   (offline buffer)            └─ security rules

Redux Store (Auth + Sync)
  ├─ auth.user
  ├─ sync.operationQueue
  ├─ sync.conflictedItems
  └─ sync.lastSyncTime
```

---

## Firestore Collection Structure

### `/users/{userId}/`
Root user document
- `created` (timestamp) — when user account was created
- `userId` (string) — user UID

### `/users/{userId}/collections/{itemId}`
Collection items (user's curated belongings)
```typescript
{
  id: string,                    // unique item ID
  userId: string,                // owner's UID
  name: string,                  // item name
  category: string,              // category (e.g., "jewelry")
  location: string,              // where stored
  description?: string,          // notes
  images?: string[],             // Firebase Storage URLs
  estimatedValue?: number,       // valuation
  currency?: string,             // currency code (e.g., "USD")
  createdAt: number,             // local timestamp
  updatedAt: number,             // last modified
  version: number,               // for conflict detection
  deleted?: boolean,             // soft delete marker
  serverTimestamp: timestamp     // Firebase server time (auto)
}
```

### `/users/{userId}/operations/{operationId}`
Operation journal (audit trail for sync)
```typescript
{
  id: string,                    // unique operation ID (uuid)
  userId: string,                // owner's UID
  type: 'create' | 'update' | 'delete',
  collectionName: string,        // 'collections' (future: other types)
  itemId: string,                // affected item ID
  data: any,                     // full item or deletion marker
  timestamp: number,             // when operation occurred (local)
  version: number,               // operation version for ordering
  serverTimestamp: timestamp     // Firebase server time (auto)
}
```

### `/users/{userId}/metadata/sync`
Sync metadata & conflict tracking
```typescript
{
  userId: string,                // owner's UID
  lastSyncTime: number,          // timestamp of last successful sync
  localVersion: number,          // local operations count
  remoteVersion: number,         // remote operations count
  conflicts: string[],           // item IDs with unresolved conflicts
}
```

---

## Sync Flow: Full Cycle

### 1. **Offline Phase** (no internet)
- User edits collection item in app
- DatabaseService saves to SQLite
- OpQueueService automatically records operation:
  - Stores to AsyncStorage (persisted)
  - Dispatches to Redux (for UI indicators)
- App remains fully functional

### 2. **Connectivity Detected** (online)
- SyncService listens via NetInfo
- On connectivity change → auto-triggers `syncNow()`
- Or periodic sync every 30 seconds (if pending ops exist)

### 3. **Push Phase** (send local → Firestore)
```
Local Op Queue               Firestore
─────────────────────────────────────
create item_1       →    /users/{uid}/operations/op_1
update item_2       →    /users/{uid}/operations/op_2
delete item_3       →    /users/{uid}/operations/op_3
```
- SyncEngine reads op queue from AsyncStorage
- Converts to RemoteOperation objects
- Batch pushes to `/users/{uid}/operations/{opId}` collection
- Marks operations as synced locally (removes from queue)

### 4. **Pull Phase** (receive remote → local)
```
Firestore                        Local SQLite
─────────────────────────────────────────────
/users/{uid}/operations/?        ← query by timestamp > lastSyncTime
timestamp > lastSyncTime
  │
  ├─ remote op_A (update)    →    Fetch remote item
  ├─ remote op_B (delete)    →    Check local version
  └─ remote op_C (create)    →    Conflict detect + resolve
                             →    Apply to SQLite
```
- SyncEngine queries `/users/{uid}/operations` where `timestamp > lastSyncTime`
- For each remote operation:
  - **If create**: save to local SQLite
  - **If update**: check if local version exists
    - **No conflict**: save remote
    - **Conflict**: resolve via ConflictResolver → save winner/merge
  - **If delete**: mark local item as deleted
- Update metadata: `lastSyncTime = now`

### 5. **Conflict Detection** (during pull)
```typescript
ConflictResolver.detect(local, remote):
  - Compare updatedAt timestamps
  - If both modified independently → CONFLICT
  - Apply conflict strategy (LWW, field-merge)
```

**Last-Write-Wins (LWW)** [default]
- Compare `updatedAt` timestamps
- Remote timestamp ≥ Local → use remote
- Otherwise → use local

**Field-Level Merge**
- Compare each field independently
- Newest value for each field wins
- Better UX but more complex

### 6. **Conflict Resolution UI** (manual review)
- Conflicts stored in Redux: `sync.conflictedItems`
- App displays conflict review screen
- User chooses: local | remote | merged
- `syncEngine.resolveConflict()` called
- Resolved item saved + operation queued for next sync

---

## Sync State Machine

```
┌─────────────────────────────────────────────────┐
│  OFFLINE (no internet)                          │
│  ├─ Edits go to SQLite + OpQueue (AsyncStorage) │
│  └─ Redux: syncing=false, lastSyncTime=X        │
└─────────────────────────────────────────────────┘
           ↓ (connectivity restored)
┌─────────────────────────────────────────────────┐
│  SYNCING (in progress)                          │
│  ├─ Redux: syncing=true                         │
│  ├─ Push pending ops to Firestore               │
│  ├─ Pull remote changes                         │
│  └─ Merge with conflict resolution              │
└─────────────────────────────────────────────────┘
           ↓ (sync complete or error)
┌─────────────────────────────────────────────────┐
│  ONLINE / SYNCED (or ERROR)                     │
│  ├─ Redux: syncing=false, lastSyncTime=now      │
│  ├─ If conflicts: show review screen            │
│  └─ OpQueue cleared (synced ops removed)        │
└─────────────────────────────────────────────────┘
```

---

## Firestore Security Rules

```
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      match /collections/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }

      match /operations/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }

      match /metadata/{document=**} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Key Security Features:**
- ✓ Users can only access their own `/users/{uid}/` documents
- ✓ Auth-based access control (no sharing by default)
- ✓ Deny-all default for undefined paths
- ✓ No batch writes (sequential writes safer)

**Future Enhancements:**
- Add data validation (name length, value limits)
- Add rate limiting (prevent sync spam)
- Add encryption at rest (GCP KMS)
- Support sharing with read-only rules

---

## API Reference

### SyncEngine

```typescript
const syncEngine = new SyncEngine('lww');  // LWW strategy

// Full sync: push → pull → merge
await syncEngine.fullSync(userId);

// Push local ops to Firestore
await syncEngine.push(userId);

// Pull remote changes
await syncEngine.pull(userId);

// Resolve a conflict after user decision
await syncEngine.resolveConflict(itemId, 'remote');
await syncEngine.resolveConflict(itemId, 'merged', mergedData);
```

### ConflictResolver

```typescript
// Detect conflict
const hasConflict = ConflictResolver.detect(local, remote);

// Resolve with strategy
const resolution = ConflictResolver.resolve(local, remote, 'lww');
// resolution: { strategy, winner, local, remote, resolved, timestamp }
```

### FirestoreSchema (data access)

```typescript
// Collections
await saveRemoteCollectionItem(userId, item);
const item = await getRemoteCollectionItem(userId, itemId);
const items = await getRemoteCollectionItems(userId);
await deleteRemoteCollectionItem(userId, itemId);

// Operations
await recordRemoteOperation(userId, op);
const ops = await getRemoteOperationsSince(userId, sinceTime);

// Metadata
const metadata = await getSyncMetadata(userId);
await updateSyncMetadata(userId, { lastSyncTime: now });
```

---

## Testing the Sync Engine

### Scenario 1: Simple Sync
1. Sign in user
2. Create item
3. SyncService auto-detects (30s timeout or connectivity)
4. Item pushed to Firestore
5. Verify in Firebase Console

### Scenario 2: Offline Edits
1. Go offline (airplane mode)
2. Edit multiple items
3. Check OpQueue in Redux (Chrome DevTools)
4. Go online
5. SyncService auto-syncs
6. All edits pushed

### Scenario 3: Conflict Resolution
1. Device A: Edit item X (offline)
2. Device B: Edit item X (online)
3. Device A: Go online
4. SyncService pulls Device B's changes
5. Conflict detected (both modified updatedAt)
6. LWW strategy resolves to Device B
7. User shown in Conflict Review UI

---

## Performance Considerations

| Aspect | Current | Improvement |
|--------|---------|------------|
| Push | Sequential writes | Batch write (if Firestore allows) |
| Pull | Query + apply per-op | Bulk apply |
| Conflict detection | Per-item compare | Bloom filter (if needed) |
| Backup size | Full snapshot | Delta backup |
| Encryption | XOR (not secure) | AES-256-GCM |

---

## Future Features

- [ ] CRDT-based conflict resolution (better than LWW)
- [ ] Collaborative editing (real-time updates)
- [ ] Selective sync (sync only certain categories)
- [ ] Backup to Firebase Storage (encrypted)
- [ ] Multi-device sync (cross-platform)
- [ ] Offline queue compression (merge ops)
- [ ] Sync analytics (push/pull metrics)
