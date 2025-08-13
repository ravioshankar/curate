import { InventoryItem, InventoryStats } from '../types/inventory';

export const calculateInventoryStats = (inventory: InventoryItem[]): InventoryStats => {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const unusedItems = inventory.filter(item => {
    const lastUsedDate = new Date(item.lastUsed);
    return lastUsedDate < oneYearAgo;
  });

  return {
    totalItems: inventory.length,
    categories: new Set(inventory.map(item => item.category)).size,
    unusedItems: unusedItems.length,
  };
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const filterInventory = (inventory: InventoryItem[], searchText: string): InventoryItem[] => {
  if (!searchText) return inventory;
  
  const search = searchText.toLowerCase();
  return inventory.filter(item =>
    item.name.toLowerCase().includes(search) ||
    item.category.toLowerCase().includes(search) ||
    item.location.toLowerCase().includes(search)
  );
};