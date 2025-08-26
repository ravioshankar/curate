import React, { useState } from 'react';
import { View, StyleSheet, TextInput, TouchableOpacity, Alert, Image, Platform } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/src/store/store';
import { updateProfile, saveProfile, updateSettings, saveSettings } from '@/src/store/userStore';
import { imageService } from '@/src/services/ImageService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CurateLogo } from '@/src/components/common/CurateLogo';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  const insets = useSafeAreaInsets();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatar, setAvatar] = useState('');
  const [emailError, setEmailError] = useState('');

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const pickImage = async () => {
    try {
      const imageUri = await imageService.pickImage();
      if (imageUri) {
        setAvatar(imageUri);
      }
    } catch (error) {
      console.error('Pick image error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to select photo');
    }
  };

  const takePhoto = async () => {
    try {
      const imageUri = await imageService.takePhoto();
      if (imageUri) {
        setAvatar(imageUri);
      }
    } catch (error) {
      console.error('Take photo error:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to capture photo');
    }
  };

  const showPhotoOptions = () => {
    if (Platform.OS === 'web') {
      // On web, directly open photo library since camera is more complex
      pickImage();
    } else {
      Alert.alert(
        'Add Photo',
        'Choose how you want to add your photo',
        [
          { text: 'Camera', onPress: takePhoto },
          { text: 'Photo Library', onPress: pickImage },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
    }
  };

  const handleComplete = () => {
    if (!name.trim()) {
      Alert.alert('Required', 'Please enter your name');
      return;
    }

    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setEmailError('');
    
    // Save profile
    const profile = { name: name.trim(), email: email.trim(), avatar };
    dispatch(updateProfile(profile));
    dispatch(saveProfile(profile));
    
    // Initialize default settings
    const settings = {
      currency: 'USD',
      theme: 'auto' as const,
      notifications: true,
      isOnboarded: true
    };
    dispatch(updateSettings(settings));
    dispatch(saveSettings(settings));
    
    onComplete();
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <CurateLogo 
          size={80} 
          backgroundColor={`${tintColor}20`}
          orbColor={tintColor}
          elementColor={tintColor}
        />
        <ThemedText style={[styles.title, { color: tintColor }]}>Welcome to Curate</ThemedText>
        <ThemedText style={styles.subtitle}>Let's set up your profile</ThemedText>
      </ThemedView>

      <ThemedView style={styles.form}>
        <TouchableOpacity onPress={() => showPhotoOptions()} style={styles.avatarContainer}>
          {avatar ? (
            <Image source={{ uri: avatar }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatarPlaceholder, { borderColor: tintColor }]}>
              <Icon name="add-a-photo" size={32} color={iconColor} />
            </View>
          )}
          <ThemedText style={styles.avatarText}>Tap to add photo</ThemedText>
        </TouchableOpacity>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Name *</ThemedText>
          <TextInput
            value={name}
            onChangeText={setName}
            style={[styles.input, { borderColor: tintColor, color: textColor }]}
            placeholder="Enter your name"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <ThemedText style={styles.label}>Email (optional)</ThemedText>
          <TextInput
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            style={[styles.input, { borderColor: emailError ? '#EF4444' : tintColor, color: textColor }]}
            placeholder="Enter your email"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />
          {emailError ? (
            <ThemedText style={styles.errorText}>{emailError}</ThemedText>
          ) : null}
        </View>

        <TouchableOpacity onPress={handleComplete} style={[styles.primaryButton, { backgroundColor: tintColor }]}>
          <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },

  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
  },
  form: {
    flex: 1,
    gap: 24,
    justifyContent: 'center',
  },
  avatarContainer: {
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 14,
    opacity: 0.7,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    width: '100%',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});