import React, { useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { AppDispatch, RootState } from '../store/store';
import { updateCollectionItem } from '../store/collectionStore';
import { CollectionItem } from '../types/collection';

type PriceRecord = NonNullable<CollectionItem['priceHistory']>[number];
type PerformanceFilter = 'all' | 'gainers' | 'losers' | 'stale';

interface ValuationItem extends CollectionItem {
  currentValue: number;
  originalValue: number;
  changeAmount: number;
  changePercent: number;
  history: PriceRecord[];
  isTracked: boolean;
  isStale: boolean;
  lastValuedLabel: string;
}

const STALE_AFTER_DAYS = 90;

const formatCurrency = (amount: number) =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const sortHistory = (history: PriceRecord[] = []) =>
  [...history].sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());

const daysBetween = (date: string) => {
  const timestamp = new Date(date).getTime();
  if (Number.isNaN(timestamp)) return null;
  return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60 * 24));
};

const getLastValuedLabel = (recordedAt?: string) => {
  if (!recordedAt) return 'Not valued yet';
  const days = daysBetween(recordedAt);
  if (days === null) return 'Date unavailable';
  if (days <= 0) return 'Updated today';
  if (days === 1) return 'Updated yesterday';
  return `Updated ${days} days ago`;
};

const toCollectionItem = (item: ValuationItem): CollectionItem => ({
  id: item.id,
  name: item.name,
  category: item.category,
  location: item.location,
  lastUsed: item.lastUsed,
  imageUrl: item.imageUrl,
  pricePaid: item.pricePaid,
  priceExpected: item.priceExpected,
  priceHistory: item.priceHistory,
  lastRevaluedAt: item.lastRevaluedAt,
  notes: item.notes,
});

