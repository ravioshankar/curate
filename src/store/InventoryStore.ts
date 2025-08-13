import { create } from 'zustand';
import { InventoryItem } from '../types/inventory';
import { StorageService } from '../services/StorageService';
import { mockInventory } from '../data/mockInventory';

interface InventoryState {
  inventory: InventoryItem[];
  currentPage: string;
  isLoading: boolean;
  loadInventory: () => Promise<void>;
  addItem: (item: InventoryItem) => Promise<void>;
  setCurrentPage: (page: string) => void;
}

export const useInventoryStore = create<InventoryState>((set, get) => ({
  inventory: [],
  currentPage: 'home',
  isLoading: false,

  loadInventory: async () => {
    set({ isLoading: true });
    try {
      let inventory = await StorageService.getInventory();
      if (inventory.length === 0) {
        inventory = mockInventory;
        await StorageService.saveInventory(inventory);
      }
      set({ inventory, isLoading: false });
    } catch (error) {
      set({ inventory: mockInventory, isLoading: false });
    }
  },

  addItem: async (item: InventoryItem) => {
    const newInventory = await StorageService.addItem(item);
    set({ inventory: newInventory });
  },

  setCurrentPage: (page: string) => {
    set({ currentPage: page });
  },
}));