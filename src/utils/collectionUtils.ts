import { CollectionItem, CollectionStats } from '../types/collection';

export const calculateCollectionStats = (collection: CollectionItem[]): CollectionStats => {
  if (!collection || !Array.isArray(collection)) {
    return { totalItems: 0, categories: 0, unusedItems: 0 };
  }

  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const unusedItems = collection.filter(item => {
    const lastUsedDate = new Date(item.lastUsed);
    return lastUsedDate < oneYearAgo;
  });

  return {
    totalItems: collection.length,
    categories: new Set(collection.map(item => item.category)).size,
    unusedItems: unusedItems.length,
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const filterCollection = (collection: CollectionItem[], searchText: string): CollectionItem[] => {
  if (!collection || !Array.isArray(collection)) return [];
  if (!searchText) return collection;
  
  const search = searchText.toLowerCase();
  return collection.filter(item =>
    item.name.toLowerCase().includes(search) ||
    item.category.toLowerCase().includes(search) ||
    item.location.toLowerCase().includes(search)
  );
};