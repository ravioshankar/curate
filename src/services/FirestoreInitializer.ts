// FirestoreInitializer.ts - One-time setup for Firestore collections and indexes
import { doc, getFirestore, setDoc } from 'firebase/firestore';

export async function initializeFirestoreForUser(app: any, userId: string) {
  const db = getFirestore(app);

  try {
    // Initialize user document
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, { created: new Date(), userId }, { merge: true });

    // Initialize metadata
    const metadataRef = doc(db, 'users', userId, 'metadata', 'sync');
    await setDoc(
      metadataRef,
      {
        userId,
        lastSyncTime: 0,
        localVersion: 0,
        remoteVersion: 0,
        conflicts: [],
      },
      { merge: true }
    );

    console.log('FirestoreInitializer: Firestore initialized for user', userId);
  } catch (error) {
    console.error('FirestoreInitializer: Failed to initialize Firestore', error);
    throw error;
  }
}

/**
 * FIRESTORE COLLECTION STRUCTURE:
 *
 * users/
 *   {userId}/
 *     created: timestamp
 *     collections/
 *       {itemId}/
 *         id: string
 *         name: string
 *         category: string
 *         location: string
 *         description: string
 *         images: string[] (URLs to Firebase Storage)
 *         estimatedValue: number
 *         currency: string
 *         createdAt: number
 *         updatedAt: number
 *         version: number
 *         deleted: boolean
 *         userId: string
 *
 *     operations/
 *       {operationId}/
 *         id: string
 *         type: 'create' | 'update' | 'delete'
 *         collectionName: string
 *         itemId: string
 *         data: {...}
 *         timestamp: number
 *         version: number
 *         userId: string
 *
 *     metadata/
 *       sync/
 *         userId: string
 *         lastSyncTime: number
 *         localVersion: number
 *         remoteVersion: number
 *         conflicts: string[] (conflicted item IDs)
 *
 * INDEXES REQUIRED (auto-created by Firebase):
 * - users/{userId}/collections: order by updatedAt DESC
 * - users/{userId}/operations: order by timestamp ASC
 */
