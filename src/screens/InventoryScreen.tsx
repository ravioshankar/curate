import { useState } from 'react';
import { StyleSheet, View, Modal } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedView } from '../../components/ThemedView';
import { InventoryPage } from '../components/common/InventoryPage';
import { AddItemPage } from '../components/common/AddItemPage';
import { RootState } from '../store/store';
import { updateItem, addItem } from '../store/store';

export function InventoryScreen() {
  const [searchText, setSearchText] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const inventory = useSelector((state: RootState) => state.inventory.inventory);
  const dispatch = useDispatch();

  const handleUpdateItem = (item: any) => {
    dispatch(updateItem(item));
  };

  const handleAddItem = (item: any) => {
    dispatch(addItem(item) as any);
    setShowAddModal(false);
  };

  return (
    <ThemedView style={styles.container}>
      <InventoryPage 
        inventory={inventory}
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
    padding: 20,
    paddingHorizontal: 16,
  },
});