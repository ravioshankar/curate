import { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, TextInput, Image, Alert, Animated } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRef } from 'react';

import { mockInventory } from '../../data/mockInventory';
import { InventoryItem } from '../../types/inventory';

export default function HomeScreen() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const savedInventory = await AsyncStorage.getItem('curateInventory');
      if (savedInventory) {
        setInventory(JSON.parse(savedInventory));
      } else {
        setInventory(mockInventory);
        await AsyncStorage.setItem('curateInventory', JSON.stringify(mockInventory));
      }
    } catch (error) {
      setInventory(mockInventory);
    }
  };

  const handleAddItem = async (item: InventoryItem) => {
    const newInventory = [...inventory, { ...item, id: Math.random().toString(36).substr(2, 9) }];
    setInventory(newInventory);
    await AsyncStorage.setItem('curateInventory', JSON.stringify(newInventory));
    setCurrentPage('inventory');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage inventory={inventory} setCurrentPage={setCurrentPage} />;
      case 'inventory':
        return <InventoryPage inventory={inventory} searchText={searchText} setSearchText={setSearchText} />;
      case 'add-item':
        return <AddItemPage onAddItem={handleAddItem} onBack={() => setCurrentPage('inventory')} />;
      default:
        return <HomePage inventory={inventory} setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <View style={styles.container}>
      <Header currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <View style={styles.content}>
        {renderPage()}
      </View>
    </View>
  );
}

const Header = ({ currentPage, setCurrentPage }) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const rotate = () => {
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      }).start(() => {
        rotateAnim.setValue(0);
        rotate();
      });
    };
    rotate();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.header}>
      <View style={styles.brandSection}>
        <View style={styles.titleRow}>
          <Animated.Text style={[styles.hourglassIcon, { transform: [{ rotate: spin }] }]}>⏳</Animated.Text>
          <Text style={styles.headerTitle}>Curate</Text>
        </View>
        <Text style={styles.subtitle}>The smarter way to own.</Text>
      </View>
      <View style={styles.navigation}>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 'home' && styles.activeNavButton]}
          onPress={() => setCurrentPage('home')}
        >
          <Text style={styles.navIcon}>🏠</Text>
          <Text style={[styles.navText, currentPage === 'home' && styles.activeNavText]}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 'inventory' && styles.activeNavButton]}
          onPress={() => setCurrentPage('inventory')}
        >
          <Text style={styles.navIcon}>📋</Text>
          <Text style={[styles.navText, currentPage === 'inventory' && styles.activeNavText]}>Inventory</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.navButton, currentPage === 'add-item' && styles.activeNavButton]}
          onPress={() => setCurrentPage('add-item')}
        >
          <Text style={styles.navIcon}>➕</Text>
          <Text style={[styles.navText, currentPage === 'add-item' && styles.activeNavText]}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const HomePage = ({ inventory, setCurrentPage }) => {
  const longUnusedItems = inventory.filter(item => {
    const lastUsedDate = new Date(item.lastUsed);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastUsedDate < oneYearAgo;
  });

  return (
    <ScrollView style={styles.pageContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.pageTitle}>Dashboard</Text>
      
      <View style={styles.statsContainer}>
        <TouchableOpacity onPress={() => setCurrentPage('inventory')}>
          <StatCard title="Total Items" value={inventory.length} color="#6366F1" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentPage('inventory')}>
          <StatCard title="Categories" value={new Set(inventory.map(i => i.category)).size} color="#06B6D4" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setCurrentPage('inventory')}>
          <StatCard title="Unused > 1yr" value={longUnusedItems.length} color="#EF4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.reviewSection}>
        <Text style={styles.sectionTitle}>Items to Review</Text>
        {longUnusedItems.length > 0 ? (
          longUnusedItems.map(item => (
            <View key={item.id} style={styles.reviewItem}>
              <View>
                <Text style={styles.reviewItemName}>{item.name}</Text>
                <Text style={styles.reviewItemDate}>Last used: {item.lastUsed}</Text>
              </View>
              <Text style={styles.moreIcon}>⋮</Text>
            </View>
          ))
        ) : (
          <Text style={styles.noItemsText}>All items have been used recently. Great job!</Text>
        )}
      </View>
    </ScrollView>
  );
};

