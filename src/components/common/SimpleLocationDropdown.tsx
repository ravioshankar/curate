import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, Modal, SafeAreaView } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface SimpleLocationDropdownProps {
  selectedLocation: string;
  onSelectLocation: (location: string) => void;
}

const DEFAULT_LOCATIONS = [
  'Kitchen', 'Living Room', 'Bedroom', 'Bathroom', 'Office', 'Garage',
  'Basement', 'Attic', 'Dining Room', 'Laundry Room', 'Closet', 'Storage Room',
  'Guest Room', 'Home Office', 'Workshop', 'Pantry', 'Hallway', 'Balcony',
  'Patio', 'Garden Shed', 'Car', 'Backyard', 'Front Yard', 'Pool Area',
  'Deck', 'Other'
];

export function SimpleLocationDropdown({ selectedLocation, onSelectLocation }: SimpleLocationDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');

  const handleSelect = (location: string) => {
    onSelectLocation(location);
    setIsOpen(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.dropdown, { borderColor, backgroundColor: cardBg }]}
        onPress={() => setIsOpen(true)}
      >
        <ThemedText style={[styles.dropdownText, { color: textColor }]}>
          {selectedLocation || 'Select location...'}
        </ThemedText>
        <Icon name="arrow-drop-down" size={24} color={textColor} />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={[styles.modalContainer, { backgroundColor }]}>
          <ThemedView style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>Select Location</ThemedText>
            <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.closeButton}>
              <Icon name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </ThemedView>
          
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
                {selectedLocation === location && (
                  <Icon name="check" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: 'transparent',
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