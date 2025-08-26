import { Alert, StyleSheet, TouchableOpacity } from 'react-native';
import { CollectionItem } from '../../types/collection';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { ItemForm } from './ItemForm';

interface AddItemPageProps {
  item?: CollectionItem;
  onSubmit?: (item: CollectionItem) => void;
  onBack: () => void;
  isEdit?: boolean;
}

export function AddItemPage({ item, onSubmit = () => {}, onBack, isEdit = false }: AddItemPageProps) {
  const handleSubmit = (itemData: CollectionItem) => {
    if (typeof onSubmit === 'function') {
      onSubmit(itemData);
      Alert.alert(
        'Success!',
        `Item ${isEdit ? 'updated' : 'added to your collection'}`,
        [{ text: 'OK', onPress: onBack }]
      );
    } else {
      console.error('onSubmit is not a function');
      Alert.alert('Error', 'Submit function is not available');
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{isEdit ? 'Edit Item' : 'Add New Item'}</ThemedText>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </TouchableOpacity>
      </ThemedView>
      <ItemForm item={item} onSubmit={handleSubmit} onCancel={onBack} isEdit={isEdit} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: 'transparent',
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 20,
    opacity: 0.7,
  },
});
