import React, { useState } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '../../components/ThemedView';
import { CollectionPage } from '../components/common/CollectionPage';
import { AddItemPage } from '../components/common/AddItemPage';
import { RootState, AppDispatch } from '../store/store';
import { addCollectionItem, updateCollectionItem } from '../store/collectionStore';
import { CollectionItem } from '../types/collection';

const sampleItems: CollectionItem[] = [
  { id: 'db1', name: 'Wireless Headphones', category: 'Electronics', location: 'Desk Drawer', lastUsed: '2024-12-15', pricePaid: 89.99, priceExpected: 60.00 },
  { id: 'db2', name: 'Coffee Maker', category: 'Kitchen', location: 'Kitchen Counter', lastUsed: '2024-12-30', pricePaid: 125.00, priceExpected: 80.00 },
  { id: 'db3', name: 'Running Shoes', category: 'Sports', location: 'Closet', lastUsed: '2024-11-20', pricePaid: 110.00, priceExpected: 70.00 },
  { id: 'db4', name: 'Desk Lamp', category: 'Furniture', location: 'Home Office', lastUsed: '2024-12-28', pricePaid: 45.00, priceExpected: 30.00 },
  { id: 'db5', name: 'Guitar', category: 'Music', location: 'Living Room', lastUsed: '2024-10-15', pricePaid: 300.00, priceExpected: 250.00 },
  { id: 'db6', name: 'Cookbook Collection', category: 'Books', location: 'Kitchen Shelf', lastUsed: '2024-09-05', pricePaid: 75.00, priceExpected: 40.00 },
  { id: 'db7', name: 'Bluetooth Speaker', category: 'Electronics', location: 'Bedroom', lastUsed: '2024-12-25', pricePaid: 65.00, priceExpected: 45.00 },
  { id: 'db8', name: 'Winter Jacket', category: 'Clothes', location: 'Hall Closet', lastUsed: '2024-01-10', pricePaid: 180.00, priceExpected: 120.00 },
  { id: 'db9', name: 'Tablet Stand', category: 'Accessories', location: 'Nightstand', lastUsed: '2024-12-20', pricePaid: 25.00, priceExpected: 15.00 },
  { id: 'db10', name: 'Plant Pot Set', category: 'Garden', location: 'Balcony', lastUsed: '2024-08-30', pricePaid: 35.00, priceExpected: 25.00 }
];

export function CollectionScreen() {
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const collection = useSelector((state: RootState) => state.collection.items);
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdateItem = (item: any) => {
    dispatch(updateCollectionItem(item));
  };

  const handleAddItem = (item: any) => {
    dispatch(addCollectionItem(item));
    setShowAddModal(false);
  };

  const addSampleItems = () => {
    sampleItems.forEach(item => {
      dispatch(addCollectionItem(item));
    });
  };

  // Add sample items on component mount
  React.useEffect(() => {
    if (collection.length === 0) {
      addSampleItems();
    }
  }, []);

  return (
    <ThemedView style={styles.container}>
      <CollectionPage 
        collection={collection}
        searchText={searchText}
        setSearchText={setSearchText}
        onUpdateItem={handleUpdateItem}
        onAddItem={() => setShowAddModal(true)}
      />
      
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <AddItemPage 
          onAddItem={handleAddItem}
          onBack={() => setShowAddModal(false)}
        />
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
});