// __tests__/setup.ts
// Jest setup and test utilities
import { jest } from '@jest/globals';

// In-memory storage for AsyncStorage mock
const mockStorage: { [key: string]: string } = {};

// Mock AsyncStorage with in-memory store
jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    getItem: jest.fn(async (key: string) => mockStorage[key] || null),
    setItem: jest.fn(async (key: string, value: string) => {
      mockStorage[key] = value;
    }),
    removeItem: jest.fn(async (key: string) => {
      delete mockStorage[key];
    }),
    clear: jest.fn(async () => {
      Object.keys(mockStorage).forEach(key => delete mockStorage[key]);
    }),
    getAllKeys: jest.fn(async () => Object.keys(mockStorage)),
    multiGet: jest.fn(async (keys: string[]) => 
      keys.map(key => [key, mockStorage[key] || null])
    ),
    multiSet: jest.fn(async (pairs: [string, string][]) => {
      pairs.forEach(([key, value]) => {
        mockStorage[key] = value;
      });
    }),
    multiRemove: jest.fn(async (keys: string[]) => {
      keys.forEach(key => delete mockStorage[key]);
    }),
  },
}));

// Mock NetInfo
jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: jest.fn(() => jest.fn()),
    fetch: jest.fn(async () => ({})),
    refresh: jest.fn(async () => ({})),
  },
}));

// Mock Firebase
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(),
}));

jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn((auth, callback: any) => {
    callback(null);
    return jest.fn();
  }),
}));

jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(),
  collection: jest.fn(),
  doc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  getDocs: jest.fn(),
  updateDoc: jest.fn(),
  serverTimestamp: jest.fn(() => new Date()),
  arrayUnion: jest.fn(),
}));

// Setup test timeout
jest.setTimeout(10000);

// Test utilities
export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockUser = {
  uid: 'test-user-123',
  email: 'test@example.com',
  displayName: 'Test User',
};

export const mockItem = {
  id: 'test-item-1',
  name: 'Test Item',
  category: 'jewelry',
  location: 'safe',
  createdAt: Date.now(),
  updatedAt: Date.now(),
};
