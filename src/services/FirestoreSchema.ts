// FirestoreSchema.ts - Firestore collection schema definitions & helpers
import { collection, doc, getDoc, getDocs, getFirestore, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';

export interface RemoteCollectionItem {
  id: string;
  userId: string;
  name: string;
  category: string;
  location: string;
  description?: string;
  images?: string[];
  estimatedValue?: number;
  currency?: string;
  createdAt: number;
  updatedAt: number;
  version: number; // for conflict detection
  deleted?: boolean; // soft delete marker
}

export interface RemoteOperation {
  id: string;
  userId: string;
  type: 'create' | 'update' | 'delete';
  collectionName: string;
  itemId: string;
  data: any;
  timestamp: number;
  version: number;
}

export interface SyncMetadata {
  userId: string;
  lastSyncTime: number;
  localVersion: number;
  remoteVersion: number;
  conflicts: string[]; // item IDs with conflicts
}

let db = null as any;

export function initFirestore(app: any) {
  if (!db) {
    db = getFirestore(app);
  }
  return db;
}

// ====== Collections (user-specific) ======

export async function saveRemoteCollectionItem(userId: string, item: RemoteCollectionItem) {
  const docRef = doc(db, 'users', userId, 'collections', item.id);
  await setDoc(docRef, {
    ...item,
    userId,
    serverTimestamp: serverTimestamp(),
  });
}

export async function getRemoteCollectionItem(userId: string, itemId: string): Promise<RemoteCollectionItem | null> {
  const docRef = doc(db, 'users', userId, 'collections', itemId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as RemoteCollectionItem) : null;
}

export async function getRemoteCollectionItems(userId: string): Promise<RemoteCollectionItem[]> {
  const q = query(collection(db, 'users', userId, 'collections'), where('deleted', '!=', true));
  const querySnap = await getDocs(q);
  return querySnap.docs.map(doc => doc.data() as RemoteCollectionItem);
}

export async function deleteRemoteCollectionItem(userId: string, itemId: string) {
  const docRef = doc(db, 'users', userId, 'collections', itemId);
  await updateDoc(docRef, { deleted: true, updatedAt: Date.now() });
}

// ====== Operations Journal (audit trail) ======

export async function recordRemoteOperation(userId: string, operation: RemoteOperation) {
  const docRef = doc(db, 'users', userId, 'operations', operation.id);
  await setDoc(docRef, {
    ...operation,
    userId,
    serverTimestamp: serverTimestamp(),
  });
}

export async function getRemoteOperationsSince(userId: string, sinceTime: number): Promise<RemoteOperation[]> {
  const q = query(
    collection(db, 'users', userId, 'operations'),
    where('timestamp', '>', sinceTime)
  );
  const querySnap = await getDocs(q);
  return querySnap.docs.map(doc => doc.data() as RemoteOperation).sort((a, b) => a.timestamp - b.timestamp);
}

// ====== Sync Metadata ======

export async function getSyncMetadata(userId: string): Promise<SyncMetadata | null> {
  const docRef = doc(db, 'users', userId, 'metadata', 'sync');
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? (docSnap.data() as SyncMetadata) : null;
}

export async function updateSyncMetadata(userId: string, metadata: Partial<SyncMetadata>) {
  const docRef = doc(db, 'users', userId, 'metadata', 'sync');
  await setDoc(docRef, { userId, ...metadata }, { merge: true });
}

// ====== Batch operations ======

export async function batchPushOperations(userId: string, operations: RemoteOperation[]) {
  for (const op of operations) {
    await recordRemoteOperation(userId, op);
  }
}

export async function batchUpdateCollections(userId: string, items: RemoteCollectionItem[]) {
  for (const item of items) {
    await saveRemoteCollectionItem(userId, item);
  }
}
