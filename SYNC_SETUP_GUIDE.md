# Offline-First Sync + Cloud Sync Setup Guide

## ✅ What's Been Built

### Phase 1: Firebase Auth + Local Operations Queue ✓
- Firebase Authentication integration
- Redux auth state management
- Operations queue (records all mutations offline)
- AsyncStorage persistence

### Phase 2: Firestore Schema + Sync Engine ✓
- Complete Firestore collection structure
- Push/Pull/Merge sync logic
- Conflict detection & resolution (LWW + field-merge)
- SyncService with connectivity listeners
- Auto-sync on network changes
- Periodic sync (every 30s if pending ops)

---

## 🚀 Quick Start

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project (or use existing)
3. Enable Authentication:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Email/Password**
4. Enable Firestore Database:
   - Go to **Firestore Database**
   - Click **Create Database**
   - Start in **Production mode** (we'll add rules next)
5. Copy your project credentials:
   - Project settings → General tab
   - Copy config values

### Step 2: Configure Environment

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in Firebase credentials:
   ```
   EXPO_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   EXPO_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

### Step 3: Add Firestore Security Rules

1. In Firebase Console: **Firestore Database** → **Rules** tab
2. Replace with contents of `firebaseRules.txt`:
   ```
   Copy entire content from firebaseRules.txt
   Paste into Firebase Rules editor
   Publish rules
   ```

### Step 4: Start Dev Server

```bash
npm install  # Already done, but fresh just in case
npm start
```

---

## 📱 Testing the Sync

### Test 1: Basic Auth
```
1. Launch app
2. Sign up: test@example.com / password123
3. Check Redux DevTools → auth store
   Expected: user.uid, user.email populated
```

### Test 2: Create & Auto-Sync
```
1. Sign in
2. Add a new collection item
3. Watch Redux DevTools:
   - sync.operationQueue grows (+1 op)
   - sync.syncing = true (during sync)
   - sync.lastSyncTime updates
4. Open Firebase Console → Firestore:
   - See new document in /users/{uid}/collections/
   - See operation in /users/{uid}/operations/
```

### Test 3: Offline → Online
```
1. Go to Airplane Mode (or DevTools → offline)
2. Add/edit 2-3 items
3. Check Redux: sync.operationQueue has multiple ops
4. Go back online
5. Watch auto-sync trigger
6. Verify in Firebase Console
```

### Test 4: Conflict Resolution
```
1. Simulate conflict:
   - Device A: Edit item offline → go online (device B syncs first)
   - Device B: Edit SAME item online
   - Device A goes online → conflict detected
2. Check Redux: sync.conflictedItems populated
3. LWW strategy auto-resolves (Device B wins, newer timestamp)
```

---

## 🏗️ Architecture Components

### Services
- **AuthService**: Firebase auth (sign-up, sign-in, sign-out)
- **SyncService**: Connectivity listener + sync orchestrator
- **SyncEngine**: Push/pull/merge logic
- **ConflictResolver**: LWW + field-merge strategies
- **OpQueueService**: Local operation queue (AsyncStorage)
- **BackupService**: Encrypted backups (TODO: replace XOR)
- **FirestoreSchema**: Firestore data access layer
- **FirestoreInitializer**: One-time user setup

### Redux State
- **authStore**: user, loading, error, isAuthenticated
- **syncStore**: operationQueue, syncing, conflictedItems, lastSyncTime

### Utilities
- **encryption.ts**: Placeholder XOR (needs AES-256 upgrade)

---

## 📊 Data Flow

```
User edits item
    ↓
DatabaseService.saveCollectionItem()
    ↓
OpQueueService.recordOperation() + Redux dispatch
    ↓
AsyncStorage (persisted)
    ↓
[Offline: Stop here]
[Online: Continue]
    ↓
SyncService detects connectivity
    ↓
SyncEngine.fullSync():
  1. Push: ops → Firestore
  2. Pull: Firestore → local
  3. Merge: conflict resolution
    ↓
Redux: syncing=false, lastSyncTime=now
    ↓
UI: Sync complete indicator
```

---

## 🔐 Security

### Current
- ✓ Firebase Auth (email/password)
- ✓ Firestore rules (user-only access)
- ✓ TLS transport (Firebase default)

### Needed for Production
- [ ] Replace XOR encryption with AES-256-GCM
- [ ] Add data validation in Firestore rules
- [ ] Enable rate limiting
- [ ] Audit logging
- [ ] Support sharing with read-only rules (optional)

---

## 📋 Implementation Checklist

| Feature | Status | File | Notes |
|---------|--------|------|-------|
| Firebase Auth | ✓ Done | AuthService.ts | Email/password only |
| Operations Queue | ✓ Done | OpQueueService.ts | AsyncStorage persistence |
| Sync Engine | ✓ Done | SyncEngine.ts | Push/pull/merge working |
| Conflict Resolver | ✓ Done | ConflictResolver.ts | LWW + field-merge |
| Firestore Schema | ✓ Done | FirestoreSchema.ts | collections/ops/metadata |
| Connectivity Listener | ✓ Done | SyncService.ts | NetInfo integration |
| Periodic Sync | ✓ Done | SyncService.ts | 30s interval |
| Encrypted Backup | ⚠️ Partial | BackupService.ts | XOR placeholder |
| Conflict UI | ⏳ Pending | - | Need React component |
| E2E Tests | ⏳ Pending | - | Need test suite |
| Background Sync | ⏳ Pending | - | Task scheduler |

---

## 🔄 Next Steps

### High Priority
1. **Create Conflict Review UI** (conflict-resolution task)
   - Show conflicted items in Settings tab
   - Allow user to pick: local | remote | merged
   - Call `syncEngine.resolveConflict()`

2. **Replace XOR Encryption** (backup-encryption task)
   - Use `crypto-js` or `tweetnacl-js`
   - Implement AES-256-GCM
   - Add secure key derivation

### Medium Priority
3. **Add E2E Tests** (tests-e2e task)
   - Offline edit → sync
   - Conflicting edits → resolve
   - Backup → restore

4. **Background Sync** (background-sync task)
   - Use `expo-background-fetch` (mobile)
   - Use `expo-notifications` (periodic)

### Documentation
5. Update README.md with:
   - Cloud sync feature overview
   - Firebase setup instructions
   - Sync diagram

---

## 🐛 Troubleshooting

### "Firebase not initialized"
- Check `.env.local` has all credentials
- Verify `firebaseConfig.ts` is exporting correctly

### "Firestore permission denied"
- Check security rules are published
- Verify user is authenticated (Redux auth.user exists)
- Check user UID in Firestore path

### "Operations not syncing"
- Check NetInfo connectivity
- Verify SyncService started (check console logs)
- Check Firestore rules allow writes

### "Conflicts not resolving"
- LWW strategy should auto-resolve in SyncEngine
- Check Redux sync.conflictedItems
- Manually call syncEngine.resolveConflict() if needed

---

## 📖 Documentation Files

- **README.md** - Project overview (update needed)
- **FIREBASE_SYNC_SETUP.md** - Firebase auth setup
- **FIRESTORE_SYNC_ENGINE.md** - Sync architecture & API reference
- **firebaseRules.txt** - Security rules (copy to Firestore)
- **.env.example** - Firebase credentials template

---

## 🎯 Success Criteria

- [ ] Sign-up/sign-in works, user persists in Redux
- [ ] Offline edits recorded in OpQueue (AsyncStorage)
- [ ] Online sync triggers automatically (connectivity detected)
- [ ] Operations pushed to Firestore successfully
- [ ] Remote changes pulled and merged locally
- [ ] LWW conflict strategy resolves automatically
- [ ] Sync state updates in Redux (syncing, lastSyncTime)
- [ ] All operations cleared from queue after successful sync
- [ ] Works cross-device (sign in on Device B, see Device A's items)

---

## 📞 Support

For issues:
1. Check Firebase Console for errors
2. Review console logs (Expo CLI)
3. Check Redux DevTools (auth + sync state)
4. Verify Firestore rules are published
5. Test connectivity (airplane mode toggle)

---

**Built with Expo, Firebase, Redux Toolkit, and Firestore** 🚀
