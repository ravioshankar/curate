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

export function DashboardScreen() {
  const dispatch = useDispatch();
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showReportsModal, setShowReportsModal] = useState(false);
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

  const handleAddItem = (item: any) => {
    dispatch(addInventoryItem(item));
    setShowAddModal(false);
    // Refresh inventory to show new item
    setTimeout(() => {
      dispatch(loadInventory());
    }, 100);
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
            onPress={() => setShowReportsModal(true)}
          >
            <Icon name="analytics" size={24} color="white" />
            <ThemedText style={styles.actionText}>Reports</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      {/* Category Filter */}
      <ThemedView style={[styles.section, { borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          style={styles.categoryScroll}
          nestedScrollEnabled={true}
          contentContainerStyle={styles.categoryScrollContent}
        >
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
              <ThemedText style={[styles.categoryText, selectedCategory === category && { color: 'white' }]}>
                {category}
              </ThemedText>
              <ThemedText style={[styles.categoryBadge, selectedCategory === category && { color: 'white' }]}>
                {categoryCounts[category]}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <ThemedText style={styles.categoryCount}>{filteredItems.length} items</ThemedText>
      </ThemedView>

      {/* Items Needing Attention */}
      {longUnusedItems.length > 0 && (
        <ThemedView style={[styles.section, { borderColor }]}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            ⚠️ Items to Review{selectedCategory !== 'all' ? ` (${selectedCategory})` : ''}
          </ThemedText>
          {longUnusedItems.slice(0, 3).map(item => (
            <ThemedView key={item.id} style={styles.reviewItem}>
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
      
      {/* Reports Modal */}
      <Modal visible={showReportsModal} animationType="slide">
        <ThemedView style={styles.modalContainer}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText type="title">📊 Analytics Report</ThemedText>
            <TouchableOpacity onPress={() => setShowReportsModal(false)}>
              <Icon name="close" size={24} color={tintColor} />
            </TouchableOpacity>
          </ThemedView>
          <ScrollView 
            style={styles.reportContent}
            contentContainerStyle={styles.reportScrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Financial Overview */}
            <ThemedView style={styles.reportSection}>
              <ThemedText type="subtitle" style={styles.reportTitle}>💰 Financial Overview</ThemedText>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Total Investment:</ThemedText>
                <ThemedText style={[styles.statValue, { color: '#059669' }]}>{formatPrice(totalValue)}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Expected Value:</ThemedText>
                <ThemedText style={[styles.statValue, { color: '#d97706' }]}>{formatPrice(expectedValue)}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Net Change:</ThemedText>
                <ThemedText style={[styles.statValue, { color: expectedValue >= totalValue ? '#059669' : '#dc2626' }]}>
                  {expectedValue >= totalValue ? '+' : ''}{formatPrice(expectedValue - totalValue)}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Average Item Value:</ThemedText>
                <ThemedText style={styles.statValue}>{formatPrice(totalValue / (inventory.length || 1))}</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Inventory Insights */}
            <ThemedView style={styles.reportSection}>
              <ThemedText type="subtitle" style={styles.reportTitle}>📦 Inventory Insights</ThemedText>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Total Items:</ThemedText>
                <ThemedText style={styles.statValue}>{inventory.length}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Categories:</ThemedText>
                <ThemedText style={styles.statValue}>{categories.length}</ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Unused Items (>1yr):</ThemedText>
                <ThemedText style={[styles.statValue, { color: longUnusedItems.length > 0 ? '#dc2626' : '#059669' }]}>
                  {longUnusedItems.length}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Items Used Recently:</ThemedText>
                <ThemedText style={[styles.statValue, { color: '#059669' }]}>
                  {inventory.length - longUnusedItems.length}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Category Breakdown */}
            <ThemedView style={styles.reportSection}>
              <ThemedText type="subtitle" style={styles.reportTitle}>📊 Category Analysis</ThemedText>
              {Object.entries(
                categories.reduce((acc, cat) => {
                  const categoryItems = inventory.filter(item => item.category === cat);
                  const categoryValue = categoryItems.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
                  acc[cat] = { count: categoryItems.length, value: categoryValue };
                  return acc;
                }, {} as Record<string, { count: number; value: number }>)
              )
              .sort(([,a], [,b]) => b.value - a.value)
              .map(([category, data]) => (
                <ThemedView key={category} style={styles.categoryRow}>
                  <ThemedView style={styles.categoryInfo}>
                    <ThemedText style={styles.categoryName}>{category}</ThemedText>
                    <ThemedText style={styles.categoryCount}>{data.count} items</ThemedText>
                  </ThemedView>
                  <ThemedText style={styles.categoryValue}>{formatPrice(data.value)}</ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Usage Patterns */}
            <ThemedView style={styles.reportSection}>
              <ThemedText type="subtitle" style={styles.reportTitle}>📈 Usage Patterns</ThemedText>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Most Active Category:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {categories.reduce((max, cat) => {
                    const catItems = inventory.filter(item => item.category === cat);
                    const recentItems = catItems.filter(item => {
                      const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceUsed < 30;
                    });
                    return recentItems.length > (inventory.filter(item => item.category === max).filter(item => {
                      const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                      return daysSinceUsed < 30;
                    }).length || 0) ? cat : max;
                  }, categories[0] || 'None')}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Items Used This Month:</ThemedText>
                <ThemedText style={[styles.statValue, { color: '#059669' }]}>
                  {inventory.filter(item => {
                    const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSinceUsed < 30;
                  }).length}
                </ThemedText>
              </ThemedView>
              <ThemedView style={styles.statRow}>
                <ThemedText style={styles.statLabel}>Avg. Days Since Last Use:</ThemedText>
                <ThemedText style={styles.statValue}>
                  {Math.round(inventory.reduce((sum, item) => {
                    const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return sum + daysSinceUsed;
                  }, 0) / (inventory.length || 1))}
                </ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Top Performers */}
            <ThemedView style={styles.reportSection}>
              <ThemedText type="subtitle" style={styles.reportTitle}>🏆 Top Performers</ThemedText>
              <ThemedText style={styles.sectionSubtitle}>Most Valuable Items</ThemedText>
              {topValueItems.slice(0, 3).map(item => (
                <ThemedView key={item.id} style={styles.topItemRow}>
                  <ThemedView style={styles.itemInfo}>
                    <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                    <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
                  </ThemedView>
                  <ThemedText style={[styles.itemValue, { color: '#059669' }]}>
                    {formatPrice(item.pricePaid || 0)}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {/* Recommendations */}
            <ThemedView style={styles.reportSection}>
              <ThemedText type="subtitle" style={styles.reportTitle}>💡 Smart Recommendations</ThemedText>
              {longUnusedItems.length > 0 && (
                <ThemedView style={styles.recommendationItem}>
                  <ThemedText style={styles.recommendationIcon}>⚠️</ThemedText>
                  <ThemedText style={styles.recommendationText}>
                    Consider selling or donating {longUnusedItems.length} unused items to free up space and recover value.
                  </ThemedText>
                </ThemedView>
              )}
              {expectedValue > totalValue && (
                <ThemedView style={styles.recommendationItem}>
                  <ThemedText style={styles.recommendationIcon}>📈</ThemedText>
                  <ThemedText style={styles.recommendationText}>
                    Your inventory has appreciated by {formatPrice(expectedValue - totalValue)}. Consider insurance coverage.
                  </ThemedText>
                </ThemedView>
              )}
              {categories.length > 5 && (
                <ThemedView style={styles.recommendationItem}>
                  <ThemedText style={styles.recommendationIcon}>🗂️</ThemedText>
                  <ThemedText style={styles.recommendationText}>
                    You have {categories.length} categories. Consider consolidating similar items for better organization.
                  </ThemedText>
                </ThemedView>
              )}
              <ThemedView style={styles.recommendationItem}>
                <ThemedText style={styles.recommendationIcon}>🎯</ThemedText>
                <ThemedText style={styles.recommendationText}>
                  Focus on using items in the '{categories.reduce((max, cat) => {
                    const catUnused = inventory.filter(item => item.category === cat && longUnusedItems.includes(item));
                    const maxUnused = inventory.filter(item => item.category === max && longUnusedItems.includes(item));
                    return catUnused.length > maxUnused.length ? cat : max;
                  }, categories[0] || 'General')}' category - they have the most unused items.
                </ThemedText>
              </ThemedView>
            </ThemedView>
          </ScrollView>
        </ThemedView>
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
  categoryScroll: {
    marginBottom: 8,
  },
  categoryScrollContent: {
    paddingRight: 16,
  },
  categoryChip: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
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
  reportContent: {
    flex: 1,
  },
  reportScrollContent: {
    paddingBottom: 100,
  },
  reportSection: {
    marginBottom: 16,
    marginHorizontal: 4,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  reportTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
    marginRight: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 0,
    marginRight: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 11,
    opacity: 0.6,
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'right',
    minWidth: 60,
    marginRight: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
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