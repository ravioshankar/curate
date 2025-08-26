import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface LocationDropdownProps {
  label: string;
  value: string;
  onSelect: (location: string) => void;
  cardBg: string;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
}

const DEFAULT_LOCATIONS = [
  'Kitchen',
  'Living Room',
  'Bedroom',
  'Bathroom',
  'Office',
  'Garage',
  'Basement',
  'Attic',
  'Dining Room',
  'Laundry Room',
  'Closet',
  'Storage Room',
  'Guest Room',
  'Home Office',
  'Workshop',
  'Pantry',
  'Hallway',
  'Balcony',
  'Patio',
  'Garden Shed',
  'Car',
  'Backyard',
  'Front Yard',
  'Pool Area',
  'Deck',
  'Other'
];

export function LocationDropdown({ 
  label, 
  value, 
  onSelect, 
  cardBg, 
  borderColor, 
  textColor, 
  backgroundColor 
}: LocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (location: string) => {
    onSelect(location);
    setIsOpen(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor, backgroundColor: cardBg }]}
        onPress={() => setIsOpen(true)}
      >
        <ThemedText style={[styles.dropdownText, { color: textColor }]}>
          {value || 'Select location...'}
        </ThemedText>
        <Icon name="arrow-drop-down" size={24} color={textColor} />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Select Location</ThemedText>
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
              <Icon name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.locationList} showsVerticalScrollIndicator={false}>
            {DEFAULT_LOCATIONS.map((location) => (
              <TouchableOpacity
                key={location}
                style={[styles.locationItem, { borderBottomColor: borderColor }]}
                onPress={() => handleSelect(location)}
              >
                <ThemedText style={[styles.locationText, { color: textColor }]}>
                  {location}
                </ThemedText>
                {value === location && (
                  <Icon name="check" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  closeButton: {
    padding: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  locationList: {
    flex: 1,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  locationText: {
    fontSize: 16,
  },
});