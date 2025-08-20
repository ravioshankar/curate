import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';


import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';

function AppHeader() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];

  useEffect(() => {
    const animate = () => {
      Animated.sequence([
        Animated.timing(rotateAnim, {
          toValue: 0.8,
          duration: 4000,
          easing: Easing.bezier(0.25, 0.46, 0.45, 0.94),
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 600,
          easing: Easing.elastic(1.2),
          useNativeDriver: true,
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
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ transform: [{ rotate: spin }] }}>
        <ThemedText style={{ fontSize: 20, marginRight: 8 }}>⏳</ThemedText>
      </Animated.View>
      <ThemedText style={{ fontSize: 20, fontWeight: 'bold', color: colors.text }}>Curate</ThemedText>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tint,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        headerTitle: () => <AppHeader />,
        headerStyle: {
          backgroundColor: colors.background,
        },
        headerTintColor: colors.text,

        tabBarStyle: {
          backgroundColor: colors.background,
          paddingBottom: 20,
          height: 80,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Icon name="home" size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="inventory"
        options={{
          title: 'Inventory',
          tabBarIcon: ({ color }) => <Icon name="inventory" size={32} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => <Icon name="account-circle" size={32} color={color} />,
        }}
      />
    </Tabs>
  );
}
