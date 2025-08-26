import React, { useState } from 'react';
import { View, TouchableOpacity, StyleSheet, Modal, FlatList, TextInput } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface CategoryDropdownProps {
  label: string;
  value: string;
  onSelect: (category: string) => void;
  categories: string[];
  userCategories: string[];
  cardBg: string;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  onDeleteCategory?: (category: string) => void;
}

import { getCategoryIcon } from '../../utils/categoryIcons';

export function CategoryDropdown({ 
  label, 
  value, 
  onSelect, 
  categories,
  userCategories, 
  cardBg, 
  borderColor, 
  textColor,
  backgroundColor,
  onDeleteCategory 
}: CategoryDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const tintColor = useThemeColor({}, 'tint');
  const selectedBg = useThemeColor({ light: '#f3f4f6', dark: '#374151' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const dangerColor = useThemeColor({ light: '#ef4444', dark: '#f87171' }, 'text');

  const handleSelect = (category: string) => {
    onSelect(category);
    setIsOpen(false);
    setNewCategory('');
  };

  const handleAddNew = () => {
    if (newCategory.trim()) {
      onSelect(newCategory.trim());
      setIsOpen(false);
      setNewCategory('');
    }
  };

  const handleDelete = async (categoryName: string) => {
    if (onDeleteCategory) {
      onDeleteCategory(categoryName);
    }
  };



  return (
    <View style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor, backgroundColor: cardBg }]}
        onPress={() => setIsOpen(true)}
      >
        <View style={styles.dropdownContent}>
          {value && (
            <ThemedText style={styles.categoryIcon}>{getCategoryIcon(value)}</ThemedText>
          )}
          <ThemedText style={[styles.dropdownText, { color: value ? textColor : textColor + '80' }]}>
            {value || 'Select category'}
          </ThemedText>
        </View>
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
            <ThemedView style={[styles.addNewSection, { borderBottomColor: borderColor }]}>
              <TextInput
                style={[styles.textInput, { 
                  borderColor, 
                  backgroundColor: cardBg, 
                  color: textColor,
                  textAlign: 'left'
                }]}
                placeholder="Type new category name..."
                placeholderTextColor={placeholderColor}
                value={newCategory}
                onChangeText={setNewCategory}
                onSubmitEditing={handleAddNew}
                returnKeyType="done"
              />
              <TouchableOpacity
                style={[styles.addButton, { backgroundColor: newCategory.trim() ? tintColor : borderColor }]}
                onPress={handleAddNew}
                disabled={!newCategory.trim()}
              >
                <ThemedText style={[styles.addButtonText, { color: 'white' }]}>Add</ThemedText>
              </TouchableOpacity>
            </ThemedView>
            <FlatList
              data={[...categories].sort((a, b) => a.localeCompare(b))}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                const isSelected = item === value;
                return (
                  <TouchableOpacity
                    style={[
                      styles.option, 
                      { borderBottomColor: borderColor },
                      isSelected && { backgroundColor: selectedBg }
                    ]}
                    onPress={() => handleSelect(item)}
                  >
                    <View style={styles.optionContent}>
                      <ThemedText style={styles.optionIcon}>{getCategoryIcon(item)}</ThemedText>
                      <ThemedText style={[
                        styles.optionText, 
                        { color: textColor },
                        isSelected && { fontWeight: '600', color: tintColor }
                      ]}>
                        {item}
                      </ThemedText>
                    </View>
                    <View style={styles.optionActions}>
                      {userCategories.includes(item) && onDeleteCategory && (
                        <TouchableOpacity
                          style={styles.deleteButton}
                          onPress={() => handleDelete(item)}
                        >
                          <ThemedText style={[styles.deleteText, { color: dangerColor }]}>×</ThemedText>
                        </TouchableOpacity>
                      )}
                      {isSelected && (
                        <ThemedText style={[styles.checkmark, { color: tintColor }]}>✓</ThemedText>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              }}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
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
    minHeight: 56,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  addNewSection: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
  },
  textInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  optionActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deleteButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});