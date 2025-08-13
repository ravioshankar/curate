import { useState } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';

export function Counter() {
  const [count, setCount] = useState(0);

  return (
    <ThemedView style={styles.container}>
      <ThemedText style={styles.countText}>{count}</ThemedText>
      <TouchableOpacity 
        style={styles.button} 
        onPress={() => setCount(count + 1)}
      >
        <ThemedText style={styles.buttonText}>Increment</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 16,
    padding: 20,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  countText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});