const StatCard = ({ title, value, color }) => (
  <View style={[styles.statCard, { backgroundColor: color }]}>
    <Text style={styles.statNumber}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

const InventoryPage = ({ inventory, searchText, setSearchText }) => {
  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchText.toLowerCase()) ||
    item.category.toLowerCase().includes(searchText.toLowerCase()) ||
    item.location.toLowerCase().includes(searchText.toLowerCase())
  );

  return (
    <View style={styles.pageContainer}>
      <Text style={styles.pageTitle}>My Inventory</Text>
      
      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search items..."
          value={searchText}
          onChangeText={setSearchText}
          placeholderTextColor="#999"
        />
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.inventoryGrid}>
          {filteredInventory.map(item => (
            <InventoryCard key={item.id} item={item} />
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const InventoryCard = ({ item }) => (
  <View style={styles.inventoryCard}>
    <Image
      source={{ uri: item.imageUrl || 'https://placehold.co/400x300/94A3B8/ffffff?text=No+Image' }}
      style={styles.cardImage}
    />
    <View style={styles.cardContent}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardCategory}>{item.category}</Text>
      <Text style={styles.cardLocation}>📍 {item.location}</Text>
      
      {(item.pricePaid || item.priceExpected) && (
        <View style={styles.priceSection}>
          {item.pricePaid && (
            <Text style={styles.pricePaid}>💰 Paid: ${item.pricePaid.toFixed(2)}</Text>
          )}
          {item.priceExpected && (
            <Text style={styles.priceExpected}>💸 Expected: ${item.priceExpected.toFixed(2)}</Text>
          )}
        </View>
      )}
    </View>
  </View>
);

const AddItemPage = ({ onAddItem, onBack }) => {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    description: '',
    lastUsed: '',
    imageUrl: '',
    pricePaid: '',
    priceExpected: ''
  });

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Item name is required');
      return;
    }

    const newItem: InventoryItem = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      pricePaid: parseFloat(formData.pricePaid) || undefined,
      priceExpected: parseFloat(formData.priceExpected) || undefined,
    };

    onAddItem(newItem);
    onBack();
  };

  return (
    <ScrollView style={styles.pageContainer} showsVerticalScrollIndicator={false}>
      <View style={styles.addItemHeader}>
        <Text style={styles.pageTitle}>Add New Item</Text>
        <TouchableOpacity onPress={onBack}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <InputField label="Item Name *" value={formData.name} onChangeText={(value) => handleChange('name', value)} />
        <InputField label="Category" value={formData.category} onChangeText={(value) => handleChange('category', value)} />
        <InputField label="Location" value={formData.location} onChangeText={(value) => handleChange('location', value)} />
        <InputField label="Last Used Date" value={formData.lastUsed} onChangeText={(value) => handleChange('lastUsed', value)} placeholder="YYYY-MM-DD" />
        <InputField label="Image URL" value={formData.imageUrl} onChangeText={(value) => handleChange('imageUrl', value)} />
        <InputField label="Description" value={formData.description} onChangeText={(value) => handleChange('description', value)} multiline />
        <InputField label="Price Paid ($)" value={formData.pricePaid} onChangeText={(value) => handleChange('pricePaid', value)} keyboardType="numeric" />
        <InputField label="Expected Price ($)" value={formData.priceExpected} onChangeText={(value) => handleChange('priceExpected', value)} keyboardType="numeric" />

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Add Item</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const InputField = ({ label, value, onChangeText, placeholder, keyboardType = 'default', multiline = false }) => (
  <View style={styles.inputContainer}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.textInput, multiline && styles.textArea]}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      keyboardType={keyboardType}
      placeholderTextColor="#999"
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
    />
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  header: {
    backgroundColor: '#f9fafb',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  brandSection: {
    marginBottom: 16,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  hourglassIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    gap: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: '#e5e7eb',
  },
  activeNavButton: {
    backgroundColor: '#6366f1',
  },
  navIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  navText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  activeNavText: {
    color: 'white',
  },
  pageContainer: {
    flex: 1,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 24,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
  },
  reviewSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  reviewItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 8,
  },
  reviewItemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  reviewItemDate: {
    fontSize: 14,
    color: '#6b7280',
  },
  moreIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  noItemsText: {
    color: '#6b7280',
    fontStyle: 'italic',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 8,
    color: '#6b7280',
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
  },
  inventoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  inventoryCard: {
    width: '48%',
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
  },
  cardImage: {
    width: '100%',
    height: 120,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  cardCategory: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 8,
  },
  cardLocation: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  priceSection: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 8,
  },
  pricePaid: {
    fontSize: 12,
    color: '#059669',
    marginBottom: 2,
  },
  priceExpected: {
    fontSize: 12,
    color: '#d97706',
  },
  addItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  closeButton: {
    fontSize: 24,
    color: '#6b7280',
  },
  form: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    color: '#111827',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: '#6366f1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});