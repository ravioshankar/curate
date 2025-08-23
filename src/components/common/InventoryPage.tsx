import { View, Text, ScrollView, TextInput, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { InventoryItem } from '../../types/inventory';
import { useCurrency } from '../providers/CurrencyContext';
import { getCurrencyInfo } from '../../utils/currencyUtils';
import { getCategoryIcon } from '../../utils/categoryIcons';

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
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const { currency, formatPrice } = useCurrency();
  const currentCurrency = getCurrencyInfo(currency);
  
  const filteredInventory = (inventory || []).filter(item =>
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
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView>
          <ThemedText style={styles.pageTitle}>My Inventory</ThemedText>
          <ThemedText style={styles.itemCount}>{filteredInventory.length} {filteredInventory.length === 1 ? 'item' : 'items'}</ThemedText>
        </ThemedView>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: tintColor }]} onPress={onAddItem}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={[styles.searchContainer, { backgroundColor: cardBg, borderColor }]}>
        <ThemedText style={styles.searchIcon}><ThemedText>🔍</ThemedText></ThemedText>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={placeholderColor}
        />
        {searchText.length > 0 && (
          <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearButton}>
            <Icon name="clear" size={20} color={placeholderColor} />
          </TouchableOpacity>
        )}
      </ThemedView>

      {filteredInventory.length === 0 && searchText.length > 0 && (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No items found matching "{searchText}"</ThemedText>
        </ThemedView>
      )}
      
      {inventory.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateIcon}>📦</ThemedText>
          <ThemedText style={styles.emptyStateTitle}>No Items Yet</ThemedText>
          <ThemedText style={styles.emptyStateText}>Start building your inventory by adding your first item</ThemedText>
        </ThemedView>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.inventoryGrid}>
          {filteredInventory.map(item => (
            <InventoryCard 
              key={item.id} 
              item={item} 
              onEdit={() => handleEdit(item)}
              cardBg={cardBg}
              textColor={textColor}
              borderColor={borderColor}
              tintColor={tintColor}
              formatPrice={formatPrice}
            />
          ))}
        </View>
      </ScrollView>

      <Modal visible={!!editingItem} animationType="slide" presentationStyle="pageSheet">
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.modalTitle}>Edit Item</ThemedText>
            <TouchableOpacity onPress={handleCancel}>
              <Icon name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </ThemedView>
          
          {editForm && (
            <ScrollView style={styles.editForm}>
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Name</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, backgroundColor: cardBg, color: textColor }]}
                  value={editForm.name}
                  onChangeText={(text) => setEditForm({...editForm, name: text})}
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Category</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, backgroundColor: cardBg, color: textColor }]}
                  value={editForm.category}
                  onChangeText={(text) => setEditForm({...editForm, category: text})}
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Location</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, backgroundColor: cardBg, color: textColor }]}
                  value={editForm.location}
                  onChangeText={(text) => setEditForm({...editForm, location: text})}
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Last Used Date</ThemedText>
                <TouchableOpacity 
                  style={[styles.input, { borderColor, backgroundColor: cardBg }]}
                  onPress={() => {}}
                >
                  <ThemedText>{editForm.lastUsed}</ThemedText>
                </TouchableOpacity>
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Image URL</ThemedText>
                <TextInput
                  style={[styles.input, { borderColor, backgroundColor: cardBg, color: textColor }]}
                  value={editForm.imageUrl || ''}
                  onChangeText={(text) => setEditForm({...editForm, imageUrl: text})}
                />
              </ThemedView>
              
              <CurrencyInputField
                label="Price Paid"
                value={editForm.pricePaid?.toString() || ''}
                onChangeText={(text) => setEditForm({...editForm, pricePaid: parseFloat(text) || undefined})}
                currency={currentCurrency}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                placeholderColor={placeholderColor}
              />
              
              <CurrencyInputField
                label="Expected Price"
                value={editForm.priceExpected?.toString() || ''}
                onChangeText={(text) => setEditForm({...editForm, priceExpected: parseFloat(text) || undefined})}
                currency={currentCurrency}
                cardBg={cardBg}
                borderColor={borderColor}
                textColor={textColor}
                placeholderColor={placeholderColor}
              />
              
              <ThemedView style={styles.modalButtons}>
                <TouchableOpacity style={[styles.cancelButton, { borderColor }]} onPress={handleCancel}>
                  <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.saveButton, { backgroundColor: tintColor }]} onPress={handleSave}>
                  <ThemedText style={styles.saveButtonText}>Save</ThemedText>
                </TouchableOpacity>
              </ThemedView>
            </ScrollView>
          )}
        </ThemedView>
      </Modal>
    </ThemedView>
  );
};

