import { StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { StatCard } from '../components/common/StatCard';
import { RootState } from '../store/store';
import { calculateInventoryStats } from '../utils/inventoryUtils';
import { loadInventory, deleteInventoryItem, addInventoryItem } from '../store/inventoryStore';
import { useThemeColor } from '@/hooks/useThemeColor';
import { databaseService } from '../services/DatabaseService';
import { AddItemPage } from '../components/common/AddItemPage';
import { CurrencyProvider } from '../components/providers/SimpleCurrencyProvider';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AnalyticsScreen from './AnalyticsScreen';
import { getCategoryIcon } from '../utils/categoryIcons';

export function DashboardScreen() {
  const dispatch = useDispatch();
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const stats = calculateInventoryStats(inventory);

  useEffect(() => {
    dispatch(loadInventory());
  }, [dispatch]);

  // Refresh data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      dispatch(loadInventory());
    }, [dispatch])
  );
  
  // Analytics
  const totalValue = inventory.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
  const expectedValue = inventory.reduce((sum, item) => sum + (item.priceExpected || 0), 0);
  
  // Get categories from database and sort by item count
  const [dbCategories, setDbCategories] = useState<string[]>([]);
  
  useEffect(() => {
    const loadCategories = async () => {
      const cats = await databaseService.getCategories();
      setDbCategories(cats);
    };
    loadCategories();
  }, []);
  
  const categoryCounts = inventory.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = dbCategories
    .filter(cat => categoryCounts[cat] > 0)
    .sort((a, b) => (categoryCounts[b] || 0) - (categoryCounts[a] || 0));
  
  // Filter items by selected category
  const filteredItems = selectedCategory === 'all' 
    ? inventory 
    : inventory.filter(item => item.category === selectedCategory);
  
  // Items needing attention (filtered by category)
  const longUnusedItems = filteredItems.filter(item => {
    const lastUsedDate = new Date(item.lastUsed);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastUsedDate < oneYearAgo;
  });
  
  const recentItems = [...filteredItems]
    .sort((a, b) => new Date(b.lastUsed).getTime() - new Date(a.lastUsed).getTime())
    .slice(0, 5);
    
  const topValueItems = [...filteredItems]
    .filter(item => item.pricePaid)
    .sort((a, b) => (b.pricePaid || 0) - (a.pricePaid || 0))
    .slice(0, 3);

  // Update stats based on filtered items
  const filteredTotalValue = filteredItems.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
  const filteredExpectedValue = filteredItems.reduce((sum, item) => sum + (item.priceExpected || 0), 0);

  const handleDeleteItem = (itemId: string, itemName: string) => {
    Alert.alert(
      'Delete Item',
      `Are you sure you want to delete "${itemName}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => dispatch(deleteInventoryItem(itemId))
        }
      ]
    );
  };

  const handleAddItem = async (item: any) => {
    try {
      await dispatch(addInventoryItem(item));
      setShowAddModal(false);
      // Refresh inventory to show new item
      dispatch(loadInventory());
    } catch (error) {
      console.error('Failed to add item:', error);
      Alert.alert('Error', 'Failed to add item to inventory');
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const searchResults = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Overview Stats */}
      <ThemedView style={styles.statsGrid}>
        <StatCard 
          title={selectedCategory === 'all' ? 'Total Items' : `${selectedCategory} Items`} 
          value={filteredItems.length} 
          iconName="inventory" 
          color="#6366F1" 
        />
        <StatCard title="Categories" value={stats.categories} iconName="category" color="#06B6D4" />
        <StatCard 
          title="Total Value" 
          value={formatPrice(selectedCategory === 'all' ? totalValue : filteredTotalValue)} 
          iconName="attach-money" 
          color="#10B981" 
        />
        <StatCard 
          title="Expected Value" 
          value={formatPrice(selectedCategory === 'all' ? expectedValue : filteredExpectedValue)} 
          iconName="trending-up" 
          color="#F59E0B" 
        />
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={[styles.section, { borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Quick Actions</ThemedText>
        <ThemedView style={styles.actionsGrid}>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: tintColor }]}
            onPress={() => setShowAddModal(true)}
          >
            <Icon name="add" size={24} color="white" />
            <ThemedText style={styles.actionText}>Add Item</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#10B981' }]}
            onPress={() => setShowSearchModal(true)}
          >
            <Icon name="search" size={24} color="white" />
            <ThemedText style={styles.actionText}>Search</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.actionCard, { backgroundColor: '#F59E0B' }]}
            onPress={() => setShowAnalytics(true)}
          >
            <Icon name="analytics" size={24} color="white" />
            <ThemedText style={styles.actionText}>Analytics</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Category Filter */}
      <ThemedView style={[styles.section, { borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>
        <ThemedView style={styles.categoryGrid}>
          <TouchableOpacity 
            style={[styles.categoryChip, selectedCategory === 'all' && { backgroundColor: tintColor }]}
            onPress={() => setSelectedCategory('all')}
          >
            <ThemedText style={[styles.categoryText, selectedCategory === 'all' && { color: 'white' }]}>All</ThemedText>
          </TouchableOpacity>
          {categories.map(category => (
            <TouchableOpacity 
              key={category}
              style={[styles.categoryChip, selectedCategory === category && { backgroundColor: tintColor }]}
              onPress={() => setSelectedCategory(category)}
            >
              <ThemedText style={styles.categoryIcon}>{getCategoryIcon(category)}</ThemedText>
              <ThemedText style={[styles.categoryText, selectedCategory === category && { color: 'white' }]}>
                {category}
              </ThemedText>
              <ThemedText style={[styles.categoryBadge, selectedCategory === category && { color: 'white' }]}>
                {categoryCounts[category]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
        <ThemedText style={styles.categoryCount}>{filteredItems.length} items</ThemedText>
      </ThemedView>

      {/* Items Needing Attention */}
      {longUnusedItems.length > 0 && (
        <ThemedView style={[styles.section, { borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            <Icon name="warning" size={18} color="#F59E0B" /> Items to Review{selectedCategory !== 'all' ? ` (${selectedCategory})` : ''}
          </ThemedText>
          {longUnusedItems.slice(0, 3).map(item => (
            <ThemedView key={item.id} style={styles.reviewItem}>
              <Icon name="schedule" size={20} color="#F59E0B" />
              <ThemedText style={styles.itemCategoryIcon}>{getCategoryIcon(item.category)}</ThemedText>
              <ThemedView style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemDate}>Last used: {item.lastUsed}</ThemedText>
              </ThemedView>
              <TouchableOpacity onPress={() => handleDeleteItem(item.id, item.name)}>
                <Icon name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      {/* Recent Activity */}
      <ThemedView style={[styles.section, { borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Recent Activity{selectedCategory !== 'all' ? ` (${selectedCategory})` : ''}
        </ThemedText>
        {recentItems.map(item => (
          <ThemedView key={item.id} style={styles.recentItem}>
            <ThemedText style={styles.itemCategoryIcon}>{getCategoryIcon(item.category)}</ThemedText>
            <ThemedView style={styles.itemInfo}>
              <ThemedText style={styles.itemName}>{item.name}</ThemedText>
              <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.itemDate}>{item.lastUsed}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>

      {/* Top Value Items */}
      {topValueItems.length > 0 && (
        <ThemedView style={[styles.section, { borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            💎 Most Valuable{selectedCategory !== 'all' ? ` (${selectedCategory})` : ''}
          </ThemedText>
          {topValueItems.map(item => (
            <ThemedView key={item.id} style={styles.valueItem}>
              <ThemedText style={styles.itemCategoryIcon}>{getCategoryIcon(item.category)}</ThemedText>
              <ThemedView style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
              </ThemedView>
              <ThemedText style={styles.itemValue}>{formatPrice(item.pricePaid || 0)}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      )}
      
      {/* Add Item Modal */}
      <Modal visible={showAddModal} animationType="slide" presentationStyle="pageSheet">
        <CurrencyProvider>
          <AddItemPage 
            onAddItem={handleAddItem}
            onBack={() => setShowAddModal(false)}
          />
        </CurrencyProvider>
      </Modal>
      
      {/* Search Modal */}
      <Modal visible={showSearchModal} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="title">Search Items</ThemedText>
            <TouchableOpacity onPress={() => setShowSearchModal(false)}>
              <Icon name="close" size={24} color={tintColor} />
            </TouchableOpacity>
          </ThemedView>
          <TextInput
            style={[styles.searchInput, { borderColor, color: tintColor }]}
            placeholder="Search items..."
            value={searchQuery}
            onChangeText={handleSearch}
          />
          <ScrollView style={styles.searchResults}>
            {searchResults.map(item => (
              <ThemedView key={item.id} style={styles.searchItem}>
                <ThemedText style={styles.itemCategoryIcon}>{getCategoryIcon(item.category)}</ThemedText>
                <ThemedView style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.itemValue}>{formatPrice(item.pricePaid || 0)}</ThemedText>
              </ThemedView>
            ))}
          </ScrollView>
        </ThemedView>
      </Modal>
      
      {/* Analytics Screen */}
      <Modal visible={showAnalytics} animationType="slide" presentationStyle="fullScreen">
        <AnalyticsScreen onBack={() => setShowAnalytics(false)} />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  section: {
    backgroundColor: 'rgba(0, 0, 0, 0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  actionText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  categoryChip: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 6,
  },
  categoryBadge: {
    fontSize: 12,
    fontWeight: '600',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    textAlign: 'center',
  },
  categoryCount: {
    fontSize: 12,
    opacity: 0.7,
  },
  reviewItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    gap: 12,
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 8,
  },
  valueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    marginBottom: 8,
  },
  itemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  itemCategory: {
    fontSize: 12,
    opacity: 0.6,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  itemCategoryIcon: {
    fontSize: 16,
    marginRight: 12,
  },
  modalContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingTop: 50,
    marginBottom: 8,
  },
  searchResults: {
    flex: 1,
  },
  searchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    marginBottom: 8,
  },

  addButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    margin: 16,
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  searchInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    margin: 16,
    fontSize: 16,
  },
});