import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { IQRateLogo } from '@/src/components/common/IQRateLogo';
import { imageService } from '@/src/services/ImageService';
import { AppDispatch } from '@/src/store/store';
import { saveProfile, saveSettings, updateProfile, updateSettings } from '@/src/store/userStore';
import React, { useState } from 'react';
import { Alert, Image, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useDispatch } from 'react-redux';

interface OnboardingScreenProps {
  onComplete: () => void;
}

export function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const dispatch = useDispatch<AppDispatch>();
  const tintColor = useThemeColor({}, 'tint');
  const iconColor = useThemeColor({}, 'icon');
  const textColor = useThemeColor({}, 'text');
  
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
        <IQRateLogo 
          size={80} 
          backgroundColor={`${tintColor}20`}
          orbColor={tintColor}
          elementColor={tintColor}
        />
        <ThemedText style={[styles.title, { color: tintColor }]}>Welcome to iQRate</ThemedText>
        <ThemedText style={styles.subtitle}>Let us set up your profile</ThemedText>
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
            selectionColor={tintColor}
            autoCapitalize="words"
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
            selectionColor={tintColor}
            autoCorrect={false}
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
