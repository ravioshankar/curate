import { useState } from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { ThemedText } from './ThemedText';
import { ThemedView } from './ThemedView';
import { InventoryItem } from '../types/inventory';

interface AddItemPageProps {
  onAddItem: (item: InventoryItem) => void;
  onBack: () => void;
}

interface FormErrors {
  name?: string;
}

export function AddItemPage({ onAddItem, onBack }: AddItemPageProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    lastUsed: '',
    imageUrl: '',
    pricePaid: '',
    priceExpected: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const newItem: InventoryItem = {
        ...formData,
        id: Math.random().toString(36).substr(2, 9),
        pricePaid: parseFloat(formData.pricePaid) || undefined,
        priceExpected: parseFloat(formData.priceExpected) || undefined,
      };
      
      onAddItem(newItem);
      
      Alert.alert(
        'Success!',
        'Item added to your inventory',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to add item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Add New Item</ThemedText>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ThemedView style={styles.form}>
        <InputField
          label="Item Name *"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          error={errors.name}
        />
        <InputField
          label="Category"
          value={formData.category}
          onChangeText={(value) => handleChange('category', value)}
        />
        <InputField
          label="Location"
          value={formData.location}
          onChangeText={(value) => handleChange('location', value)}
        />
        <InputField
          label="Last Used Date"
          value={formData.lastUsed}
          onChangeText={(value) => handleChange('lastUsed', value)}
          placeholder="YYYY-MM-DD"
        />
        <InputField
          label="Image URL"
          value={formData.imageUrl}
          onChangeText={(value) => handleChange('imageUrl', value)}
        />
        <InputField
          label="Price Paid ($)"
          value={formData.pricePaid}
          onChangeText={(value) => handleChange('pricePaid', value)}
          keyboardType="numeric"
        />
        <InputField
          label="Expected Price ($)"
          value={formData.priceExpected}
          onChangeText={(value) => handleChange('priceExpected', value)}
          keyboardType="numeric"
        />

        <TouchableOpacity 
          style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <ThemedText style={styles.submitText}>
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  error?: string;
}

function InputField({ label, value, onChangeText, placeholder, keyboardType = 'default', error }: InputFieldProps) {
  const hasError = error;
  
  return (
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={[styles.label, hasError && styles.labelError]}>{label}</ThemedText>
      <TextInput
        style={[styles.input, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor="#999"
      />
      {hasError && (
        <ThemedText style={styles.errorText}>{hasError}</ThemedText>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  form: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  input: {
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  labelError: {
    color: '#EF4444',
  },
  inputError: {
    borderColor: '#EF4444',
    borderWidth: 2,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 12,
    marginTop: 4,
  },
});