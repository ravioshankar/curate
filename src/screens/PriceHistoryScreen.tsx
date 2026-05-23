import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemedView, ThemedText } from '../../components';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../store/store';
import { priceHistoryActions } from '../store/priceHistoryReducer';
import { priceTrackingService } from '../../src/services/PriceTrackingService';
import { PriceCard } from '../PriceCard';

interface PriceHistoryScreenProps {
  itemId: string;
  itemName: string;
  category: string;
}

export function PriceHistoryScreen({ itemId, itemName, category }: PriceHistoryScreenProps) {
  const [showAddPrice, setShowAddPrice] = useState(false);
  const [newValue, setNewValue] = useState<string>('');
  
  // Get price history from store
  const priceRecords = useSelector((state: RootState) => state.priceHistory.items[itemId] || []);
  
  // Get collection item for context
  const currentValuation = useSelector((state: RootState) => {
    return (state.priceHistory.items[itemId] || []).length > 0 
      ? (state.priceHistory.items[itemId] as any)[0].value 
      : 0;
  });

  // Format currency
  const formatCurrency = (amount: number) => `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  
  // Calculate price change
  const originalPrice = parseFloat(priceRecords[priceRecords.length - 1]?.notes?.replace(/[^0-9.-]/g, '') || '0') || 
                       parseFloat((state.priceHistory.items[itemId] as any)?.[0]?.value?.toString().match(/\d+/)?.[0] || '0');
  
  const originalPrice = 0; // Simplified - would need to track purchase price separately

  // Sort records by date (newest first)
  const sortedRecords = priceRecords.sort((a, b) => 
    new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime()
  );

  // Calculate overall change
  const recentRecord = sortedRecords[0];
  const changePercent = originalPrice > 0 ? ((currentValuation - originalPrice) / originalPrice * 100) : 0;
  const trend = changePercent > 5 ? 'up' : changePercent < -5 ? 'down' : 'stable';

  const handleAddPrice = () => {
    if (!newValue || parseFloat(newValue) <= 0) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    const priceValue = parseFloat(newValue);
    
    // Add price record to store
    priceHistoryActions.addPriceRecord(itemId, {
      itemName,
      value: priceValue,
      currency: 'USD',
      recordedAt: new Date().toISOString(),
      source: 'manual',
      notes: `Manual entry - ${priceValue.toFixed(2)}`,
    });

    // Set default for next time
    setNewValue('');
    
    Alert.alert('Success', 'Price record added successfully!', [{ text: 'OK' }]);
    setShowAddPrice(false);
  };

  const handleDeleteRecord = (recordId: string) => {
    Alert.alert(
      'Delete Price Record',
      'Are you sure you want to delete this price record?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => {
          priceHistoryActions.removePriceRecord({ itemId, recordId });
        }}
      ]
    );
  };

  const handleTriggerRevaluation = () => {
    priceTrackingService.triggerRevaluation(itemId).then(() => {
      Alert.alert('Success', 'Revaluation completed. Current value updated.');
    }).catch((error) => {
      Alert.alert('Error', error.message);
    });
  };

  return (
    <ThemedView style={styles.container} testID={`price-history-${itemId}`}>
      {/* Header */}
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={() => alert('Navigate back to collection')}>
          <Icon name="arrow-back" size={24} color="#9CA3AF" />
        </TouchableOpacity>
        <ThemedText type="title">{itemName}</ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      {/* Quick Actions */}
      <ThemedView style={styles.actionsBar}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#10B981' }]}
          onPress={() => setShowAddPrice(true)}
        >
          <Icon name="add-circle" size={20} color="white" />
          <Text style={styles.actionButtonText}>Add Price</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={handleTriggerRevaluation}
        >
          <Icon name="refresh" size={20} color="white" />
          <Text style={styles.actionButtonText}>Revalue</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
          onPress={() => alert('View full analytics')}
        >
          <Icon name="analytics" size={20} color="white" />
          <Text style={styles.actionButtonText}>Analytics</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Current Value Card */}
      <PriceCard 
        itemName={itemName}
        category={category}
        currentValue={currentValuation}
        originalValue={originalPrice}
        changePercent={changePercent}
        trend={trend}
        chartData={sortedRecords.map(r => ({
          date: r.recordedAt,
          value: r.value,
          source: r.source,
        }))}
        onEditPress={() => setShowAddPrice(true)}
      />

      {/* Price History Table */}
      <ThemedView style={styles.historySection}>
        <ThemedText type="subtitle">📋 Price History</ThemedText>
        
        <ScrollView style={styles.tableContainer}>
          {sortedRecords.map((record) => (
            <View key={record.id} style={styles.historyRow}>
              <Text style={styles.date}>{new Date(record.recordedAt).toLocaleDateString()}</Text>
              <Text style={[
                styles.value,
                { color: changePercent >= 0 ? '#059669' : '#dc2626' }
              ]}>
                {formatCurrency(record.value)}
              </Text>
              <View style={styles.sourceBadge}>
                <Icon 
                  name={record.source === 'manual' ? 'edit' : record.source === 'market_api' ? 'trending-up' : 'receipt'} 
                  size={14} 
                  color="#6B7280"
                />
                <Text style={styles.source}>{record.source}</Text>
              </View>
              <TouchableOpacity onPress={() => handleDeleteRecord(record.id)}>
                <Icon name="delete" size={20} color="#EF4444" />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {sortedRecords.length === 0 && (
          <ThemedView style={styles.emptyState}>
            <Text style={styles.emptyText}>No price history yet</Text>
            <Text style={[styles.emptyHint, { color: '#6B7280' }]}>
              Tap "Add Price" to record the current value of this item
            </Text>
          </ThemedView>
        )}
      </ThemedView>

      {/* Insights */}
      <ThemedView style={styles.insightsSection}>
        <ThemedText type="subtitle">💡 Insights</ThemedText>
        
        {sortedRecords.length > 0 && (
          <>
            <ThemedView style={styles.insightItem}>
              <Icon name="trending-up" size={20} color="#10B981" />
              <Text style={[styles.insightText, { color: '#6B7280' }]}>
                Total value change: 
                <Text style={[{ fontWeight: '600', color: changePercent >= 0 ? '#059669' : '#dc2626' }]}>
                  {'>'} (appreciation) or {'<'} (depreciation)
                </Text>
              </Text>
            </ThemedView>

            <ThemedView style={styles.insightItem}>
              <Icon name="schedule" size={20} color="#3B82F6" />
              <Text style={[styles.insightText, { color: '#6B7280' }]}>
                Last updated: {new Date(currentValuation).toLocaleDateString()}
              </Text>
            </ThemedView>

            <ThemedView style={styles.insightItem}>
              <Icon name="assignment" size={20} color="#F59E0B" />
              <Text style={[styles.insightText, { color: '#6B7280' }]}>
                Source: Manual entries track your valuations over time
              </Text>
            </ThemedView>
          </>
        )}
      </ThemedView>

      {/* Add Price Modal */}
      {showAddPrice && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ThemedText type="subtitle">Add New Price Record</ThemedText>
            
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.input,
                  { borderColor: '#EF4444' }
                ]}
                value={newValue}
                onChangeText={setNewValue}
                placeholder="Enter new price (e.g., 2500.00)"
                keyboardType="decimal-pad"
                placeholderTextColor="#9CA3AF"
              />
            </View>

            <ThemedText style={styles.hint}>
              Example: If your watch is worth $2,500, enter "2500" or "2500.00"
            </ThemedText>

            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#EF4444' }]}
                onPress={() => setShowAddPrice(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalButton, { backgroundColor: '#10B981' }]}
                onPress={handleAddPrice}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Add Price</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  placeholder: {},
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 8,
    gap: 6,
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  historySection: {
    flex: 1,
    paddingHorizontal: 16,
    marginTop: 8,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  date: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
  },
  value: {
    flex: 2,
    fontSize: 16,
    fontWeight: '600',
  },
  sourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
  },
  source: {
    fontSize: 12,
    color: '#6B7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  emptyHint: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
  },
  insightsSection: {
    paddingHorizontal: 16,
    marginVertical: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 8,
    paddingHorizontal: 12,
  },
  insightText: {
    fontSize: 14,
    marginLeft: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 380,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#F9FAFB',
  },
  hint: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
});
