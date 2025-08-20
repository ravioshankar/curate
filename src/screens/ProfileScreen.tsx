import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { CurrencySelector } from '@/src/components/common/CurrencySelector';
import { ProfileOption } from '@/src/components/common/ProfileOption';
import { ThemeToggle } from '@/src/components/common/ThemeToggle';
import { RootState, AppDispatch } from '@/src/store/store';
import { loadSettings, saveSettings, updateProfile, updateSettings, loadProfile, saveProfile } from '@/src/store/userStore';
import { populateRandomItems } from '@/src/utils/devPopulate';
import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';

export function ProfileScreen() {
  const { profile, settings } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editAvatar, setEditAvatar] = useState(profile.avatar || '');

  useEffect(() => {
    dispatch(loadSettings());
    dispatch(loadProfile());
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

  const startEdit = () => {
    setEditName(profile.name);
    setEditAvatar(profile.avatar || '');
    setIsEditing(true);
  };

  const saveProfileChanges = () => {
    const newProfile = { name: editName, avatar: editAvatar };
    dispatch(updateProfile(newProfile));
    dispatch(saveProfile(newProfile));
    setIsEditing(false);
  };

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={startEdit}>
          {profile.avatar ? (
            <Image source={{ uri: profile.avatar }} style={{ width: 80, height: 80, borderRadius: 40 }} />
          ) : (
            <Icon name="account-circle" size={80} color={iconColor} />
          )}
        </TouchableOpacity>
        {isEditing ? (
          <TextInput value={editName} onChangeText={setEditName} style={styles.nameInput} />
        ) : (
          <ThemedText style={styles.name}>{profile.name}</ThemedText>
        )}
        <ThemedText style={styles.email} lightColor="#666" darkColor="#999">{profile.email}</ThemedText>
        {isEditing && (
          <TextInput
            value={editAvatar}
            onChangeText={setEditAvatar}
            placeholder="Avatar image URL"
            style={styles.avatarInput}
          />
        )}
        {isEditing && (
          <View style={{ flexDirection: 'row', marginTop: 8 }}>
            <TouchableOpacity onPress={saveProfileChanges} style={[styles.saveButton, { backgroundColor: tintColor }]}> 
              <ThemedText style={{ color: '#fff' }}>Save</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={[styles.cancelButton, { marginLeft: 8 }]}> 
              <ThemedText>Cancel</ThemedText>
            </TouchableOpacity>
          </View>
        )}
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
      {__DEV__ && (
        <ThemedView style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={async () => {
              try {
                await populateRandomItems(50);
                Alert.alert('Dev', 'Inserted 50 random items into local DB');
              } catch (err) {
                Alert.alert('Dev', 'Failed to populate items, check console');
                console.error(err);
              }
            }}
            style={{ backgroundColor: tintColor, padding: 12, borderRadius: 8, alignItems: 'center' }}
          >
            <ThemedText style={{ color: '#fff', fontWeight: '600' }}>Insert 50 Random Items (Dev)</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}
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
  nameInput: {
    fontSize: 24,
    fontWeight: '600',
    marginTop: 8,
    textAlign: 'center',
    width: 220,
  },
  avatarInput: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 6,
  },
  saveButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
});