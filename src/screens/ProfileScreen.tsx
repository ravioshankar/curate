import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Alert, View, TouchableOpacity, Switch } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ProfileOption } from '@/src/components/common/ProfileOption';
import { ThemeToggle } from '@/src/components/common/ThemeToggle';
import { CurrencySelector } from '@/src/components/common/CurrencySelector';
import { useThemeColor } from '@/hooks/useThemeColor';
import { RootState } from '@/src/store/store';
import { updateSettings, loadSettings, saveSettings } from '@/src/store/userStore';
import Icon from 'react-native-vector-icons/MaterialIcons';

export function ProfileScreen() {
  const { profile, settings } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);

  useEffect(() => {
    dispatch(loadSettings());
  }, [dispatch]);

  const handleCurrencyChange = (currency: string) => {
    const newSettings = { ...settings, currency };
    dispatch(updateSettings({ currency }));
    dispatch(saveSettings(newSettings));
  };

  const handleThemeChange = (theme: 'light' | 'dark' | 'auto') => {
    const newSettings = { ...settings, theme };
    dispatch(updateSettings({ theme }));
    dispatch(saveSettings(newSettings));
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <Icon name="account-circle" size={80} color={iconColor} />
        <ThemedText style={styles.name}>{profile.name}</ThemedText>
        <ThemedText style={styles.email} lightColor="#666" darkColor="#999">{profile.email}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.section}>
        <ProfileOption
          title="Settings"
          icon="settings"
          onPress={() => Alert.alert('Settings', 'Settings screen coming soon')}
        />
        
        <ThemedView style={[styles.currencySection, { borderBottomColor: borderColor }]}>
          <ThemedView style={styles.currencyHeader}>
            <Icon name="attach-money" size={24} color={iconColor} />
            <ThemedText style={styles.currencyTitle}>Currency</ThemedText>
          </ThemedView>
          <CurrencySelector 
            selectedCurrency={settings.currency}
            onCurrencyChange={handleCurrencyChange}
          />
        </ThemedView>
        <ThemedView style={[styles.themeSection, { borderBottomColor: borderColor }]}>
          <TouchableOpacity onPress={() => setIsThemeExpanded(!isThemeExpanded)}>
            <ThemedView style={styles.themeHeader}>
              <Icon name="palette" size={24} color={iconColor} />
              <ThemedText style={styles.themeTitle}>Theme</ThemedText>
              <Icon 
                name={isThemeExpanded ? "expand-less" : "expand-more"} 
                size={24} 
                color={iconColor} 
              />
            </ThemedView>
          </TouchableOpacity>
          {isThemeExpanded && (
            <ThemeToggle currentTheme={settings.theme} onThemeChange={handleThemeChange} />
          )}
        </ThemedView>
        <ThemedView style={[styles.notificationSection, { borderBottomColor: borderColor }]}>
          <ThemedView style={styles.notificationRow}>
            <Icon name="notifications" size={24} color={iconColor} />
            <ThemedText style={styles.notificationTitle}>Notifications</ThemedText>
            <Switch
              value={settings.notifications}
              onValueChange={(value) => {
                const newSettings = { ...settings, notifications: value };
                dispatch(updateSettings({ notifications: value }));
                dispatch(saveSettings(newSettings));
              }}
              trackColor={{ false: '#767577', true: tintColor }}
              thumbColor={settings.notifications ? '#fff' : '#f4f3f4'}
            />
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 32,
    borderBottomWidth: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 16,
  },
  email: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginTop: 16,
  },
  themeSection: {
    padding: 16,
    marginTop: 16,
    borderBottomWidth: 1,
  },
  themeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  themeTitle: {
    fontSize: 16,
    marginLeft: 16,
  },
  notificationSection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  notificationTitle: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
  currencySection: {
    padding: 16,
    borderBottomWidth: 1,
  },
  currencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  currencyTitle: {
    fontSize: 16,
    marginLeft: 16,
  },
});