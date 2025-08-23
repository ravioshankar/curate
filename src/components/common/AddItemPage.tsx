import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Image } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { InventoryItem } from '../../types/inventory';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useCurrency } from '../providers/SimpleCurrencyProvider';
import { getCurrencyInfo } from '../../utils/currencyUtils';
import { CategoryDropdown } from './CategoryDropdown';
import { loadCategories } from '../../store/categoriesStore';
import { RootState, AppDispatch } from '../../store/store';
import { databaseService } from '../../services/DatabaseService';
import { ImageService } from '../../services/ImageService';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AddItemPageProps {
  onAddItem: (item: InventoryItem) => void;
  onBack: () => void;
}

interface FormErrors {
  name?: string;
}

export function AddItemPage({ onAddItem, onBack }: AddItemPageProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, userCategories } = useSelector((state: RootState) => state.categories);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0, 0, 0, 0.2)', dark: '#333' }, 'text');
  const formBg = useThemeColor({ light: 'rgba(0, 0, 0, 0.05)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const { currency } = useCurrency();
  const currentCurrency = getCurrencyInfo(currency);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    location: '',
    lastUsed: new Date().toISOString().split('T')[0],
    imageUrl: '',
    pricePaid: '',
    priceExpected: ''
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    dispatch(loadCategories());
  }, [dispatch]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false); // Always hide the modal on Android after an action
      // Only update the date if the user confirmed a selection ('set' event)
    if (event.type === 'set' && date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, lastUsed: formattedDate }));
    }
      // If event.type was 'dismissed', 'date' is typically undefined, and no update occurs, which is correct.
    } else if (Platform.OS === 'ios') {
      // For iOS with the 'spinner' display, onChange fires on any value change.
      // We'll update the state live. The picker remains visible
      // as setShowDatePicker is not set to false here for iOS.
      if (date) { // 'date' will be the newly selected date from the spinner
        setSelectedDate(date);
        const formattedDate = date.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, lastUsed: formattedDate }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleDeleteCategory = async (categoryName: string) => {
    try {
      await databaseService.deleteCategory(categoryName);
      dispatch(loadCategories());
    } catch (error) {
      Alert.alert('Error', 'Cannot delete default category');
    }
  };

  const handleImagePick = async () => {
    try {
      const uri = await ImageService.pickImage();
      if (uri) setSelectedImage(uri);
    } catch (error) {
      Alert.alert('Photo Library Access', error.message || 'Failed to access photo library');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await ImageService.takePhoto();
      if (uri) setSelectedImage(uri);
    } catch (error) {
      Alert.alert('Camera Access', error.message || 'Failed to access camera');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      const itemId = Math.random().toString(36).substr(2, 9);
      let imageUrl = '';
      
      if (selectedImage) {
        try {
          imageUrl = await ImageService.saveImage(selectedImage, itemId);
        } catch (imageError) {
          console.warn('Failed to save image:', imageError);
          imageUrl = selectedImage; // Use original URI as fallback
        }
      }
      
      const newItem: InventoryItem = {
        id: itemId,
        name: formData.name.trim(),
        category: formData.category || 'Other',
        location: formData.location || '',
        lastUsed: formData.lastUsed,
        imageUrl,
        pricePaid: parseFloat(formData.pricePaid) || undefined,
        priceExpected: parseFloat(formData.priceExpected) || undefined,
      };
      
      console.log('Attempting to add item:', newItem);
      onAddItem(newItem);
      
      Alert.alert(
        'Success!',
        'Item added to your inventory',
        [{ text: 'OK', onPress: onBack }]
      );
    } catch (error) {
      console.error('Add item error:', error);
      Alert.alert('Error', `Failed to add item: ${error?.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title">Add New Item</ThemedText>
        <TouchableOpacity onPress={onBack} style={styles.closeButton}>
          <ThemedText style={styles.closeText}>✕</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      <ScrollView showsVerticalScrollIndicator={false}>
        <ThemedView style={[styles.form, { backgroundColor: formBg }]}>
        <InputField
          label="Item Name *"
          value={formData.name}
          onChangeText={(value) => handleChange('name', value)}
          error={errors.name}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          placeholderColor={placeholderColor}
        />
        <CategoryDropdown
          label="Category"
          value={formData.category}
          onSelect={(value) => handleChange('category', value)}
          categories={categories}
          userCategories={userCategories}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
          onDeleteCategory={handleDeleteCategory}
        />
        <InputField
          label="Location"
          value={formData.location}
          onChangeText={(value) => handleChange('location', value)}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          placeholderColor={placeholderColor}
        />
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Last Used Date</ThemedText>
          <TouchableOpacity 
            style={[styles.dateButton, { borderColor, backgroundColor: cardBg }]} 
            onPress={() => setShowDatePicker(true)}
          >
            <ThemedText style={styles.dateButtonText}>{formData.lastUsed}</ThemedText>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}
        </ThemedView>
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Item Photo</ThemedText>
          {selectedImage ? (
            <View style={[styles.imageContainer, { borderColor }]}>
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setSelectedImage(null)}
              >
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.photoButtons}>
              <TouchableOpacity 
                style={[styles.photoButton, { backgroundColor: tintColor }]}
                onPress={handleTakePhoto}
              >
                <Icon name="camera-alt" size={24} color="white" />
                <ThemedText style={styles.photoButtonText}>Take Photo</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.photoButton, { backgroundColor: '#10B981' }]}
                onPress={handleImagePick}
              >
                <Icon name="photo-library" size={24} color="white" />
                <ThemedText style={styles.photoButtonText}>Choose Photo</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ThemedView>
        <CurrencyInputField
          label="Price Paid"
          value={formData.pricePaid}
          onChangeText={(value) => handleChange('pricePaid', value)}
          currency={currentCurrency}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          placeholderColor={placeholderColor}
        />
        <CurrencyInputField
          label="Expected Price"
          value={formData.priceExpected}
          onChangeText={(value) => handleChange('priceExpected', value)}
          currency={currentCurrency}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          placeholderColor={placeholderColor}
        />

        <TouchableOpacity 
          style={[styles.submitButton, { backgroundColor: isSubmitting ? '#9CA3AF' : tintColor }]} 
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          <ThemedText style={[styles.submitText, { color: 'white' }]}>
            {isSubmitting ? 'Adding...' : 'Add Item'}
          </ThemedText>
        </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

interface InputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'numeric';
  error?: string;
  cardBg: string;
  borderColor: string;
  textColor: string;
  placeholderColor: string;
}

function InputField({ label, value, onChangeText, placeholder, keyboardType = 'default', error, cardBg, borderColor, textColor, placeholderColor }: InputFieldProps) {
  const hasError = error;
  
  return (
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={[styles.label, hasError && styles.labelError]}>{label}</ThemedText>
      <TextInput
        style={[styles.input, { borderColor, backgroundColor: cardBg, color: textColor }, hasError && styles.inputError]}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        keyboardType={keyboardType}
        placeholderTextColor={placeholderColor}
      />
      {hasError && (
        <ThemedText style={styles.errorText}>{hasError}</ThemedText>
      )}
    </ThemedView>
  );
}

interface CurrencyInputFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  currency: { flag: string; symbol: string };
  cardBg: string;
  borderColor: string;
  textColor: string;
  placeholderColor: string;
}

function CurrencyInputField({ label, value, onChangeText, currency, cardBg, borderColor, textColor, placeholderColor }: CurrencyInputFieldProps) {
  const handleTextChange = (text: string) => {
    // Only allow numbers and decimal point
    const numericText = text.replace(/[^0-9.]/g, '');
    // Ensure only one decimal point
    const parts = numericText.split('.');
    const validText = parts.length > 2 ? parts[0] + '.' + parts.slice(1).join('') : numericText;
    onChangeText(validText);
  };
  
  return (
    <ThemedView style={styles.inputContainer}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <View style={[styles.currencyInputContainer, { borderColor, backgroundColor: cardBg }]}>
        <View style={styles.currencyPrefix}>
          <ThemedText style={styles.currencyFlag}>{currency.flag}</ThemedText>
          <ThemedText style={[styles.currencySymbol, { color: textColor }]}>{currency.symbol}</ThemedText>
        </View>
        <TextInput
          style={[styles.currencyInput, { color: textColor }]}
          value={value}
          onChangeText={handleTextChange}
          placeholder="0.00"
          keyboardType="decimal-pad"
          returnKeyType="done"
          placeholderTextColor={placeholderColor}
        />
      </View>
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
  form: {
    borderRadius: 12,
    padding: 20,
    gap: 16,
  },
  inputContainer: {
    gap: 8,
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
  },
  labelError: {
    color: '#ef4444',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  inputError: {
    borderColor: '#ef4444',
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
  },
  dateButton: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dateButtonText: {
    fontSize: 16,
  },
  submitButton: {
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  submitText: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  currencyPrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    gap: 6,
    borderRightWidth: 1,
    borderRightColor: 'rgba(0,0,0,0.1)',
  },
  currencyFlag: {
    fontSize: 18,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: '600',
  },
  currencyInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
  },
  photoButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  photoButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    gap: 8,
  },
  photoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  imageContainer: {
    position: 'relative',
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  selectedImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.7)',
    borderRadius: 12,
    padding: 4,
  },
});
