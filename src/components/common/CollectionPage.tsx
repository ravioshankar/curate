import { View, Text, ScrollView, TextInput, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CollectionItem } from '../../types/collection';
import { useCurrency } from '../providers/SimpleCurrencyProvider';
import { getCurrencyInfo } from '../../utils/currencyUtils';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface CollectionPageProps {
  collection: CollectionItem[];
  searchText: string;
  setSearchText: (text: string) => void;
  onUpdateItem: (item: CollectionItem) => void;
  onDeleteItem: (id: string) => void;
  onViewItem: (item: CollectionItem) => void;
  onAddItem: () => void;
}

export const CollectionPage = ({ collection, searchText, setSearchText, onUpdateItem, onDeleteItem, onViewItem, onAddItem }: CollectionPageProps) => {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const { currency, formatPrice } = useCurrency();
  
  const filteredCollection = (collection || []).filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  );

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
            <CollectionCard 
              key={item.id} 
              item={item} 
              onView={() => onViewItem(item)}
              cardBg={cardBg}
              textColor={textColor}
              borderColor={borderColor}
              tintColor={tintColor}
              formatPrice={formatPrice}
            />
          ))}
        </View>
      </ScrollView>


    </ThemedView>
  );
};

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

const CollectionCard = ({ item, onView, cardBg, textColor, borderColor, tintColor, formatPrice }: {
  item: CollectionItem;
  onView: () => void;
  cardBg: string;
  textColor: string;
  borderColor: string;
  tintColor: string;
  formatPrice: (amount: number) => string;
}) => (
  <TouchableOpacity 
    style={[styles.collectionCard, { backgroundColor: cardBg }]} 
    onPress={onView}
    activeOpacity={0.7}
  >
    <ImageWithFallback 
      imageUrl={item.imageUrl} 
      style={styles.cardImage}
      placeholderStyle={[styles.cardImage, styles.placeholderImage, { backgroundColor: '#f3f4f6' }]}
    />
    <View style={styles.cardContent}>
      <ThemedText style={[styles.cardTitle, { color: textColor }]}>{item.name}</ThemedText>
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
      
      <View style={styles.cardFooter}>
        <ThemedText style={[styles.cardDate, { color: textColor }]}><ThemedText>📅</ThemedText> Last used: {item.lastUsed}</ThemedText>
        <View style={[styles.chevronContainer, { backgroundColor: `${tintColor}15` }]}>
          <Icon name="chevron-right" size={16} color={tintColor} />
        </View>
      </View>
    </View>
  </TouchableOpacity>
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
  detailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  detailsButtonIcon: {
    marginRight: 6,
  },
  detailsButtonText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginBottom: 8,
    marginHorizontal: 12,
    gap: 8,
  },
  editButton: {
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 20,
    padding: 8,
    minWidth: 36,
    minHeight: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 20,
    padding: 8,
    minWidth: 36,
    minHeight: 36,
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
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardDate: {
    fontSize: 12,
    opacity: 0.7,
    flex: 1,
  },
  chevronContainer: {
    borderRadius: 12,
    padding: 4,
    marginLeft: 8,
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