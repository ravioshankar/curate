import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';

interface NavButtonProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onPress: () => void;
}

export function NavButton({ icon, label, isActive, onPress }: NavButtonProps) {
  const handlePress = () => {
    console.log('NavButton pressed:', label);
    onPress();
  };
  
  return (
    <TouchableOpacity onPress={handlePress} style={[styles.button, isActive && styles.activeButton]}>
      <ThemedView style={[styles.content, isActive && styles.activeContent]}>
        <ThemedText style={[styles.icon, isActive && styles.activeText]}>{icon}</ThemedText>
        <ThemedText style={[styles.label, isActive && styles.activeText]}>{label}</ThemedText>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  activeButton: {
    backgroundColor: '#6366F1',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: 'transparent',
  },
  activeContent: {
    backgroundColor: 'transparent',
  },
  icon: {
    fontSize: 20,
    marginRight: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activeText: {
    color: 'white',
  },
});