interface CurrencyInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  currency: { flag: string; symbol: string };
  cardBg: string;
  borderColor: string;
  textColor: string;
  placeholderColor: string;
}

function CurrencyInputField({ label, value, onChangeText, currency, cardBg, borderColor, textColor, placeholderColor }: CurrencyInputFieldProps) {
  const handleTextChange = (text: string) => {
    const numericText = text.replace(/[^0-9.]/g, '');
    const parts = numericText.split('.');
    const validText = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericText;
    onChangeText(validText);
  };
  
  return (
    <ThemedView style={styles.inputGroup}>
      <ThemedText style={styles.inputLabel}>{label}</ThemedText>
      <View style={[styles.currencyInputContainer, { borderColor, backgroundColor: cardBg }]}>
        <View style={styles.currencyPrefix}>
          <ThemedText style={styles.currencyFlag}>{currency.flag}</ThemedText>
          <ThemedText style={[styles.currencySymbol, { color: textColor }]}>{currency.symbol}</ThemedText>
        </View>
        <TextInput
          style={[styles.currencyInput, { color: textColor }]}
          value={value}
          onChangeText={handleTextChange}
          placeholder="0.00"
          keyboardType="decimal-pad"
          returnKeyType="done"
          placeholderTextColor={placeholderColor}
        />
      </View>
    </ThemedView>
  );
}

const InventoryCard = ({ item, onEdit, cardBg, textColor, borderColor, tintColor, formatPrice }: {
  item: InventoryItem;
  onEdit: () => void;
  cardBg: string;
  textColor: string;
  borderColor: string;
  tintColor: string;
  formatPrice: (amount: number) => string;
}) => (
  <View style={[styles.inventoryCard, { backgroundColor: cardBg }]}>
    {item.imageUrl ? (
      <Image
        source={{ uri: item.imageUrl }}
        style={styles.cardImage}
        defaultSource={{ uri: 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' }}
      />
    ) : (
      <View style={[styles.cardImage, styles.placeholderImage, { backgroundColor: '#f3f4f6' }]}>
        <Icon name="image" size={32} color="#9ca3af" />
      </View>
    )}
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <ThemedText style={[styles.cardTitle, { color: textColor }]}>{item.name}</ThemedText>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Icon name="edit" size={16} color={tintColor} />
        </TouchableOpacity>
      </View>
      <View style={styles.categoryContainer}>
        <ThemedText style={styles.categoryIcon}>{getCategoryIcon(item.category)}</ThemedText>
        <ThemedText style={[styles.cardCategory, { color: textColor }]}>{item.category}</ThemedText>
      </View>
      <ThemedText style={[styles.cardLocation, { color: textColor }]}><ThemedText>📍</ThemedText> {item.location}</ThemedText>
      
      {(item.pricePaid || item.priceExpected) && (
        <View style={[styles.priceSection, { borderTopColor: borderColor }]}>
          {item.pricePaid && (
            <ThemedText style={styles.pricePaid}><ThemedText>💰</ThemedText> Paid: {formatPrice(item.pricePaid)}</ThemedText>
          )}
          {item.priceExpected && (
            <ThemedText style={styles.priceExpected}><ThemedText>🎯</ThemedText> Expected: {formatPrice(item.priceExpected)}</ThemedText>
          )}
        </View>
      )}
      
      <ThemedText style={[styles.cardDate, { color: textColor }]}><ThemedText>📅</ThemedText> Last used: {item.lastUsed}</ThemedText>
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
  },
  addButton: {
    borderRadius: 50,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
  },
  clearButton: {
    padding: 8,
  },
  itemCount: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 2,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 22,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryCard: {
    width: '48%',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
    minHeight: 200,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  categoryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  cardCategory: {
    fontSize: 14,
    opacity: 0.7,
  },
  cardLocation: {
    fontSize: 12,
    marginBottom: 8,
    opacity: 0.7,
  },
  priceSection: {
    borderTopWidth: 1,
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
    padding: 8,
    minWidth: 32,
    minHeight: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
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
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  saveButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  currencyFlag: {
    fontSize: 16,
  },
  currencySymbol: {
    fontSize: 14,
    fontWeight: '600',
  },
  currencyInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  cardDate: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
});