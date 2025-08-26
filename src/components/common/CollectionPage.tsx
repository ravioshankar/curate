import { View, Text, ScrollView, TextInput, Image, StyleSheet, TouchableOpacity, Modal, Platform, Appearance, Alert } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { imageService } from '../../services/ImageService';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CollectionItem } from '../../types/collection';
import { useCurrency } from '../providers/CurrencyContext';
import { getCurrencyInfo } from '../../utils/currencyUtils';
import { getCategoryIcon } from '../../utils/categoryIcons';
import { SimpleCategoryDropdown } from './SimpleCategoryDropdown';
import { SimpleLocationDropdown } from './SimpleLocationDropdown';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';

interface CollectionPageProps {
  collection: CollectionItem[];
  searchText: string;
  setSearchText: (text: string) => void;
  onUpdateItem: (item: CollectionItem) => void;
  onAddItem: () => void;
}

export const CollectionPage = ({ collection, searchText, setSearchText, onUpdateItem, onAddItem }: CollectionPageProps) => {
  const [editingItem, setEditingItem] = useState<CollectionItem | null>(null);
  const [editForm, setEditForm] = useState<CollectionItem | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const isDarkMode = backgroundColor === '#1C1917' || Appearance.getColorScheme() === 'dark';
  const { currency, formatPrice } = useCurrency();
  const currentCurrency = getCurrencyInfo(currency);
  
  const filteredCollection = (collection || []).filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleEdit = (item: CollectionItem) => {
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

  const handleImagePick = async () => {
    try {
      const uri = await imageService.pickImage();
      if (uri && editForm) {
        setEditForm({...editForm, imageUrl: uri});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await imageService.takePhoto();
      if (uri && editForm) {
        setEditForm({...editForm, imageUrl: uri});
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleRemoveImage = () => {
    if (editForm) {
      setEditForm({...editForm, imageUrl: ''});
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedView>
          <ThemedText style={styles.pageTitle}>My Collection</ThemedText>
          <ThemedText style={styles.itemCount}>{filteredCollection.length} {filteredCollection.length === 1 ? 'item' : 'items'}</ThemedText>
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

      {filteredCollection.length === 0 && searchText.length > 0 && (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateText}>No items found matching "{searchText}"</ThemedText>
        </ThemedView>
      )}
      
      {collection.length === 0 && (
        <ThemedView style={styles.emptyState}>
          <ThemedText style={styles.emptyStateIcon}>📦</ThemedText>
          <ThemedText style={styles.emptyStateTitle}>No Items Yet</ThemedText>
          <ThemedText style={styles.emptyStateText}>Start building your collection by adding your first item</ThemedText>
        </ThemedView>
      )}

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.collectionGrid}>
          {filteredCollection.map(item => (
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
                <SimpleCategoryDropdown
                  selectedCategory={editForm.category}
                  onSelectCategory={(category) => setEditForm({...editForm, category})}
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Location</ThemedText>
                <SimpleLocationDropdown
                  selectedLocation={editForm.location}
                  onSelectLocation={(location) => setEditForm({...editForm, location})}
                />
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Last Used Date</ThemedText>
                <TouchableOpacity 
                  style={[styles.input, { borderColor, backgroundColor: cardBg }]}
                  onPress={() => {
                    if (editForm.lastUsed) {
                      setSelectedDate(new Date(editForm.lastUsed));
                    }
                    setShowDatePicker(true);
                  }}
                >
                  <ThemedText style={{ color: textColor }}>{editForm.lastUsed}</ThemedText>
                </TouchableOpacity>
                {showDatePicker && (
                  <DateTimePicker
                    value={selectedDate}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    maximumDate={new Date()}
                    themeVariant={isDarkMode ? 'dark' : 'light'}
                    accentColor={tintColor}
                    style={{ backgroundColor: cardBg }}
                    onChange={(event: DateTimePickerEvent, date?: Date) => {
                      if (Platform.OS === 'android') {
                        setShowDatePicker(false);
                        if (event.type === 'set' && date) {
                          setSelectedDate(date);
                          const formattedDate = date.toISOString().split('T')[0];
                          setEditForm({...editForm, lastUsed: formattedDate});
                        }
                      } else if (Platform.OS === 'ios') {
                        if (date) {
                          setSelectedDate(date);
                          const formattedDate = date.toISOString().split('T')[0];
                          setEditForm({...editForm, lastUsed: formattedDate});
                        }
                      }
                    }}
                  />
                )}
              </ThemedView>
              
              <ThemedView style={styles.inputGroup}>
                <ThemedText style={styles.inputLabel}>Item Photo</ThemedText>
                {editForm.imageUrl ? (
                  <View style={[styles.imageContainer, { borderColor }]}>
                    <ImageWithFallback 
                      imageUrl={editForm.imageUrl} 
                      style={styles.selectedImage}
                      placeholderStyle={[styles.selectedImage, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}
                    />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={handleRemoveImage}
                    >
                      <Icon name="close" size={20} color="white" />
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.replaceImageButton, { backgroundColor: tintColor }]}
                      onPress={() => Alert.alert(
                        'Replace Photo',
                        'Choose how to replace the photo',
                        [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Take Photo', onPress: handleTakePhoto },
                          { text: 'Choose Photo', onPress: handleImagePick }
                        ]
                      )}
                    >
                      <Icon name="edit" size={16} color="white" />
                    </TouchableOpacity>
                  </View>
                ) : (
                  <View style={styles.photoButtons}>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: tintColor }]}
                      onPress={handleTakePhoto}
                    >
                      <Icon name="camera-alt" size={20} color="white" />
                      <ThemedText style={styles.photoButtonText}>Take Photo</ThemedText>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.photoButton, { backgroundColor: '#10B981' }]}
                      onPress={handleImagePick}
                    >
                      <Icon name="photo-library" size={20} color="white" />
                      <ThemedText style={styles.photoButtonText}>Choose Photo</ThemedText>
                    </TouchableOpacity>
                  </View>
                )}
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

const ImageWithFallback = ({ imageUrl, style, placeholderStyle }: {
  imageUrl?: string;
  style: any;
  placeholderStyle: any;
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (!imageUrl || imageError) {
    return (
      <View style={placeholderStyle}>
        <Icon name="image" size={32} color="#9ca3af" />
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      onError={() => setImageError(true)}
    />
  );
};

const InventoryCard = ({ item, onEdit, cardBg, textColor, borderColor, tintColor, formatPrice }: {
  item: CollectionItem;
  onEdit: () => void;
  cardBg: string;
  textColor: string;
  borderColor: string;
  tintColor: string;
  formatPrice: (amount: number) => string;
}) => (
  <View style={[styles.collectionCard, { backgroundColor: cardBg }]}>
    <ImageWithFallback 
      imageUrl={item.imageUrl} 
      style={styles.cardImage}
      placeholderStyle={[styles.cardImage, styles.placeholderImage, { backgroundColor: '#f3f4f6' }]}
    />
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
  collectionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  collectionCard: {
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
  imageContainer: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },
  replaceImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 12,
    padding: 6,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    gap: 6,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});