import { Tabs } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { View, Animated, Easing, Image } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/store';

import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';

function AppHeader() {
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const [magnetometerData, setMagnetometerData] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    let subscription: any;
    
    const startMagnetometer = async () => {
      try {
        const isAvailable = await Magnetometer.isAvailableAsync();
        if (isAvailable) {
          Magnetometer.setUpdateInterval(200);
          subscription = Magnetometer.addListener(setMagnetometerData);
        } else {
          // Fallback to simulated movement if magnetometer not available
          const animate = () => {
            const randomAngle = (Math.random() - 0.5) * 30;
            Animated.timing(rotateAnim, {
              toValue: randomAngle,
              duration: 2000 + Math.random() * 2000,
              easing: Easing.inOut(Easing.quad),
              useNativeDriver: true,
            }).start(() => {
              setTimeout(animate, 1000 + Math.random() * 2000);
            });
          };
          animate();
        }
      } catch (error) {
        console.log('Magnetometer error:', error);
      }
    };

    startMagnetometer();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  // Calculate compass rotation based on magnetometer data
  useEffect(() => {
    if (magnetometerData.x !== 0 || magnetometerData.y !== 0) {
      const angle = Math.atan2(magnetometerData.y, magnetometerData.x) * (180 / Math.PI);
      Animated.timing(rotateAnim, {
        toValue: angle,
        duration: 300,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }).start();
    }
  }, [magnetometerData]);

  const spin = rotateAnim.interpolate({
    inputRange: [-180, 180],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <ThemedText style={{ fontSize: 22, marginRight: 10, textShadowColor: 'rgba(0,0,0,0.1)', textShadowOffset: {width: 1, height: 1}, textShadowRadius: 2 }}>🧭</ThemedText>
        </Animated.View>
        <ThemedText style={{ 
          fontSize: 24, 
          fontWeight: '800', 
          color: '#6366F1',
          letterSpacing: 1,
          textShadowColor: 'rgba(99, 102, 241, 0.3)',
          textShadowOffset: {width: 0, height: 1},
          textShadowRadius: 3
        }}>Curate</ThemedText>
      </View>
      <ThemedText style={{ 
        fontSize: 13, 
        fontWeight: '500',
        color: '#64748B',
        fontStyle: 'italic',
        letterSpacing: 0.5,
        marginTop: 3,
        textShadowColor: 'rgba(100, 116, 139, 0.2)',
        textShadowOffset: {width: 0, height: 1},
        textShadowRadius: 1
      }}>The smarter way to own.</ThemedText>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const { profile } = useSelector((state: RootState) => state.user);

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
          tabBarIcon: ({ color }) => 
            profile.avatar ? (
              <Image 
                source={{ uri: profile.avatar }} 
                style={{ width: 32, height: 32, borderRadius: 16 }} 
              />
            ) : (
              <Icon name="account-circle" size={32} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}
