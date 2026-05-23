import React, { useState } from 'react';
import { StyleSheet, ScrollView, View, Text, TouchableOpacity, FlatList } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemedView, ThemedText } from '../../components';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { RootState } from '../store/store';
import { PriceCard } from '../../src/components/PriceCard';

interface ItemWithValuation {
  id: string;
  name: string;
  category: string;
  pricePaid?: number;
  priceHistory?: Array<{ value: number; recordedAt: string }>;
  lastRevaluedAt?: string;
}

export function ValuationAnalysisScreen() {
  const collection = useSelector((state: RootState) => state.collection.items);
  
  // Calculate portfolio metrics
  const portfolioStats = useMemo(() => {
    const itemsWithHistory = collection.filter(item => 
      Array.isArray(item.priceHistory) && item.priceHistory.length > 0
    );

    let totalCurrentValue = 0;
    let totalInvestment = 0;
    let netAppreciation = 0;

    for (const item of itemsWithHistory) {
      const currentPrice = item.priceHistory[0]?.value || item.pricePaid || 0;
      const originalPrice = Array.isArray(item.priceHistory) 
        ? item.priceHistory[item.priceHistory.length - 1]?.value 
        : item.pricePaid || 0;

      totalCurrentValue += currentPrice;
      totalInvestment += originalPrice;
      netAppreciation += (currentPrice - originalPrice);
    }

    const appreciationPercent = totalInvestment > 0 ? (netAppreciation / totalInvestment) * 100 : 0;

    return {
      totalCurrentValue,
      totalInvestment,
      netAppreciation,
      appreciationPercent,
      itemCount: itemsWithHistory.length,
    };
  }, [collection]);

  const formatCurrency = (amount: number) => 
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <ThemedView style={styles.container} testID="valuation-analysis-screen">
      {/* Header */}
      <ThemedView style={styles.header}>
        <Text style={[styles.title, { fontSize: 28 }]}>📊 Valuation Portfolio</Text>
        <TouchableOpacity 
          onPress={() => alert('Portfolio summary: Total items tracked'}
        >
          <Icon name="info-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </ThemedView>

      {/* Portfolio Summary Cards */}
      <ThemedView style={styles.summarySection}>
        <View style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { fontSize: 14 }]}>Current Portfolio Value</Text>
          <Text style={[styles.summaryValue, { color: '#059669' }]}>{formatCurrency(portfolioStats.totalCurrentValue)}</Text>
          <Text style={[styles.summarySubtext, { color: '#6B7280' }]}>Tracked items</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={[styles.summaryLabel, { fontSize: 14 }]}>Original Investment</Text>
          <Text style={[styles.summaryValue, { color: '#6B7280' }]}>{formatCurrency(portfolioStats.totalInvestment)}</Text>
          <Text style={[styles.summarySubtext, { color: '#6B7280' }]}>Initial costs</Text>
        </View>

        <View style={[styles.summaryCard, portfolioStats.appreciationPercent >= 0 && styles.positiveSummary]}>
          <Text style={[styles.summaryLabel, { fontSize: 14 }]}>Net Change</Text>
          <Text style={[
            styles.summaryValue, 
            portfolioStats.appreciationPercent >= 0 ? { color: '#059669' } : { color: '#dc2626' }
          ]}>
            {portfolioStats.appreciationPercent >= 0 ? '+' : ''}
            {formatCurrency(portfolioStats.netAppreciation)}
          </Text>
          <Text style={[styles.summarySubtext, { color: '#6B7280' }]}>
            {portfolioStats.appreciationPercent >= 0 ? '▲ Appreciated' : '▼ Depreciated'} {portfolioStats.itemCount} items
          </Text>
        </View>
      </ThemedView>

      {/* Top Gainers/Losers */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle">🏆 Top Performers</ThemedText>
        
        <FlatList
          data={collection.slice(0, 5)} // Show top 5 items for now
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemRow}>
              <ThemedView style={styles.itemInfo}>
                <Text style={[styles.itemName, { fontSize: 15 }]}>
                  {Array.isArray(item.priceHistory) ? `${item.name}` : 'Not Tracked'}
                </Text>
                <Text style={[styles.itemCategory, { fontSize: 12, color: '#6B7280' }]}>
                  {item.category}
                </Text>
              </ThemedView>

              {Array.isArray(item.priceHistory) && (
                <>
                  <Text style={[
                    styles.itemValue,
                    { 
                      color: item.pricePaid > 0 ? '#10B981' : '#6B7280',
                      fontSize: 14,
                      fontWeight: '600',
                    }
                  ]}>
                    {formatCurrency(item.priceHistory[0]?.value || item.pricePaid || 0)}
                  </Text>
                  
                  <TouchableOpacity 
                    style={styles.trackButton}
                    onPress={() => console.log('Track price for', item.name)}
                  >
                    <Icon name="add-circle-outline" size={18} color="#3B82F6" />
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}
        />
      </ThemedView>

      {/* Insights & Recommendations */}
      <ThemedView style={styles.insightsSection}>
        <ThemedText type="subtitle">💡 Smart Insights</ThemedText>
        
        <ThemedView style={styles.insightItem}>
          <Icon name="analytics" size={20} color="#3B82F6" />
          <Text style={[styles.insightText, { color: '#6B7280' }]}>
            Track more items to get full portfolio analytics
          </Text>
        </ThemedView>

        <ThemedView style={styles.insightItem}>
          <Icon name="trending-up" size={20} color="#10B981" />
          <Text style={[styles.insightText, { color: '#6B7280' }]}>
            Items with price history show your collection's value evolution
          </Text>
        </ThemedView>

        <ThemedView style={styles.insightItem}>
          <Icon name="assignment" size={20} color="#F59E0B" />
          <Text style={[styles.insightText, { color: '#6B7280' }]}>
            Tap "Revalue" to update current valuations automatically
          </Text>
        </ThemedView>
      </ThemedView>

      {/* Action Buttons */}
      <ThemedView style={styles.actionsBar}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#3B82F6' }]}
          onPress={() => alert('Start tracking new items')}
        >
          <Icon name="add" size={20} color="white" />
          <Text style={[styles.actionButtonText, { color: 'white' }]}>+ Track Items</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: '#6B7280' }]}
          onPress={() => alert('View full analytics')}
        >
          <Icon name="analytics-outline" size={20} color="white" />
          <Text style={[styles.actionButtonText, { color: 'white' }]}>Analytics</Text>
        </TouchableOpacity>
      </ThemedView>

      {/* Export/Settings */}
      <View style={styles.footer}>
        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => alert('Export your collection data')}
        >
          <Icon name="download" size={20} color="#6B7280" />
          <Text style={[styles.footerText, { color: '#6B7280' }]}>Export Data</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.footerButton}
          onPress={() => alert('Valuation settings')}
        >
          <Icon name="settings" size={20} color="#6B7280" />
          <Text style={[styles.footerText, { color: '#6B7280' }]}>Settings</Text>
        </TouchableOpacity>
      </View>
    </ThemedView>
  );
}

// Add useMemo import to imports at the top
import { useMemo } from 'react';

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
  title: {
    fontWeight: '700',
  },
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  positiveSummary: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
  },
  summaryLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 4,
  },
  summarySubtext: {
    fontSize: 12,
    marginTop: 4,
    color: '#6B7280',
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginVertical: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  itemCategory: {
    fontSize: 12,
    marginTop: 4,
  },
  itemValue: {
    fontSize: 15,
    fontWeight: '600',
    color: '#059669',
  },
  trackButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  insightsSection: {
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 16,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  insightText: {
    fontSize: 14,
    marginLeft: 12,
    lineHeight: 20,
  },
  actionsBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 6,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  footerButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 4,
  },
});
