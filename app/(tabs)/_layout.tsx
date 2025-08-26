import { Tabs } from 'expo-router';
import React from 'react';
import { View, Image } from 'react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store/store';

import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/useAppTheme';
import { ThemedText } from '@/components/ThemedText';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { CurateLogo } from '@/src/components/common/CurateLogo';

function AppHeader() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingVertical: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
        <CurateLogo 
          size={28} 
          backgroundColor="transparent"
          orbColor={colors.tint}
          elementColor={colors.tint}
        />
        <ThemedText style={{ 
          fontSize: 24, 
          fontWeight: '800', 
          color: colorScheme === 'dark' ? '#FFFFFF' : '#B91C1C',
          letterSpacing: 1,
          textShadowColor: colorScheme === 'dark' ? 'rgba(185, 28, 28, 0.5)' : 'rgba(185, 28, 28, 0.3)',
          textShadowOffset: {width: 0, height: 1},
          textShadowRadius: 3,
          marginLeft: 8
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
          height: 90,
        },
        headerTintColor: colors.text,

        tabBarStyle: {
          backgroundColor: colors.background,
          paddingBottom: 8,
          height: 70,
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
        name="collection"
        options={{
          title: 'Collection',
          tabBarIcon: ({ color }) => <Icon name="collections" size={32} color={color} />,
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
