import { StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { InventoryItem } from '../src/types/inventory';

interface InventoryCardProps {
  item: InventoryItem;
}

export function InventoryCard({ item }: InventoryCardProps) {
  return (
    <ThemedView style={styles.card}>
      <Image
        source={{ uri: item.imageUrl || 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' }}
        style={styles.image}
        contentFit="cover"
      />
      <ThemedView style={styles.content}>
        <ThemedText style={styles.name}>{item.name}</ThemedText>
        <ThemedText style={styles.category}>{item.category}</ThemedText>
        
        <ThemedView style={styles.locationRow}>
          <ThemedView style={styles.locationInfo}>
            <ThemedText style={styles.locationIcon}>🏷️</ThemedText>
            <ThemedText style={styles.location}>{item.location}</ThemedText>
          </ThemedView>
          <TouchableOpacity style={styles.moreButton}>
            <ThemedText style={styles.moreIcon}>⋮</ThemedText>
          </TouchableOpacity>
        </ThemedView>

        {(item.pricePaid || item.priceExpected) && (
          <ThemedView style={styles.priceSection}>
            {item.pricePaid && (
              <ThemedView style={styles.priceRow}>
                <ThemedText style={styles.paidIcon}>💰</ThemedText>
                <ThemedText style={styles.priceText}>
                  Paid: <ThemedText style={styles.priceValue}>${item.pricePaid.toFixed(2)}</ThemedText>
                </ThemedText>
              </ThemedView>
            )}
            {item.priceExpected && (
              <ThemedView style={styles.priceRow}>
                <ThemedText style={styles.expectedIcon}>💸</ThemedText>
                <ThemedText style={styles.priceText}>
                  Expected: <ThemedText style={styles.priceValue}>${item.priceExpected.toFixed(2)}</ThemedText>
                </ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        )}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 160,
  },
  content: {
    padding: 16,
    backgroundColor: 'transparent',
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  category: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 12,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  location: {
    fontSize: 14,
    opacity: 0.8,
  },
  moreButton: {
    padding: 4,
  },
  moreIcon: {
    fontSize: 16,
    opacity: 0.5,
  },
  priceSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
    gap: 8,
    backgroundColor: 'transparent',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  paidIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  expectedIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  priceText: {
    fontSize: 14,
    opacity: 0.8,
  },
  priceValue: {
    fontWeight: 'bold',
  },
});