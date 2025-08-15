import React, { useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Animated, Easing } from 'react-native';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { useThemeColor } from '@/hooks/useThemeColor';

export function ThemedRootLayout() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const headerBg = useThemeColor({ light: '#f9fafb', dark: '#1a1a1a' }, 'background');
  const borderColor = useThemeColor({ light: '#e5e7eb', dark: '#333' }, 'text');

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.8,
          duration: 4000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: false,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1.2),
          useNativeDriver: false,
        }),
        Animated.delay(500),
      ]).start(() => {
        rotateAnim.setValue(0);
        animate();
      });
    };
    animate();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: ['0deg', '160deg', '180deg'],
  });

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={[styles.header, { backgroundColor: headerBg, borderBottomColor: borderColor }]}>
        <ThemedView style={styles.titleRow}>
          <Animated.View style={{ transform: [{ rotate: spin }] }}>
            <ThemedText style={styles.logo}>⏳</ThemedText>
          </Animated.View>
          <ThemedText style={styles.appName}>Curate</ThemedText>
        </ThemedView>
        <ThemedText style={styles.tagline} lightColor="#6b7280" darkColor="#9ca3af">
          The smarter way to own.
        </ThemedText>
      </ThemedView>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    backgroundColor: 'transparent',
  },
  logo: {
    fontSize: 24,
    marginRight: 8,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  tagline: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});