import { View, Text, ScrollView, TextInput, Image, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { InventoryItem } from '../../types/inventory';
import { useCurrency } from '../providers/CurrencyContext';
import { getCurrencyInfo } from '../../utils/currencyUtils';

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
        <ThemedText style={styles.pageTitle}>My Inventory</ThemedText>
        <TouchableOpacity style={[styles.addButton, { backgroundColor: tintColor }]} onPress={onAddItem}>
          <Icon name="add" size={24} color="white" />
        </TouchableOpacity>
      </ThemedView>
      
      <ThemedView style={[styles.searchContainer, { backgroundColor: cardBg, borderColor }]}>
        <ThemedText style={styles.searchIcon}>🔍</ThemedText>
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor={placeholderColor}
        />
      </ThemedView>

      <ScrollView showsVerticalScrollIndicator={false}>
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
    <Image
      source={{ uri: item.imageUrl || 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' }}
      style={styles.cardImage}
    />
    <View style={styles.cardContent}>
      <View style={styles.cardHeader}>
        <Text style={[styles.cardTitle, { color: textColor }]}>{item.name}</Text>
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <Icon name="edit" size={16} color={tintColor} />
        </TouchableOpacity>
      </View>
      <Text style={[styles.cardCategory, { color: textColor }]}>{item.category}</Text>
      <Text style={[styles.cardLocation, { color: textColor }]}>📍 {item.location}</Text>
      
      {(item.pricePaid || item.priceExpected) && (
        <View style={[styles.priceSection, { borderTopColor: borderColor }]}>
          {item.pricePaid && (
            <Text style={styles.pricePaid}>💰 Paid: {formatPrice(item.pricePaid)}</Text>
          )}
          {item.priceExpected && (
            <Text style={styles.priceExpected}>🎯 Expected: {formatPrice(item.priceExpected)}</Text>
          )}
        </View>
      )}
      
      <Text style={[styles.cardDate, { color: textColor }]}>📅 Last used: {item.lastUsed}</Text>
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
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    marginBottom: 8,
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