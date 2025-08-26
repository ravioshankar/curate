import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Modal, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '../../components/ThemedView';
import { CollectionPage } from '../components/common/CollectionPage';
import { AddItemPage } from '../components/common/AddItemPage';
import { ItemDetailsPage } from '../components/common/ItemDetailsPage';
import { RootState, AppDispatch } from '../store/store';
import { addCollectionItem, updateCollectionItem, deleteCollectionItem } from '../store/collectionStore';
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
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [viewingItem, setViewingItem] = useState<CollectionItem | null>(null);
  const collection = useSelector((state: RootState) => state.collection.items);
  const dispatch = useDispatch<AppDispatch>();

  const handleUpdateItem = (item: CollectionItem) => {
    dispatch(updateCollectionItem(item));
    setShowModal(false);
    setEditingItem(null);
  };

  const handleAddItem = (item: CollectionItem) => {
    dispatch(addCollectionItem(item));
    setShowModal(false);
  };

  const handleEditItem = (item: CollectionItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  const handleViewItem = (item: CollectionItem) => {
    setViewingItem(item);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingItem(null);
  };

  const handleDeleteItem = useCallback((id: string) => {
    Alert.alert(
      'Delete Item',
      'Are you sure you want to delete this item?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteCollectionItem(id))
        }
      ]
    );
  }, [dispatch]);

  const handleSubmit = useCallback((item: CollectionItem) => {
    if (editingItem) {
      dispatch(updateCollectionItem(item));
      setShowModal(false);
      setEditingItem(null);
    } else {
      dispatch(addCollectionItem(item));
      setShowModal(false);
    }
  }, [editingItem, dispatch]);

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
      {viewingItem ? (
        <ItemDetailsPage 
          item={viewingItem}
          collection={collection}
          onBack={() => setViewingItem(null)}
          onEdit={() => {
            setEditingItem(viewingItem);
            setViewingItem(null);
            setShowModal(true);
          }}
          onDelete={() => {
            handleDeleteItem(viewingItem.id);
            setViewingItem(null);
          }}
        />
      ) : (
        <CollectionPage 
          collection={collection}
          searchText={searchText}
          setSearchText={setSearchText}
          onUpdateItem={handleEditItem}
          onDeleteItem={handleDeleteItem}
          onViewItem={handleViewItem}
          onAddItem={() => setShowModal(true)}
        />
      )}
      
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <AddItemPage 
          item={editingItem || undefined}
          onSubmit={handleSubmit}
          onBack={handleCloseModal}
          isEdit={!!editingItem}
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