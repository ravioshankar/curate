import { StyleSheet, ScrollView, Text } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { StatCard } from '../components/common/StatCard';
import { RootState } from '../store/store';
import { calculateInventoryStats } from '../utils/inventoryUtils';
import { loadInventory } from '../store/inventoryStore';

export function DashboardScreen() {
  const dispatch = useDispatch();
  const inventory = useSelector((state: RootState) => state.inventory.items);
  const stats = calculateInventoryStats(inventory);

  useEffect(() => {
    dispatch(loadInventory() as any);
  }, [dispatch]);
  
  const longUnusedItems = (inventory || []).filter(item => {
    const lastUsedDate = new Date(item.lastUsed);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastUsedDate < oneYearAgo;
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedText type="title" style={styles.title}>Dashboard</ThemedText>
        
      <ThemedView style={styles.statsContainer}>
        <StatCard 
          title="Total Items" 
          value={stats.totalItems} 
          iconName="inventory"
          color="#6366F1" 
        />
        <StatCard 
          title="Categories" 
          value={stats.categories} 
          iconName="category"
          color="#06B6D4" 
        />
        <StatCard 
          title="Unused > 1yr" 
          value={stats.unusedItems} 
          iconName="schedule"
          color="#EF4444" 
        />
      </ThemedView>

      <ThemedView style={styles.reviewSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Items to Review</ThemedText>
        {longUnusedItems.length > 0 ? (
          <ThemedView style={styles.itemsList}>
            {longUnusedItems.map(item => (
              <ThemedView key={item.id} style={styles.reviewItem}>
                <ThemedView style={styles.itemInfo}>
                  <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                  <ThemedText style={styles.itemDate}>Last used: {item.lastUsed}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.moreIcon}>⋮</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>
        ) : (
          <ThemedText style={styles.noItemsText}>
            All items have been used recently. Great job!
          </ThemedText>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  title: {
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  iconText: {
    fontSize: 24,
    color: 'white',
    textAlign: 'center',
  },
  reviewSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  itemsList: {
    gap: 12,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 12,
    borderRadius: 8,
  },
  itemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 14,
    opacity: 0.7,
  },
  moreIcon: {
    fontSize: 20,
    opacity: 0.5,
  },
  noItemsText: {
    opacity: 0.7,
    fontStyle: 'italic',
  },
});