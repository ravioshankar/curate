// AuthService.ts - Firebase auth integration skeleton
import { FirebaseApp, initializeApp } from 'firebase/app';
import { createUserWithEmailAndPassword, signOut as fbSignOut, getAuth, onAuthStateChanged, signInWithEmailAndPassword, User } from 'firebase/auth';
import { store } from '@/src/store/store';
import { setUser, setAuthError, setAuthLoading } from '@/src/store/authStore';
import { initializeFirestoreForUser } from './FirestoreInitializer';

let app: FirebaseApp | null = null;
let auth = null as any;

export function initFirebase(config: any) {
  if (!app) {
    app = initializeApp(config);
    auth = getAuth(app);

    // Listen to auth state changes and dispatch to Redux
    onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Initialize Firestore for this user on first auth
        try {
          await initializeFirestoreForUser(app, user.uid);
        } catch (error) {
          console.error('Failed to initialize Firestore:', error);
        }

        store.dispatch(setUser({
          uid: user.uid,
          email: user.email || '',
          displayName: user.displayName || undefined,
        }));
      } else {
        store.dispatch(setUser(null));
      }
    });
  }
}

export async function signUp(email: string, password: string) {
  if (!auth) throw new Error('Firebase not initialized');
  store.dispatch(setAuthLoading(true));
  try {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    store.dispatch(setAuthLoading(false));
    return result;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  }
}

export async function signIn(email: string, password: string) {
  if (!auth) throw new Error('Firebase not initialized');
  store.dispatch(setAuthLoading(true));
  try {
    const result = await signInWithEmailAndPassword(auth, email, password);
    store.dispatch(setAuthLoading(false));
    return result;
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  }
}

export async function signOut() {
  if (!auth) return;
  try {
    await fbSignOut(auth);
    store.dispatch(setUser(null));
  } catch (error: any) {
    store.dispatch(setAuthError(error.message));
    throw error;
  }
}

export function getCurrentUser(): User | null {
  if (!auth) return null;
  return auth.currentUser || null;
}
