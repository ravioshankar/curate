import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import { Alert, Platform, ScrollView, StyleSheet, TextInput, TouchableOpacity, View, Image, Appearance } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { CollectionItem } from '../../types/collection';
import { ThemedText } from '../../../components/ThemedText';
import { ThemedView } from '../../../components/ThemedView';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useCurrency } from '../providers/SimpleCurrencyProvider';
import { getCurrencyInfo } from '../../utils/currencyUtils';
import { CategoryDropdown } from './CategoryDropdown';
import { LocationDropdown } from './LocationDropdown';
import { loadCategories } from '../../store/categoriesStore';
import { RootState, AppDispatch } from '../../store/store';
import { databaseService } from '../../services/DatabaseService';
import { imageService } from '../../services/ImageService';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface ItemFormProps {
  item?: CollectionItem;
  onSubmit: (item: CollectionItem) => void;
  onCancel: () => void;
  isEdit?: boolean;
}

interface FormErrors {
  name?: string;
}

export function ItemForm({ item, onSubmit, onCancel, isEdit = false }: ItemFormProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { categories, userCategories } = useSelector((state: RootState) => state.categories);
  const backgroundColor = useThemeColor({}, 'background');
  const textColor = useThemeColor({}, 'text');
  const tintColor = useThemeColor({}, 'tint');
  const cardBg = useThemeColor({ light: 'white', dark: '#1f1f1f' }, 'background');
  const borderColor = useThemeColor({ light: 'rgba(0, 0, 0, 0.2)', dark: '#333' }, 'text');
  const formBg = useThemeColor({ light: 'rgba(0, 0, 0, 0.05)', dark: 'rgba(255, 255, 255, 0.05)' }, 'background');
  const placeholderColor = useThemeColor({ light: '#999', dark: '#666' }, 'text');
  const isDarkMode = backgroundColor === '#1C1917' || Appearance.getColorScheme() === 'dark';
  const { currency } = useCurrency();
  const currentCurrency = getCurrencyInfo(currency);
  
  const [formData, setFormData] = useState({
    name: item?.name || '',
    category: item?.category || 'Other',
    location: item?.location || 'Other',
    lastUsed: item?.lastUsed || new Date().toISOString().split('T')[0],
    imageUrl: item?.imageUrl || '',
    pricePaid: item?.pricePaid?.toString() || '',
    priceExpected: item?.priceExpected?.toString() || '',
    notes: item?.notes || ''
  });
  const [selectedImage, setSelectedImage] = useState<string | null>(item?.imageUrl || null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => {
    if (item?.lastUsed) {
      const itemDate = new Date(item.lastUsed);
      const today = new Date();
      return itemDate > today ? today : itemDate;
    }
    return new Date();
  });

  useEffect(() => {
    dispatch(loadCategories());
  }, [dispatch]);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
      if (event.type === 'set' && date) {
        const today = new Date();
        const validDate = date > today ? today : date;
        setSelectedDate(validDate);
        const formattedDate = validDate.toISOString().split('T')[0];
        setFormData(prev => ({ ...prev, lastUsed: formattedDate }));
      }
    } else if (Platform.OS === 'ios') {
      if (date) {
        const today = new Date();
        const validDate = date > today ? today : date;
        setSelectedDate(validDate);
        const formattedDate = validDate.toISOString().split('T')[0];
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
      const uri = await imageService.pickImage();
      if (uri) {
        setSelectedImage(uri);
        handleChange('imageUrl', uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const uri = await imageService.takePhoto();
      if (uri) {
        setSelectedImage(uri);
        handleChange('imageUrl', uri);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    if (!onSubmit || typeof onSubmit !== 'function') {
      console.error('onSubmit is not a function:', onSubmit);
      Alert.alert('Error', 'Submit function is not available');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const itemData: CollectionItem = {
        id: item?.id || Math.random().toString(36).substr(2, 9),
        name: formData.name.trim(),
        category: formData.category || 'Other',
        location: formData.location || '',
        lastUsed: formData.lastUsed,
        imageUrl: selectedImage || '',
        pricePaid: parseFloat(formData.pricePaid) || undefined,
        priceExpected: parseFloat(formData.priceExpected) || undefined,
        notes: formData.notes.trim() || undefined,
      };
      
      onSubmit(itemData);
    } catch (error) {
      console.error('Form submit error:', error);
      Alert.alert('Error', `Failed to ${isEdit ? 'update' : 'add'} item`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
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
        <LocationDropdown
          label="Location"
          value={formData.location}
          onSelect={(value) => handleChange('location', value)}
          cardBg={cardBg}
          borderColor={borderColor}
          textColor={textColor}
          backgroundColor={backgroundColor}
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
              themeVariant={isDarkMode ? 'dark' : 'light'}
              accentColor={tintColor}
              style={{ backgroundColor: cardBg }}
              onChange={handleDateChange}
            />
          )}
        </ThemedView>
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Item Photo</ThemedText>
          {selectedImage ? (
            <View style={[styles.imageContainer, { borderColor }]}>
              <ImageWithFallback 
                imageUrl={selectedImage} 
                style={styles.selectedImage}
                placeholderStyle={[styles.selectedImage, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}
              />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => {
                  setSelectedImage(null);
                  handleChange('imageUrl', '');
                }}
              >
                <Icon name="close" size={20} color="white" />
              </TouchableOpacity>
              {isEdit && (
                <TouchableOpacity 
                  style={[styles.replaceImageButton, { backgroundColor: tintColor }]}
                  onPress={() => Alert.alert(
                    'Replace Photo',
                    'Choose how to replace the photo',
                    [
                      { text: 'Cancel', style: 'cancel' },
                      { text: 'Take Photo', onPress: handleTakePhoto },
                      { text: 'Choose Photo', onPress: handleImagePick }
                    ]
                  )}
                >
                  <Icon name="edit" size={16} color="white" />
                </TouchableOpacity>
              )}
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
        
        <ThemedView style={styles.inputContainer}>
          <ThemedText style={styles.label}>Notes</ThemedText>
          <TextInput
            style={[styles.notesInput, { borderColor, backgroundColor: cardBg, color: textColor }]}
            value={formData.notes}
            onChangeText={(value) => handleChange('notes', value)}
            placeholder="Add any notes about this item..."
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor={placeholderColor}
          />
        </ThemedView>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor }]} 
            onPress={onCancel}
          >
            <ThemedText style={styles.cancelButtonText}>Cancel</ThemedText>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.submitButton, { backgroundColor: isSubmitting ? '#9CA3AF' : tintColor }]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <ThemedText style={[styles.submitText, { color: 'white' }]}>
              {isSubmitting ? (isEdit ? 'Updating...' : 'Adding...') : (isEdit ? 'Update' : 'Add Item')}
            </ThemedText>
          </TouchableOpacity>
        </View>
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
    const numericText = text.replace(/[^0-9.]/g, '');
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

const ImageWithFallback = ({ imageUrl, style, placeholderStyle }: {
  imageUrl?: string;
  style: any;
  placeholderStyle: any;
}) => {
  const [imageError, setImageError] = useState(false);
  
  if (!imageUrl || imageError) {
    return (
      <View style={placeholderStyle}>
        <Icon name="image" size={32} color="#9ca3af" />
      </View>
    );
  }
  
  return (
    <Image
      source={{ uri: imageUrl }}
      style={style}
      onError={() => setImageError(true)}
    />
  );
};

const styles = StyleSheet.create({
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
  notesInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 80,
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
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  submitButton: {
    flex: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
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
  replaceImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 12,
    padding: 6,
  },
});