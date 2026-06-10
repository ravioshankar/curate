import { RootState } from '@/src/store/store';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { useSelector } from 'react-redux';

import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/useAppTheme';
import { IQRateLogo } from '@/src/components/common/IQRateLogo';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

function AppHeader() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];

  return (
    <View style={styles.headerContent}>
      <View style={styles.brandRow}>
        <IQRateLogo
          size={30}
          backgroundColor="transparent"
          orbColor={colors.tint}
          elementColor={colors.tint}
        />
        <ThemedText style={{
          fontSize: 26,
          fontWeight: '800', 
          color: colors.text,
          marginLeft: 10
        }}>iQRate</ThemedText>
      </View>
        <ThemedText style={{
        fontSize: 12,
        fontWeight: '600',
        color: colorScheme === 'dark' ? '#D6D3D1' : '#78716C',
        marginTop: 2,
        textTransform: 'uppercase',
      }}>The smarter way to own</ThemedText>
    </View>
  );
}

interface TabIconProps {
  color: string;
  focused: boolean;
  name: string;
}

const getTabIcon = (props: TabIconProps) => {
  const { color, focused, name } = props;
  const size = focused ? 28 : 26;

  switch (name) {
    case 'home':
      return <Icon name={focused ? 'home' : 'home-outline'} size={size} color={color} />;
    case 'data-collection':
      return <Icon name={focused ? 'database-plus' : 'database-plus-outline'} size={size} color={color} />;
    case 'valuation':
      return <Icon name={focused ? 'chart-pie' : 'chart-pie'} size={size} color={color} />;
    default:
      return <Icon name="circle" size={size} color={color} />;
  }
};

export default function TabLayout() {
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const { profile } = useSelector((state: RootState) => state.user);

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.tabIconSelected,
        tabBarInactiveTintColor: colors.tabIconDefault,
        headerShown: true,
        headerTitle: () => <AppHeader />,
        headerStyle: {
          backgroundColor: colors.background,
          height: 88,
        },
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          paddingBottom: 10,
          paddingTop: 8,
          height: 80,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        tabBarHideOnKeyboard: true,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '700',
          textTransform: 'uppercase',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, focused }) => getTabIcon({ name: 'home', color, focused }),
        }}
      />
      <Tabs.Screen
        name="data-collection/projects-list"
        options={{
          title: 'Data Collection',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, focused }) => getTabIcon({ name: 'data-collection', color, focused }),
        }}
      />
      <Tabs.Screen
        name="valuation"
        options={{
          title: 'Value',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, focused }) => getTabIcon({ name: 'valuation', color, focused }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitleAlign: 'center',
          tabBarIcon: ({ color, focused }) =>
            profile.avatar ? (
              <Image 
                source={{ uri: profile.avatar }} 
                style={[
                  styles.profileAvatar,
                  focused && { borderColor: colors.tabIconSelected },
                ]}
              />
            ) : (
              <Icon name={focused ? 'account-circle' : 'account-circle-outline'} size={28} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