export function ValuationAnalysisScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const collection = useSelector((state: RootState) => state.collection.items);
  const [filter, setFilter] = useState<PerformanceFilter>('all');
  const [selectedItem, setSelectedItem] = useState<ValuationItem | null>(null);
  const [valuationInput, setValuationInput] = useState('');
  const [notesInput, setNotesInput] = useState('');
  const [saving, setSaving] = useState(false);

  const valuationItems = useMemo<ValuationItem[]>(() => {
    return collection.map((item) => {
      const history = sortHistory(item.priceHistory);
      const latestRecord = history[0];
      const oldestRecord = history[history.length - 1];
      const fallbackCurrent = item.priceExpected ?? item.pricePaid ?? 0;
      const currentValue = latestRecord?.value ?? fallbackCurrent;
      const originalValue = item.pricePaid ?? oldestRecord?.value ?? fallbackCurrent;
      const changeAmount = currentValue - originalValue;
      const changePercent = originalValue > 0 ? (changeAmount / originalValue) * 100 : 0;
      const lastRecordedAt = latestRecord?.recordedAt ?? item.lastRevaluedAt;
      const daysSinceValuation = lastRecordedAt ? daysBetween(lastRecordedAt) : null;

      return {
        ...item,
        currentValue,
        originalValue,
        changeAmount,
        changePercent,
        history,
        isTracked: history.length > 0,
        isStale: !lastRecordedAt || (daysSinceValuation !== null && daysSinceValuation >= STALE_AFTER_DAYS),
        lastValuedLabel: getLastValuedLabel(lastRecordedAt),
      };
    });
  }, [collection]);

  const portfolioStats = useMemo(() => {
    const trackedItems = valuationItems.filter((item) => item.isTracked || item.currentValue > 0);
    const totalCurrentValue = trackedItems.reduce((sum, item) => sum + item.currentValue, 0);
    const totalInvestment = trackedItems.reduce((sum, item) => sum + item.originalValue, 0);
    const netAppreciation = totalCurrentValue - totalInvestment;
    const appreciationPercent = totalInvestment > 0 ? (netAppreciation / totalInvestment) * 100 : 0;
    const staleCount = valuationItems.filter((item) => item.isStale).length;
    const untrackedCount = valuationItems.filter((item) => !item.isTracked).length;

    return {
      totalCurrentValue,
      totalInvestment,
      netAppreciation,
      appreciationPercent,
      trackedCount: trackedItems.length,
      staleCount,
      untrackedCount,
    };
  }, [valuationItems]);

  const filteredItems = useMemo(() => {
    const items = valuationItems.filter((item) => {
      if (filter === 'gainers') return item.changeAmount > 0;
      if (filter === 'losers') return item.changeAmount < 0;
      if (filter === 'stale') return item.isStale;
      return item.currentValue > 0 || item.isTracked;
    });

    return items.sort((a, b) => {
      if (filter === 'stale') {
        return (a.isTracked === b.isTracked ? 0 : a.isTracked ? 1 : -1) || b.currentValue - a.currentValue;
      }
      return Math.abs(b.changePercent) - Math.abs(a.changePercent);
    });
  }, [filter, valuationItems]);

  const bestPerformer = valuationItems
    .filter((item) => item.changeAmount > 0)
    .sort((a, b) => b.changePercent - a.changePercent)[0];
  const mostAtRisk = valuationItems
    .filter((item) => item.changeAmount < 0)
    .sort((a, b) => a.changePercent - b.changePercent)[0];
  const hasCollectionItems = valuationItems.length > 0;

  const openValuationModal = (item: ValuationItem) => {
    setSelectedItem(item);
    setValuationInput(item.currentValue > 0 ? item.currentValue.toFixed(2) : '');
    setNotesInput('');
  };

  const closeValuationModal = () => {
    if (saving) return;
    setSelectedItem(null);
    setValuationInput('');
    setNotesInput('');
  };

  const saveValuation = async () => {
    if (!selectedItem) return;

    const nextValue = Number(valuationInput.replace(/,/g, ''));
    if (!Number.isFinite(nextValue) || nextValue <= 0) {
      Alert.alert('Invalid valuation', 'Enter a value greater than zero.');
      return;
    }

    const now = new Date().toISOString();
    const record: PriceRecord = {
      id: `price_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      value: nextValue,
      currency: 'USD',
      recordedAt: now,
      source: selectedItem.isTracked ? 'manual' : 'initial',
      notes: notesInput.trim() || `Valued at ${formatCurrency(nextValue)}`,
    };

    const updatedItem: CollectionItem = {
      ...toCollectionItem(selectedItem),
      priceExpected: nextValue,
      priceHistory: [record, ...selectedItem.history],
      lastRevaluedAt: now,
    };

    setSaving(true);
    try {
      await dispatch(updateCollectionItem(updatedItem)).unwrap();
      setSelectedItem(null);
      setValuationInput('');
      setNotesInput('');
    } catch (error) {
      Alert.alert('Could not save valuation', error instanceof Error ? error.message : 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderItem = (item: ValuationItem) => {
    const isPositive = item.changeAmount >= 0;

    return (
      <TouchableOpacity style={styles.itemRow} onPress={() => openValuationModal(item)}>
        <ThemedView style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          <Text style={styles.itemCategory}>{item.category} - {item.lastValuedLabel}</Text>
        </ThemedView>

        <View style={styles.itemMetrics}>
          <Text style={styles.itemValue}>{formatCurrency(item.currentValue)}</Text>
          <Text style={[styles.itemChange, isPositive ? styles.positiveText : styles.negativeText]}>
            {isPositive ? '+' : ''}{item.changePercent.toFixed(1)}%
          </Text>
        </View>

        <Icon name={item.isTracked ? 'edit' : 'add-circle-outline'} size={22} color="#2563EB" />
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container} testID="valuation-analysis-screen">
      <ScrollView contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <View>
            <Text style={styles.title}>Valuation Portfolio</Text>
            <Text style={styles.subtitle}>{portfolioStats.trackedCount} items valued</Text>
          </View>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => Alert.alert('Valuation tracking', 'Record current values over time to see gains, losses, stale estimates, and total portfolio movement.')}
          >
            <Icon name="info-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.summarySection}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Current Value</Text>
            <Text style={[styles.summaryValue, styles.positiveText]}>{formatCurrency(portfolioStats.totalCurrentValue)}</Text>
            <Text style={styles.summarySubtext}>Latest recorded valuations</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Original Cost</Text>
            <Text style={styles.summaryValue}>{formatCurrency(portfolioStats.totalInvestment)}</Text>
            <Text style={styles.summarySubtext}>Purchase or first value</Text>
          </View>

          <View style={[styles.summaryCard, portfolioStats.netAppreciation >= 0 ? styles.positiveSummary : styles.negativeSummary]}>
            <Text style={styles.summaryLabel}>Net Change</Text>
            <Text style={[styles.summaryValue, portfolioStats.netAppreciation >= 0 ? styles.positiveText : styles.negativeText]}>
              {portfolioStats.netAppreciation >= 0 ? '+' : ''}{formatCurrency(portfolioStats.netAppreciation)}
            </Text>
            <Text style={styles.summarySubtext}>
              {portfolioStats.appreciationPercent >= 0 ? '+' : ''}{portfolioStats.appreciationPercent.toFixed(1)}% overall
            </Text>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Performance Watchlist</ThemedText>
            <TouchableOpacity
              style={styles.smallButton}
              onPress={() => {
                if (!hasCollectionItems) {
                  Alert.alert('No items to value', 'Add items from the Dashboard tab first, then record their current values here.');
                  return;
                }

                const firstStale = valuationItems.find((item) => item.isStale) ?? valuationItems[0];
                if (firstStale) openValuationModal(firstStale);
              }}
            >
              <Icon name="add" size={18} color="#FFFFFF" />
              <Text style={styles.smallButtonText}>Record</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterBar}>
            {[
              ['all', 'All'],
              ['gainers', 'Gainers'],
              ['losers', 'Losses'],
              ['stale', 'Needs Update'],
            ].map(([value, label]) => (
              <TouchableOpacity
                key={value}
                style={[styles.filterChip, filter === value && styles.activeFilterChip]}
                onPress={() => setFilter(value as PerformanceFilter)}
              >
                <Text style={[styles.filterText, filter === value && styles.activeFilterText]}>{label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {filteredItems.length > 0 ? (
            filteredItems.slice(0, 8).map((item) => (
              <View key={item.id}>{renderItem(item)}</View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Icon name={hasCollectionItems ? 'filter-list-off' : 'inventory-2'} size={28} color="#6B7280" />
              <Text style={styles.emptyTitle}>
                {hasCollectionItems ? 'No items match this view' : 'Add items to start valuations'}
              </Text>
              <Text style={styles.emptyText}>
                {hasCollectionItems
                  ? 'Try another filter or record a fresh valuation for an item.'
                  : 'Valuation uses your collection items to track current value, gains, losses, and stale estimates.'}
              </Text>
              {!hasCollectionItems && (
                <TouchableOpacity style={styles.emptyActionButton} onPress={() => router.push('/')}>
                  <Icon name="inventory-2" size={18} color="#FFFFFF" />
                  <Text style={styles.emptyActionText}>Add Items</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </ThemedView>

        <ThemedView style={styles.insightsSection}>
          <ThemedText type="subtitle">Smart Insights</ThemedText>

          <ThemedView style={styles.insightItem}>
            <Icon name="schedule" size={20} color="#D97706" />
            <Text style={styles.insightText}>
              {portfolioStats.staleCount > 0
                ? `${portfolioStats.staleCount} items have stale or missing valuations.`
                : 'All tracked valuations are current.'}
            </Text>
          </ThemedView>

          <ThemedView style={styles.insightItem}>
            <Icon name="trending-up" size={20} color="#059669" />
            <Text style={styles.insightText}>
              {bestPerformer
                ? `${bestPerformer.name} is up ${bestPerformer.changePercent.toFixed(1)}%.`
                : 'Record a second valuation to identify top gainers.'}
            </Text>
          </ThemedView>

          <ThemedView style={styles.insightItem}>
            <Icon name="warning-amber" size={20} color="#DC2626" />
            <Text style={styles.insightText}>
              {mostAtRisk
                ? `${mostAtRisk.name} is down ${Math.abs(mostAtRisk.changePercent).toFixed(1)}%.`
                : `${portfolioStats.untrackedCount} items are ready for first valuation.`}
            </Text>
          </ThemedView>
        </ThemedView>
      </ScrollView>

      <Modal visible={Boolean(selectedItem)} animationType="slide" transparent onRequestClose={closeValuationModal}>
        <KeyboardAvoidingView
          style={styles.modalBackdrop}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Record Valuation</Text>
                <Text style={styles.modalSubtitle}>{selectedItem?.name}</Text>
              </View>
              <TouchableOpacity style={styles.iconButton} onPress={closeValuationModal}>
                <Icon name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Current value</Text>
            <TextInput
              value={valuationInput}
              onChangeText={setValuationInput}
              keyboardType="decimal-pad"
              placeholder="0.00"
              style={styles.input}
              autoFocus
            />

            <Text style={styles.inputLabel}>Notes</Text>
            <TextInput
              value={notesInput}
              onChangeText={setNotesInput}
              placeholder="Appraisal, market check, condition notes"
              style={[styles.input, styles.notesInput]}
              multiline
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={closeValuationModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.saveButton]} onPress={saveValuation} disabled={saving}>
                <Text style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    paddingBottom: 28,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    color: '#111827',
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 4,
  },
  iconButton: {
    minHeight: 40,
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summarySection: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  summaryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  positiveSummary: {
    borderColor: '#86EFAC',
    backgroundColor: '#F0FDF4',
  },
  negativeSummary: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  summaryLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  summaryValue: {
    color: '#374151',
    fontSize: 20,
    fontWeight: '700',
    marginVertical: 4,
  },
  summarySubtext: {
    color: '#6B7280',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  smallButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 4,
  },
  smallButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  filterBar: {
    gap: 8,
    paddingBottom: 8,
  },
  filterChip: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFilterChip: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  filterText: {
    color: '#4B5563',
    fontSize: 13,
    fontWeight: '700',
  },
  activeFilterText: {
    color: '#1D4ED8',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    marginBottom: 8,
    gap: 12,
  },
  itemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    color: '#111827',
    fontSize: 15,
    fontWeight: '700',
  },
  itemCategory: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 4,
  },
  itemMetrics: {
    alignItems: 'flex-end',
    minWidth: 86,
  },
  itemValue: {
    color: '#111827',
    fontSize: 14,
    fontWeight: '700',
  },
  itemChange: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 4,
  },
  positiveText: {
    color: '#059669',
  },
  negativeText: {
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 18,
  },
  emptyTitle: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  emptyText: {
    color: '#6B7280',
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
  emptyActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    gap: 6,
    marginTop: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  emptyActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  insightsSection: {
    paddingHorizontal: 16,
    gap: 8,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  insightText: {
    color: '#4B5563',
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    marginLeft: 12,
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(17, 24, 39, 0.45)',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  modalTitle: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
  },
  modalSubtitle: {
    color: '#6B7280',
    fontSize: 14,
    marginTop: 2,
  },
  inputLabel: {
    color: '#374151',
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    color: '#111827',
    fontSize: 16,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  notesInput: {
    minHeight: 86,
    paddingTop: 12,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },
  modalButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    paddingVertical: 13,
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
  },
  saveButton: {
    backgroundColor: '#2563EB',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '800',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
