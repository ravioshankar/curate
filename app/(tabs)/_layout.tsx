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

const TAB_ICONS = {
  home: {
    active: 'view-dashboard',
    inactive: 'view-dashboard-outline',
  },
  'data-collection': {
    active: 'clipboard-list',
    inactive: 'clipboard-list-outline',
  },
  valuation: {
    active: 'chart-box',
    inactive: 'chart-box-outline',
  },
  profile: {
    active: 'account-circle',
    inactive: 'account-circle-outline',
  },
} as const;

type TabIconName = keyof typeof TAB_ICONS;

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
        <ThemedText style={[styles.brandTitle, { color: colors.text }]}>iQRate</ThemedText>
      </View>
      <ThemedText
        style={[
          styles.brandTagline,
          { color: colorScheme === 'dark' ? '#D6D3D1' : '#78716C' },
        ]}
      >
        The smarter way to own
      </ThemedText>
    </View>
  );
}

interface TabIconProps {
  color: string;
  focused: boolean;
  name: TabIconName;
}

const getTabIcon = (props: TabIconProps) => {
  const { color, focused, name } = props;
  const size = focused ? 28 : 26;
  const iconName = TAB_ICONS[name][focused ? 'active' : 'inactive'];

  return <Icon name={iconName} size={size} color={color} />;
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
          title: 'Dashboard',
          headerTitleAlign: 'center',
          tabBarAccessibilityLabel: 'Dashboard tab',
          tabBarIcon: ({ color, focused }) => getTabIcon({ name: 'home', color, focused }),
        }}
      />
      <Tabs.Screen
        name="data-collection/projects-list"
        options={{
          title: 'Collect',
          headerTitleAlign: 'center',
          tabBarAccessibilityLabel: 'Data collection tab',
          tabBarIcon: ({ color, focused }) => getTabIcon({ name: 'data-collection', color, focused }),
        }}
      />
      <Tabs.Screen
        name="valuation"
        options={{
          title: 'Value',
          headerTitleAlign: 'center',
          tabBarAccessibilityLabel: 'Valuation tab',
          tabBarIcon: ({ color, focused }) => getTabIcon({ name: 'valuation', color, focused }),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          headerTitleAlign: 'center',
          tabBarAccessibilityLabel: 'Profile and settings tab',
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
              getTabIcon({ name: 'profile', color, focused })
            ),
        }}
      />
      <Tabs.Screen name="collection" options={{ href: null }} />
      <Tabs.Screen name="projects" options={{ href: null }} />
      <Tabs.Screen name="data-collection/create-record" options={{ href: null }} />
      <Tabs.Screen name="data-collection/templates-screen" options={{ href: null }} />
      <Tabs.Screen name="data-collection/[recordId]/view" options={{ href: null }} />
      <Tabs.Screen name="data-collection/projects/create" options={{ href: null }} />
      <Tabs.Screen name="data-collection/projects/[id]/detail" options={{ href: null }} />
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
  brandTitle: {
    fontSize: 26,
    fontWeight: '800',
    marginLeft: 10,
  },
  brandTagline: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  profileAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
});
