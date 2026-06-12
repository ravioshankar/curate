import React, { useState, useCallback } from 'react';
import { StyleSheet, Modal, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { Stack } from 'expo-router';
import { ThemedView } from '../../components/ThemedView';
import { CollectionPage } from '../components/common/CollectionPage';
import { AddItemPage } from '../components/common/AddItemPage';
import { ItemDetailsPage } from '../components/common/ItemDetailsPage';
import { RootState, AppDispatch } from '../store/store';
import { deleteCollectionItem, loadCollection } from '../store/collectionStore';
import { saveItemToCollection } from '../utils/collectionActions';
import { CollectionItem } from '../types/collection';

export function CollectionScreen() {
  const [searchText, setSearchText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [viewingItem, setViewingItem] = useState<CollectionItem | null>(null);
  const collection = useSelector((state: RootState) => state.collection.items);
  const dispatch = useDispatch<AppDispatch>();

  const saveItem = saveItemToCollection(dispatch);
  
  const handleSubmit = useCallback((item: CollectionItem) => {
    saveItem(item, !!editingItem);
    setShowModal(false);
    setEditingItem(null);
  }, [editingItem, saveItem]);

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

  // Load collection from database on mount
  React.useEffect(() => {
    dispatch(loadCollection());
  }, [dispatch]);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'Catalog',
        }}
      />
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
