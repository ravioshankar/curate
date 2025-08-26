import React, { useState } from 'react';
import { TouchableOpacity, StyleSheet, Modal, FlatList } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getCategoryIcon } from '../../utils/categoryIcons';

interface SimpleCategoryDropdownProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

const DEFAULT_CATEGORIES = [
  'Electronics', 'Clothing', 'Books', 'Furniture', 'Jewelry', 'Art', 'Collectibles',
  'Sports', 'Tools', 'Kitchen', 'Automotive', 'Music', 'Games', 'Other'
];

export function SimpleCategoryDropdown({ selectedCategory, onSelectCategory }: SimpleCategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const tintColor = useThemeColor({}, 'tint');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');

  const handleSelect = (category: string) => {
    onSelectCategory(category);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor, backgroundColor: cardBg }]}
        onPress={() => setIsOpen(true)}
      >
        <ThemedView style={styles.dropdownContent}>
          {selectedCategory && (
            <ThemedText style={styles.categoryIcon}>{getCategoryIcon(selectedCategory)}</ThemedText>
          )}
          <ThemedText style={[styles.dropdownText, { color: selectedCategory ? textColor : textColor + '80' }]}>
            {selectedCategory || 'Select category'}
          </ThemedText>
        </ThemedView>
        <ThemedText style={[styles.arrow, { color: textColor }]}>▼</ThemedText>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setIsOpen(false)}
        >
          <ThemedView style={[styles.modal, { backgroundColor }]}>
            <ThemedView style={[styles.modalHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={styles.modalTitle}>Select Category</ThemedText>
            </ThemedView>
            <FlatList
              data={DEFAULT_CATEGORIES}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === selectedCategory;
                return (
                  <TouchableOpacity
                    style={[styles.option, { borderBottomColor: borderColor }]}
                    onPress={() => handleSelect(item)}
                  >
                    <ThemedView style={styles.optionContent}>
                      <ThemedText style={styles.optionIcon}>{getCategoryIcon(item)}</ThemedText>
                      <ThemedText style={[
                        styles.optionText, 
                        { color: textColor },
                        isSelected && { fontWeight: '600', color: tintColor }
                      ]}>
                        {item}
                      </ThemedText>
                    </ThemedView>
                    {isSelected && (
                      <ThemedText style={[styles.checkmark, { color: tintColor }]}>✓</ThemedText>
                    )}
                  </TouchableOpacity>
                );
              }}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    minHeight: 48,
  },
  dropdownContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  arrow: {
    fontSize: 12,
    marginLeft: 8,
    opacity: 0.6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    maxHeight: '70%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    backgroundColor: 'transparent',
  },
  optionIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  checkmark: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});