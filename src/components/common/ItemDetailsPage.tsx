import { ScrollView, StyleSheet, TouchableOpacity, View, Image } from 'react-native';
import { useState } from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CollectionItem } from '../../types/collection';
import { useCurrency } from '../providers/SimpleCurrencyProvider';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface ItemDetailsPageProps {
  item: CollectionItem;
  collection: CollectionItem[];
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function ItemDetailsPage({ item, collection, onBack, onEdit, onDelete }: ItemDetailsPageProps) {
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const { formatPrice } = useCurrency();

  const getRecommendations = () => {
    return collection
      .filter(i => i.id !== item.id && (
        i.category === item.category || 
        i.location === item.location ||
        Math.abs(new Date(i.lastUsed).getTime() - new Date(item.lastUsed).getTime()) < 30 * 24 * 60 * 60 * 1000
      ))
      .slice(0, 3);
  };

  const recommendations = getRecommendations();

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle}>Item Details</ThemedText>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={onEdit} style={[styles.actionButton, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
            <Icon name="edit" size={20} color={tintColor} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={[styles.actionButton, { backgroundColor: 'rgba(239, 68, 68, 0.1)' }]}>
            <Icon name="delete" size={20} color="#ef4444" />
          </TouchableOpacity>
        </View>
      </ThemedView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={[styles.imageContainer, { backgroundColor: cardBg }]}>
          <ImageWithFallback 
            imageUrl={item.imageUrl} 
            style={styles.itemImage}
            placeholderStyle={[styles.placeholderImage, { backgroundColor: '#f3f4f6' }]}
          />
        </View>

        <ThemedView style={[styles.detailsCard, { backgroundColor: cardBg, borderColor }]}>
          <ThemedText style={[styles.itemName, { color: textColor }]}>{item.name}</ThemedText>
          
          <View style={styles.detailRow}>
            <ThemedText style={styles.categoryIcon}>{getCategoryIcon(item.category)}</ThemedText>
            <ThemedText style={[styles.detailLabel, { color: textColor }]}>Category:</ThemedText>
            <ThemedText style={[styles.detailValue, { color: textColor }]}>{item.category}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.locationIcon}>📍</ThemedText>
            <ThemedText style={[styles.detailLabel, { color: textColor }]}>Location:</ThemedText>
            <ThemedText style={[styles.detailValue, { color: textColor }]}>{item.location}</ThemedText>
          </View>

          <View style={styles.detailRow}>
            <ThemedText style={styles.dateIcon}>📅</ThemedText>
            <ThemedText style={[styles.detailLabel, { color: textColor }]}>Last Used:</ThemedText>
            <ThemedText style={[styles.detailValue, { color: textColor }]}>{item.lastUsed}</ThemedText>
          </View>

          {(item.pricePaid || item.priceExpected) && (
            <View style={[styles.priceSection, { borderTopColor: borderColor }]}>
              {item.pricePaid && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.priceIcon}>💰</ThemedText>
                  <ThemedText style={[styles.detailLabel, { color: textColor }]}>Price Paid:</ThemedText>
                  <ThemedText style={[styles.priceValue, { color: '#059669' }]}>{formatPrice(item.pricePaid)}</ThemedText>
                </View>
              )}
              {item.priceExpected && (
                <View style={styles.detailRow}>
                  <ThemedText style={styles.priceIcon}>🎯</ThemedText>
                  <ThemedText style={[styles.detailLabel, { color: textColor }]}>Expected Price:</ThemedText>
                  <ThemedText style={[styles.priceValue, { color: '#d97706' }]}>{formatPrice(item.priceExpected)}</ThemedText>
                </View>
              )}
            </View>
          )}

          {item.notes && (
            <View style={[styles.notesSection, { borderTopColor: borderColor }]}>
              <View style={styles.detailRow}>
                <ThemedText style={styles.notesIcon}>📝</ThemedText>
                <ThemedText style={[styles.detailLabel, { color: textColor }]}>Notes:</ThemedText>
              </View>
              <ThemedText style={[styles.notesText, { color: textColor }]}>{item.notes}</ThemedText>
            </View>
          )}
        </ThemedView>

        {recommendations.length > 0 && (
          <ThemedView style={[styles.recommendationsCard, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Related Items</ThemedText>
            <ThemedText style={[styles.sectionSubtitle, { color: textColor }]}>
              Items from same category, location, or recently used
            </ThemedText>
            
            {recommendations.map(recItem => (
              <View key={recItem.id} style={[styles.recommendationItem, { borderBottomColor: borderColor }]}>
                <View style={styles.recItemContent}>
                  <ThemedText style={styles.recCategoryIcon}>{getCategoryIcon(recItem.category)}</ThemedText>
                  <View style={styles.recItemDetails}>
                    <ThemedText style={[styles.recItemName, { color: textColor }]}>{recItem.name}</ThemedText>
                    <ThemedText style={[styles.recItemMeta, { color: textColor }]}>
                      {recItem.category} • {recItem.location}
                    </ThemedText>
                  </View>
                </View>
              </View>
            ))}
          </ThemedView>
        )}
      </ScrollView>
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
        <Icon name="image" size={64} color="#9ca3af" />
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    borderRadius: 20,
    padding: 8,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  itemName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  locationIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  dateIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  priceIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginRight: 8,
    minWidth: 100,
  },
  detailValue: {
    fontSize: 16,
    flex: 1,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  priceSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  notesSection: {
    borderTopWidth: 1,
    paddingTop: 16,
    marginTop: 16,
  },
  notesIcon: {
    fontSize: 18,
    marginRight: 12,
    width: 24,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 22,
    marginLeft: 36,
  },
  recommendationsCard: {
    margin: 16,
    marginTop: 0,
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 16,
  },
  recommendationItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  recItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recCategoryIcon: {
    fontSize: 16,
    marginRight: 12,
    width: 20,
  },
  recItemDetails: {
    flex: 1,
  },
  recItemName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  recItemMeta: {
    fontSize: 14,
    opacity: 0.7,
  },
});