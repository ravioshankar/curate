import React, { useState } from 'react';
import { TextInput, TouchableOpacity, StyleSheet, View } from 'react-native';
import { ThemedView } from '../../../components/ThemedView';
import { ThemedText } from '../../../components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  filters?: string[];
  onFilterChange?: (filter: string) => void;
  selectedFilter?: string;
}

export function SearchBar({ 
  onSearch, 
  placeholder = "Search items...", 
  filters = [],
  onFilterChange,
  selectedFilter 
}: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');

  const handleSearch = (text: string) => {
    setQuery(text);
    onSearch(text);
  };

  const clearSearch = () => {
    setQuery('');
    onSearch('');
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.searchContainer, { borderColor, backgroundColor }]}>
        <Icon name="search" size={20} color={placeholderColor} />
        <TextInput
          style={[styles.searchInput, { color: textColor }]}
          placeholder={placeholder}
          placeholderTextColor={placeholderColor}
          value={query}
          onChangeText={handleSearch}
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch}>
            <Icon name="clear" size={20} color={placeholderColor} />
          </TouchableOpacity>
        )}
        {filters.length > 0 && (
          <TouchableOpacity 
            onPress={() => setShowFilters(!showFilters)}
            style={[styles.filterButton, { backgroundColor: showFilters ? tintColor : 'transparent' }]}
          >
            <Icon name="filter-list" size={20} color={showFilters ? 'white' : textColor} />
          </TouchableOpacity>
        )}
      </ThemedView>
      
      {showFilters && filters.length > 0 && (
        <ThemedView style={styles.filtersContainer}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              { backgroundColor: !selectedFilter ? tintColor : 'rgba(0,0,0,0.1)' }
            ]}
            onPress={() => onFilterChange?.('')}
          >
            <ThemedText style={[
              styles.filterText,
              { color: !selectedFilter ? 'white' : textColor }
            ]}>
              All
            </ThemedText>
          </TouchableOpacity>
          {filters.map(filter => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                { backgroundColor: selectedFilter === filter ? tintColor : 'rgba(0,0,0,0.1)' }
              ]}
              onPress={() => onFilterChange?.(filter)}
            >
              <ThemedText style={[
                styles.filterText,
                { color: selectedFilter === filter ? 'white' : textColor }
              ]}>
                {filter}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </ThemedView>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 4,
  },
  filterButton: {
    padding: 8,
    borderRadius: 8,
  },
  filtersContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '500',
  },
});