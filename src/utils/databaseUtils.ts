import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { mockInventory } from '../data/mockInventory';
import { databaseService } from '../services/DatabaseService';
import { loadInventory } from '../store/inventoryStore';
import { AppDispatch } from '../store/store';
import { loadSettings } from '../store/userStore';
import { populateRandomItems } from './devPopulate';

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

        // Dev: populate 50 random items once per device to make development easier
        if (__DEV__) {
          try {
            const flag = await AsyncStorage.getItem('dev_populated');
            if (!flag) {
              await populateRandomItems(50);
              await AsyncStorage.setItem('dev_populated', '1');
            }
          } catch (err) {
            console.error('Dev populate failed:', err);
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