import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store';
import { loadInventory } from '../store/inventoryStore';
import { loadSettings } from '../store/userStore';
import { mockInventory } from '../data/mockInventory';
import { databaseService } from '../services/DatabaseService';

export const useDatabase = () => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        // Load settings
        dispatch(loadSettings());
        
        // Load inventory, add mock data if empty
        const items = await databaseService.getInventoryItems();
        if (items.length === 0) {
          // Add mock data to database
          for (const item of mockInventory) {
            await databaseService.saveInventoryItem(item);
          }
        }
        dispatch(loadInventory());
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initializeDatabase();
  }, [dispatch]);
};