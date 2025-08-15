import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ProfileOptionProps {
  title: string;
  icon: string;
  onPress: () => void;
}

export function ProfileOption({ title, icon, onPress }: ProfileOptionProps) {
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');
  
  return (
    <TouchableOpacity onPress={onPress}>
      <ThemedView style={[styles.option, { borderBottomColor: borderColor }]}>
        <Icon name={icon} size={24} color={iconColor} />
        <ThemedText style={styles.title}>{title}</ThemedText>
        <Icon name="chevron-right" size={24} color={iconColor} />
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
});