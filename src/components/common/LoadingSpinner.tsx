import { ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedView } from '../../../components/ThemedView';

export function LoadingSpinner() {
  return (
    <ThemedView style={styles.container}>
      <ActivityIndicator size="large" color="#6366F1" />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});