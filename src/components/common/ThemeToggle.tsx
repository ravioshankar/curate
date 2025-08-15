import React from 'react';
import { TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';

interface ThemeToggleProps {
  currentTheme: 'light' | 'dark' | 'auto';
  onThemeChange: (theme: 'light' | 'dark' | 'auto') => void;
}

export function ThemeToggle({ currentTheme, onThemeChange }: ThemeToggleProps) {
  const tintColor = useThemeColor({}, 'tint');
  
  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.row}>
        <ThemedText style={styles.label}>Light</ThemedText>
        <Switch
          value={currentTheme === 'light'}
          onValueChange={() => onThemeChange('light')}
          trackColor={{ false: '#767577', true: tintColor }}
          thumbColor={currentTheme === 'light' ? '#fff' : '#f4f3f4'}
        />
      </ThemedView>
      
      <ThemedView style={styles.row}>
        <ThemedText style={styles.label}>Dark</ThemedText>
        <Switch
          value={currentTheme === 'dark'}
          onValueChange={() => onThemeChange('dark')}
          trackColor={{ false: '#767577', true: tintColor }}
          thumbColor={currentTheme === 'dark' ? '#fff' : '#f4f3f4'}
        />
      </ThemedView>
      
      <ThemedView style={styles.row}>
        <ThemedText style={styles.label}>Auto</ThemedText>
        <Switch
          value={currentTheme === 'auto'}
          onValueChange={() => onThemeChange('auto')}
          trackColor={{ false: '#767577', true: tintColor }}
          thumbColor={currentTheme === 'auto' ? '#fff' : '#f4f3f4'}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'transparent',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    paddingLeft: 16,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
  },
});