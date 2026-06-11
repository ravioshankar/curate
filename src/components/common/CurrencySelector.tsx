import React, { useMemo, useState } from 'react';
import { Dimensions, Modal, Pressable, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { currencies, currencySymbols } from '../../utils/currencyUtils';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [showPopularModal, setShowPopularModal] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchText, setSearchText] = useState('');

  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const subtleText = useThemeColor({ light: '#78716C', dark: '#A8A29E' }, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const controlBg = useThemeColor({ light: '#FEF7F0', dark: '#1C1917' }, 'background');

  const selectedCurrencyData = currencies.find(currency => currency.code === selectedCurrency) || currencies[0];
  const popularCurrencies = useMemo(
    () => [...currencies].slice(0, 12).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  const filteredCurrencies = useMemo(() => {
    const query = searchText.trim().toLowerCase();
    const source = query
      ? currencies.filter(currency =>
          currency.name.toLowerCase().includes(query) ||
          currency.code.toLowerCase().includes(query)
        )
      : currencies;

    return [...source].sort((a, b) => a.name.localeCompare(b.name));
  }, [searchText]);

  const closeAll = () => {
    setShowPopularModal(false);
    setShowAllModal(false);
    setSearchText('');
  };

  const handleSelect = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    closeAll();
  };

  const renderCurrencyRow = (currency: (typeof currencies)[number]) => {
    const selected = selectedCurrency === currency.code;

    return (
      <TouchableOpacity
        key={currency.code}
        style={[styles.currencyItem, { borderBottomColor: borderColor }, selected && { backgroundColor: `${tintColor}12` }]}
        onPress={() => handleSelect(currency.code)}
      >
        <ThemedView style={styles.currencyIdentity}>
          <ThemedText style={styles.currencyFlag}>{currency.flag}</ThemedText>
          <ThemedView style={styles.currencyCopy}>
            <ThemedText style={[styles.currencyCode, { color: textColor }]}>
              {currency.code} {currencySymbols[currency.code]}
            </ThemedText>
            <ThemedText style={[styles.currencyName, { color: subtleText }]} numberOfLines={1}>
              {currency.name}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        {selected && <Icon name="check-circle" size={20} color={tintColor} />}
      </TouchableOpacity>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity
        style={[styles.selector, { borderColor, backgroundColor: cardBg }]}
        onPress={() => setShowPopularModal(true)}
        accessibilityLabel="Change currency"
      >
        <ThemedView style={styles.selectedSummary}>
          <ThemedText style={styles.selectedFlag}>{selectedCurrencyData.flag}</ThemedText>
          <ThemedView style={styles.selectedCopy}>
            <ThemedText style={[styles.selectedCode, { color: textColor }]}>
              {selectedCurrencyData.code} {currencySymbols[selectedCurrencyData.code]}
            </ThemedText>
            <ThemedText style={[styles.selectedName, { color: subtleText }]} numberOfLines={1}>
              {selectedCurrencyData.name}
            </ThemedText>
          </ThemedView>
        </ThemedView>
        <Icon name="expand-more" size={22} color={textColor} />
      </TouchableOpacity>

      <Modal visible={showPopularModal} transparent animationType="fade" onRequestClose={() => setShowPopularModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowPopularModal(false)}>
          <Pressable style={[styles.dropdownModal, { backgroundColor: cardBg, borderColor }]}>
            <ThemedView style={styles.dropdownHeader}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Popular Currencies</ThemedText>
              <TouchableOpacity onPress={() => setShowPopularModal(false)} style={styles.iconButton}>
                <Icon name="close" size={20} color={textColor} />
              </TouchableOpacity>
            </ThemedView>

            {popularCurrencies.map(renderCurrencyRow)}

            <TouchableOpacity
              style={[styles.showAllButton, { borderTopColor: borderColor }]}
              onPress={() => {
                setShowPopularModal(false);
                setShowAllModal(true);
              }}
            >
              <ThemedText style={[styles.showAllText, { color: tintColor }]}>Browse All Currencies</ThemedText>
              <Icon name="chevron-right" size={18} color={tintColor} />
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={showAllModal} animationType="slide" onRequestClose={closeAll}>
        <ThemedView style={styles.fullModal}>
          <ThemedView style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <ThemedView>
              <ThemedText style={[styles.modalTitle, { color: textColor }]}>Select Currency</ThemedText>
              <ThemedText style={[styles.modalSubtitle, { color: subtleText }]}>
                Used for collection values and valuation displays.
              </ThemedText>
            </ThemedView>
            <TouchableOpacity onPress={closeAll} style={styles.iconButton}>
              <Icon name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </ThemedView>

          <ThemedView style={[styles.searchContainer, { backgroundColor: controlBg, borderColor }]}>
            <Icon name="search" size={20} color={placeholderColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search by currency or code"
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={placeholderColor}
              returnKeyType="search"
            />
            {searchText ? (
              <TouchableOpacity onPress={() => setSearchText('')} style={styles.iconButton}>
                <Icon name="close" size={18} color={placeholderColor} />
              </TouchableOpacity>
            ) : null}
          </ThemedView>

          <ThemedView style={[styles.selectedSection, { backgroundColor: cardBg, borderColor }]}>
            <ThemedText style={[styles.selectedLabel, { color: subtleText }]}>Current</ThemedText>
            <ThemedText style={[styles.selectedCurrency, { color: textColor }]}>
              {selectedCurrencyData.flag} {selectedCurrencyData.code} {currencySymbols[selectedCurrencyData.code]} - {selectedCurrencyData.name}
            </ThemedText>
          </ThemedView>

          <ScrollView style={styles.currencyList} keyboardShouldPersistTaps="handled">
            {filteredCurrencies.length > 0 ? (
              filteredCurrencies.map(renderCurrencyRow)
            ) : (
              <ThemedView style={styles.emptyState}>
                <Icon name="search-off" size={36} color={placeholderColor} />
                <ThemedText style={[styles.emptyTitle, { color: textColor }]}>No currency found</ThemedText>
                <ThemedText style={[styles.emptyText, { color: subtleText }]}>
                  Try a different currency name or code.
                </ThemedText>
              </ThemedView>
            )}
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  selector: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 58,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  selectedSummary: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  selectedFlag: {
    fontSize: 24,
  },
  selectedCopy: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  selectedCode: {
    fontSize: 15,
    fontWeight: '800',
  },
  selectedName: {
    fontSize: 12,
    marginTop: 2,
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.35)',
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  dropdownModal: {
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 420,
    overflow: 'hidden',
    width: Dimensions.get('window').width > 768 ? 360 : '100%',
  },
  dropdownHeader: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  iconButton: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 34,
    minWidth: 34,
  },
  currencyItem: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    minHeight: 56,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  currencyIdentity: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    flex: 1,
    flexDirection: 'row',
    gap: 10,
  },
  currencyFlag: {
    fontSize: 22,
    width: 28,
  },
  currencyCopy: {
    backgroundColor: 'transparent',
    flex: 1,
  },
  currencyCode: {
    fontSize: 14,
    fontWeight: '800',
  },
  currencyName: {
    fontSize: 12,
    marginTop: 2,
  },
  showAllButton: {
    alignItems: 'center',
    borderTopWidth: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    padding: 13,
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '800',
  },
  fullModal: {
    flex: 1,
  },
  modalHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 8,
    margin: 16,
    minHeight: 50,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 10,
  },
  selectedSection: {
    borderRadius: 8,
    borderWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
    padding: 14,
  },
  selectedLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  selectedCurrency: {
    fontSize: 15,
    fontWeight: '700',
  },
  currencyList: {
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingHorizontal: 24,
    paddingVertical: 42,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 10,
  },
  emptyText: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    textAlign: 'center',
  },
});
