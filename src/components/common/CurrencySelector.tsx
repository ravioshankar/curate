import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, ActionSheetIOS, Platform, Modal, Dimensions, ScrollView, TextInput } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { currencies, currencySymbols, Currency } from '../../utils/currencyUtils';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onCurrencyChange: (currency: string) => void;
}

export function CurrencySelector({ selectedCurrency, onCurrencyChange }: CurrencySelectorProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showAllModal, setShowAllModal] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');

  const selectedCurrencyData = currencies.find(c => c.code === selectedCurrency) || currencies[0];
  const popularCurrencies = [...currencies].slice(0, 12).sort((a, b) => a.name.localeCompare(b.name));
  
  const filteredCurrencies = currencies.filter(currency =>
    currency.name.toLowerCase().includes(searchText.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchText.toLowerCase())
  ).sort((a, b) => a.name.localeCompare(b.name));

  const handleSelect = (currencyCode: string) => {
    onCurrencyChange(currencyCode);
    setShowDropdown(false);
    setShowAllModal(false);
    setSearchText('');
  };

  return (
    <ThemedView style={styles.container}>
      <TouchableOpacity 
        style={[styles.selector, { borderColor, backgroundColor: cardBg }]}
        onPress={() => setShowDropdown(!showDropdown)}
      >
        <ThemedText style={styles.currencyText}>
          {selectedCurrencyData.flag} {selectedCurrencyData.code} ({currencySymbols[selectedCurrencyData.code]})
        </ThemedText>
        <Icon name={showDropdown ? "expand-less" : "expand-more"} size={20} color={textColor} />
      </TouchableOpacity>

      {showDropdown && (
        <Modal visible={showDropdown} transparent>
          <TouchableOpacity 
            style={styles.overlay} 
            onPress={() => setShowDropdown(false)}
          >
            <ThemedView style={[styles.dropdownModal, { backgroundColor: cardBg, borderColor }]}>
              <ThemedText style={[styles.sectionTitle, { color: textColor }]}>Popular</ThemedText>
              {popularCurrencies.map((currency) => (
                <TouchableOpacity
                  key={currency.code}
                  style={styles.dropdownItem}
                  onPress={() => handleSelect(currency.code)}
                >
                  <ThemedText style={styles.itemText}>
                    {currency.flag} {currency.code} ({currencySymbols[currency.code]})
                  </ThemedText>
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[styles.showAllButton, { borderTopColor: borderColor }]}
                onPress={() => {
                  setShowDropdown(false);
                  setShowAllModal(true);
                }}
              >
                <ThemedText style={[styles.showAllText, { color: textColor }]}>Show All Currencies</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </TouchableOpacity>
        </Modal>
      )}
      
      <Modal visible={showAllModal} animationType="slide">
        <ThemedView style={styles.fullModal}>
          <ThemedView style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
            <ThemedText style={styles.modalTitle}>Select Currency</ThemedText>
            <TouchableOpacity onPress={() => setShowAllModal(false)}>
              <Icon name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </ThemedView>
          
          <ThemedView style={[styles.searchContainer, { backgroundColor: cardBg, borderColor }]}>
            <Icon name="search" size={20} color={placeholderColor} />
            <TextInput
              style={[styles.searchInput, { color: textColor }]}
              placeholder="Search currencies..."
              value={searchText}
              onChangeText={setSearchText}
              placeholderTextColor={placeholderColor}
            />
          </ThemedView>
          
          <ScrollView style={styles.currencyList}>
            <ThemedView style={[styles.selectedSection, { backgroundColor: cardBg, borderBottomColor: borderColor }]}>
              <ThemedText style={styles.selectedLabel}>Currently Selected:</ThemedText>
              <ThemedText style={styles.selectedCurrency}>
                {selectedCurrencyData.flag} {selectedCurrencyData.code} ({currencySymbols[selectedCurrencyData.code]}) - {selectedCurrencyData.name}
              </ThemedText>
            </ThemedView>
            
            {filteredCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[styles.currencyItem, selectedCurrency === currency.code && { backgroundColor: cardBg }]}
                onPress={() => handleSelect(currency.code)}
              >
                <ThemedText style={styles.currencyItemText}>
                  {currency.flag} {currency.code} ({currencySymbols[currency.code]}) - {currency.name}
                </ThemedText>
                {selectedCurrency === currency.code && (
                  <Icon name="check" size={20} color={textColor} />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </ThemedView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    backgroundColor: 'transparent',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  flag: {
    fontSize: 20,
  },
  symbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  currencyText: {
    flex: 1,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  dropdownModal: {
    width: Dimensions.get('window').width > 768 ? 300 : '80%',
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 8,
  },
  itemFlag: {
    fontSize: 18,
  },
  itemSymbol: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 4,
  },
  itemText: {
    fontSize: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    padding: 12,
    paddingBottom: 8,
    opacity: 0.7,
  },
  showAllButton: {
    padding: 12,
    borderTopWidth: 1,
    alignItems: 'center',
  },
  showAllText: {
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.8,
  },
  fullModal: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  currencyList: {
    flex: 1,
  },
  currencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
  },
  currencyItemText: {
    fontSize: 16,
    flex: 1,
  },
  selectedSection: {
    padding: 16,
    borderBottomWidth: 2,
    marginBottom: 8,
  },
  selectedLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    opacity: 0.7,
    marginBottom: 4,
  },
  selectedCurrency: {
    fontSize: 16,
    fontWeight: '600',
  },
});