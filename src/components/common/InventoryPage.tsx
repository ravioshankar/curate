import { View, Text, ScrollView, TextInput, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { InventoryItem } from '../src/types/inventory';

interface InventoryPageProps {
  inventory: InventoryItem[];
  searchText: string;
  setSearchText: (text: string) => void;
  onUpdateItem: (item: InventoryItem) => void;
  onAddItem: () => void;
}

export const InventoryPage = ({ inventory, searchText, setSearchText, onUpdateItem, onAddItem }: InventoryPageProps) => {
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState<InventoryItem | null>(null);
  
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setEditForm({ ...item });
  };

  const handleSave = () => {
    if (editForm) {
      onUpdateItem(editForm);
      setEditingItem(null);
      setEditForm(null);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setEditForm(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.pageTitle}>My Inventory</Text>
        <TouchableOpacity style={styles.addButton} onPress={onAddItem}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inventoryGrid}>
          {filteredInventory.map(item => (
            <InventoryCard key={item.id} item={item} onEdit={() => handleEdit(item)} />
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!editingItem} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Item</Text>
            <TouchableOpacity onPress={handleCancel}>
              <Icon name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>
          
          {editForm && (
            <ScrollView style={styles.editForm}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Name</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Category</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.category}
                  onChangeText={(text) => setEditForm({...editForm, category: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Last Used Date</Text>
                <TouchableOpacity 
                  style={styles.input}
                  onPress={() => {}}
                >
                  <Text>{editForm.lastUsed}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Image URL</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.imageUrl || ''}
                  onChangeText={(text) => setEditForm({...editForm, imageUrl: text})}
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Price Paid ($)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.pricePaid?.toString() || ''}
                  onChangeText={(text) => setEditForm({...editForm, pricePaid: text})}
                  keyboardType="default"
                  placeholder="$0.00, €0.00, ¥0, etc."
                />
              </View>
              
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Expected Price ($)</Text>
                <TextInput
                  style={styles.input}
                  value={editForm.priceExpected?.toString() || ''}
                  onChangeText={(text) => setEditForm({...editForm, priceExpected: text})}
                  keyboardType="default"
                  placeholder="$0.00, €0.00, ¥0, etc."
                />
              </View>
              
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    </View>
  );
};

const InventoryCard = ({ item, onEdit }) => (
  <View style={styles.inventoryCard}>
    <Image
      source={{ uri: item.imageUrl || 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' }}
      style={styles.cardImage}
    />
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Icon name="edit" size={16} color="#6366F1" />
        </TouchableOpacity>
      </View>
      <Text style={styles.cardCategory}>{item.category}</Text>
      <Text style={styles.cardLocation}>📍 {item.location}</Text>
      
      {(item.pricePaid || item.priceExpected) && (
        <View style={styles.priceSection}>
          {item.pricePaid && (
            <Text style={styles.pricePaid}>💰 Paid: ${item.pricePaid.toFixed(2)}</Text>
          )}
          {item.priceExpected && (
            <Text style={styles.priceExpected}>💸 Expected: ${item.priceExpected.toFixed(2)}</Text>
          )}
        </View>
      )}
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  addButton: {
    backgroundColor: '#6366F1',
    borderRadius: 50,
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  pricePaid: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 2,
  },
  priceExpected: {
    fontSize: 12,
    color: '#d97706',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  editButton: {
    padding: 4,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  editForm: {
    flex: 1,
    padding: 20,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#6366F1',
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});