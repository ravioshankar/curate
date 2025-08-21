import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Modal, FlatList } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { databaseService } from '../../services/DatabaseService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { getCategoryIcon, setCategoryIcon, GENERIC_ICONS } from '../../utils/categoryIcons';

interface CategoryManagerProps {
  onBack: () => void;
}

export function CategoryManager({ onBack }: CategoryManagerProps) {
  const [categories, setCategories] = useState<string[]>([]);
  const [userCategories, setUserCategories] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📦');
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const [cats, userCats] = await Promise.all([
        databaseService.getCategories(),
        databaseService.getUserCategories()
      ]);
      setCategories(cats);
      setUserCategories(userCats);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    
    if (categories.includes(newCategory.trim())) {
      Alert.alert('Error', 'Category already exists');
      return;
    }

    try {
      setCategoryIcon(newCategory.trim(), selectedIcon);
      await databaseService.addCategory(newCategory.trim());
      await loadCategories();
      setNewCategory('');
      setSelectedIcon('📦');
      Alert.alert('Success', 'Category added successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  const handleDeleteCategory = (categoryName: string) => {
    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${categoryName}"? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteCategory(categoryName);
              await loadCategories();
              Alert.alert('Success', 'Category deleted successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete category');
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText>Loading categories...</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={textColor} />
        </TouchableOpacity>
        <ThemedText type="title">Manage Categories</ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>

      <ThemedView style={[styles.addSection, { backgroundColor: cardBg, borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>Add New Category</ThemedText>
        <ThemedView style={styles.addForm}>
          <TouchableOpacity
            style={[styles.iconButton, { borderColor, backgroundColor: cardBg }]}
            onPress={() => setShowIconPicker(true)}
          >
            <ThemedText style={styles.selectedIcon}>{selectedIcon}</ThemedText>
          </TouchableOpacity>
          <TextInput
            style={[styles.input, { borderColor, backgroundColor: cardBg, color: textColor }]}
            placeholder="Enter category name"
            value={newCategory}
            onChangeText={setNewCategory}
            maxLength={30}
          />
          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: tintColor }]}
            onPress={handleAddCategory}
          >
            <Icon name="add" size={20} color="white" />
          </TouchableOpacity>
        </ThemedView>
      </ThemedView>

      <ThemedView style={[styles.listSection, { backgroundColor: cardBg, borderColor }]}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Categories ({categories.length})
        </ThemedText>
        <ScrollView style={styles.categoriesList}>
          {categories.map((category, index) => (
            <ThemedView key={category} style={[styles.categoryItem, { borderBottomColor: borderColor }]}>
              <ThemedView style={styles.categoryInfo}>
                <ThemedView style={styles.categoryHeader}>
                  <ThemedText style={styles.categoryIcon}>{getCategoryIcon(category)}</ThemedText>
                  <ThemedText style={styles.categoryName}>{category}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.categoryIndex}>#{index + 1}</ThemedText>
              </ThemedView>
              {userCategories.includes(category) && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteCategory(category)}
                >
                  <Icon name="delete" size={20} color="#EF4444" />
                </TouchableOpacity>
              )}
            </ThemedView>
          ))}
        </ScrollView>
      </ThemedView>

      <Modal
        visible={showIconPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowIconPicker(false)}
      >
        <TouchableOpacity
          style={styles.iconPickerOverlay}
          activeOpacity={1}
          onPress={() => setShowIconPicker(false)}
        >
          <ThemedView style={[styles.iconPickerModal, { backgroundColor: cardBg }]}>
            <ThemedView style={[styles.iconPickerHeader, { borderBottomColor: borderColor }]}>
              <ThemedText style={styles.iconPickerTitle}>Select Icon</ThemedText>
            </ThemedView>
            <FlatList
              data={GENERIC_ICONS}
              numColumns={6}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.iconOption,
                    item === selectedIcon && { backgroundColor: tintColor + '20' }
                  ]}
                  onPress={() => {
                    setSelectedIcon(item);
                    setShowIconPicker(false);
                  }}
                >
                  <ThemedText style={styles.iconOptionText}>{item}</ThemedText>
                </TouchableOpacity>
              )}
            />
          </ThemedView>
        </TouchableOpacity>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    paddingTop: 40,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  addSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  addForm: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listSection: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoriesList: {
    flex: 1,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  categoryIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryIndex: {
    fontSize: 12,
    opacity: 0.6,
  },
  deleteButton: {
    padding: 8,
  },
  iconPickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPickerModal: {
    width: '85%',
    maxHeight: '60%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  iconPickerHeader: {
    padding: 16,
    borderBottomWidth: 1,
    alignItems: 'center',
  },
  iconPickerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  iconOption: {
    flex: 1,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    borderRadius: 8,
  },
  iconOptionText: {
    fontSize: 24,
  },
});