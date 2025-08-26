import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { mockCollection } from '../data/mockCollection';
import { databaseService } from '../services/DatabaseService';
import { loadCollection } from '../store/collectionStore';
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
        
        // Dev: populate mock data only in development mode
        if (__DEV__) {
          try {
            const items = await databaseService.getCollectionItems();
            if (items.length === 0) {
              // Add mock data to database for development
              for (const item of mockCollection) {
                await databaseService.saveCollectionItem(item);
              }
              
              // Also populate 50 random items for development
              const flag = await AsyncStorage.getItem('dev_populated');
              if (!flag) {
                await populateRandomItems(50);
                await AsyncStorage.setItem('dev_populated', '1');
              }
            }
          } catch (err) {
            console.error('Dev populate failed:', err);
          }
        }
        dispatch(loadCollection());
      } catch (error) {
        console.error('Database initialization failed:', error);
      }
    };

    initializeDatabase();
  }, [dispatch]);
};