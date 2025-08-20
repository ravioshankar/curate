import { StyleSheet } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withRepeat, 
  withTiming,
  interpolate,
  Easing
} from 'react-native-reanimated';
import { useEffect } from 'react';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { NavButton } from './NavButton';

interface HeaderProps {
  currentPage: string;
  setCurrentPage: (page: string) => void;
}

export function Header({ currentPage, setCurrentPage }: HeaderProps) {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: 5000,
        easing: Easing.linear,
      }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }],
    };
  });

  return (
    <ThemedView style={styles.header}>
      <ThemedView style={styles.brandSection}>
        <ThemedView style={styles.titleRow}>
          <Animated.View style={animatedStyle}>
            <ThemedText style={styles.hourglassIcon}>⏳</ThemedText>
          </Animated.View>
          <ThemedText type="title" style={styles.title}>Curate</ThemedText>
        </ThemedView>
        <ThemedText style={styles.subtitle}>The smarter way to own.</ThemedText>
      </ThemedView>
      
      <ThemedView style={styles.navigation}>
        <NavButton
          icon="🏠"
          label="Dashboard"
          isActive={currentPage === 'home'}
          onPress={() => setCurrentPage('home')}
        />
        <NavButton
          icon="📋"
          label="Inventory"
          isActive={currentPage === 'inventory'}
          onPress={() => setCurrentPage('inventory')}
        />
        <NavButton
          icon="➕"
          label="Add Item"
          isActive={currentPage === 'add-item'}
          onPress={() => setCurrentPage('add-item')}
        />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
    flexDirection: 'column',
    gap: 16,
  },
  brandSection: {
    backgroundColor: 'transparent',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    marginBottom: 4,
  },
  hourglassIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    opacity: 0.7,
    fontWeight: '500',
  },
  navigation: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
});