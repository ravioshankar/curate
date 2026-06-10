import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useAppTheme } from '@/hooks/useAppTheme';
import { CurrencySelector } from '@/src/components/common/CurrencySelector';
import { ProfileOption } from '@/src/components/common/ProfileOption';
import { ThemeToggle } from '@/src/components/common/ThemeToggle';
import { CategoryManager } from '@/src/components/common/CategoryManager';
import { BackupManager } from '@/src/components/common/BackupManager';
import { RootState, AppDispatch } from '@/src/store/store';
import { loadSettings, saveSettings, updateProfile, updateSettings, loadProfile, saveProfile } from '@/src/store/userStore';
import { populateRandomItems } from '@/src/utils/devPopulate';
import { imageService } from '@/src/services/ImageService';

import React, { useEffect, useState } from 'react';
import { Alert, Image, ScrollView, StyleSheet, Switch, TextInput, TouchableOpacity, View, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch, useSelector } from 'react-redux';
import { router } from 'expo-router';

export function ProfileScreen() {
  const { profile, settings } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const colorScheme = useAppTheme();
  const iconColor = useThemeColor({}, 'icon');
  const borderColor = useThemeColor({ light: '#eee', dark: '#333' }, 'text');
  const textColor = useThemeColor({ light: '#1C1917', dark: '#F5F5F4' }, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const [isThemeExpanded, setIsThemeExpanded] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(profile.name);
  const [editEmail, setEditEmail] = useState(profile.email || '');
  const [editAvatar, setEditAvatar] = useState(profile.avatar || '');
  const [emailError, setEmailError] = useState('');
  const [showCategoryManager, setShowCategoryManager] = useState(false);
  const [showBackupManager, setShowBackupManager] = useState(false);

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
    setEditEmail(profile.email || '');
    setEditAvatar(profile.avatar || '');
    setIsEditing(true);
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const saveProfileChanges = () => {
    if (editEmail && !validateEmail(editEmail)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    setEmailError('');
    const newProfile = { name: editName, email: editEmail, avatar: editAvatar };
    dispatch(updateProfile(newProfile));
    dispatch(saveProfile(newProfile));
    setIsEditing(false);
  };

  const pickImage = async () => {
    try {
      const imageUri = await imageService.pickImage();
      if (imageUri) {
        setEditAvatar(imageUri);
      }
    } catch {
      Alert.alert('Error', 'Failed to select photo');
    }
  };

  const removeAvatar = () => {
    setEditAvatar('');
  };

  const takePhoto = async () => {
    try {
      const imageUri = await imageService.takePhoto();
      if (imageUri) {
        setEditAvatar(imageUri);
      }
    } catch {
      Alert.alert('Error', 'Failed to capture photo');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colorScheme === 'dark' ? '#1C1917' : '#FEF7F0' }]}>
      <ThemedView style={[styles.header, { borderBottomColor: borderColor }]}>
        <TouchableOpacity onPress={isEditing ? pickImage : startEdit} activeOpacity={0.85}>
          {(isEditing ? editAvatar : profile.avatar) ? (
            <View style={styles.avatarWrap}>
              <Image
                source={{ uri: isEditing ? editAvatar : profile.avatar }}
                style={[
                  styles.avatar,
                  { borderColor: colorScheme === 'dark' ? '#44403C' : '#FFFFFF' },
                ]}
                resizeMode="cover"
              />
              {isEditing && (
                <View style={styles.cameraOverlay}>
                  <Icon name="camera-alt" size={20} color="white" />
                </View>
              )}
            </View>
          ) : (
            <View style={styles.avatarWrap}>
              <Icon name="account-circle" size={96} color={iconColor} />
              {profile.email ? (
                <View style={[styles.emailBadge, { backgroundColor: tintColor }]}>
                  <Icon name="check" size={14} color="#FFFFFF" />
                </View>
              ) : null}
            </View>
          )}
        </TouchableOpacity>
        {isEditing ? (
          <>
            <TextInput
              value={editName}
              onChangeText={setEditName}
              style={[styles.nameInput, { color: textColor, borderBottomColor: textColor }]}
              selectionColor={textColor}
              placeholder="Name"
              placeholderTextColor="#999"
            />
            <TextInput 
              value={editEmail} 
              onChangeText={(text) => {
                setEditEmail(text);
                if (emailError) setEmailError('');
              }} 
              style={[styles.emailInput, { color: textColor, borderBottomColor: emailError ? '#EF4444' : textColor }]}
              selectionColor={textColor} 
              placeholder="Email"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            {emailError ? (
              <ThemedText style={styles.errorText}>{emailError}</ThemedText>
            ) : null}
          </>
        ) : (
          <>
            <ThemedText style={styles.name}>{profile.name}</ThemedText>
            <ThemedText style={styles.email} lightColor="#78716C" darkColor="#D6D3D1">
              {profile.email || 'No email added'}
            </ThemedText>
          </>
        )}
        {isEditing && (
          <View style={styles.avatarOptions}>
            <TouchableOpacity onPress={pickImage} style={[styles.imageButton, { backgroundColor: tintColor }]}>
              <Icon name="photo-library" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Choose Photo</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity onPress={takePhoto} style={[styles.imageButton, { backgroundColor: '#10B981' }]}>
              <Icon name="camera-alt" size={20} color="white" />
              <ThemedText style={styles.buttonText}>Take Photo</ThemedText>
            </TouchableOpacity>
            {editAvatar && (
              <TouchableOpacity onPress={removeAvatar} style={[styles.imageButton, { backgroundColor: '#EF4444' }]}>
                <Icon name="delete" size={20} color="white" />
                <ThemedText style={styles.buttonText}>Remove</ThemedText>
              </TouchableOpacity>
            )}
          </View>
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
          title="Manage Categories"
          icon="category"
          onPress={() => setShowCategoryManager(true)}
        />
        
        <ProfileOption
          title="Backup & Sync"
          icon="cloud-upload"
          onPress={() => setShowBackupManager(true)}
        />
        
        <ProfileOption
          title="Privacy Policy"
          icon="privacy-tip"
          onPress={() => router.push('/privacy-policy')}
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
      
      <Modal visible={showCategoryManager} animationType="slide" presentationStyle="pageSheet">
        <CategoryManager onBack={() => setShowCategoryManager(false)} />
      </Modal>
      
      <Modal visible={showBackupManager} animationType="slide" presentationStyle="pageSheet">
        <BackupManager onBack={() => setShowBackupManager(false)} />
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    width: '100%',
  },
  avatarWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 104,
    height: 104,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 14,
    padding: 6,
  },
  emailBadge: {
    position: 'absolute',
    bottom: 10,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontSize: 26,
    fontWeight: '700',
    marginTop: 20,
    textAlign: 'center',
  },
  email: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
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
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  emailInput: {
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
    width: 220,
    borderBottomWidth: 1,
    paddingBottom: 4,
  },
  emailInputError: {
    borderBottomColor: '#EF4444',
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  avatarOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginTop: 16,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 6,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
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
