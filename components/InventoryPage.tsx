import { View, Text, ScrollView, TextInput, Image, StyleSheet } from 'react-native';
import { InventoryItem } from '../types/inventory';

interface InventoryPageProps {
  inventory: InventoryItem[];
  searchText: string;
  setSearchText: (text: string) => void;
}

export const InventoryPage = ({ inventory, searchText, setSearchText }: InventoryPageProps) => {
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Inventory</Text>
      
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
            <InventoryCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const InventoryCard = ({ item }) => (
  <View style={styles.inventoryCard}>
    <Image
      source={{ uri: item.imageUrl || 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' }}
      style={styles.cardImage}
      onError={(e) => {
        e.target.source = { uri: 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' };
      }}
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
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
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
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
});