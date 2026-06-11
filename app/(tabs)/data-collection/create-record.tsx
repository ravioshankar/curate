import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import DateTimePicker from '@react-native-community/datetimepicker';

import { ProjectStorage } from '@/src/services/project-storage';
import { RecordStorage } from '@/src/services/record-storage';
import { TemplateStorage } from '@/src/services/template-storage';
import { type DataProject, type DataTemplate, type RecordStatus } from '@/src/types/data-collection';

export default function CreateRecordScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams();
  const normalizedProjectId = Array.isArray(projectId) ? projectId[0] : projectId;
  const projectStorage = useMemo(() => new ProjectStorage(), []);
  const recordStorage = useMemo(() => new RecordStorage(), []);
  const templateStorage = useMemo(() => new TemplateStorage(), []);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [value, setValue] = useState<string>('');
  const [status, setStatus] = useState<RecordStatus>('draft');
  const [templateId, setTemplateId] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [dateValue, setDateValue] = useState(new Date());

  // Project info for template selection
  const [project, setProject] = useState<DataProject | null>(null);
  const [availableTemplates, setAvailableTemplates] = useState<DataTemplate[]>([]);

  const loadProjectAndTemplates = useCallback(async () => {
    if (!normalizedProjectId) return;

    try {
      const projectData = await projectStorage.getById(normalizedProjectId);

      if (projectData) {
        setProject(projectData);

        const templates = await templateStorage.getAll();
        const projectTemplates = templates.filter(t => projectData.templateIds.includes(t.id) || t.isBuiltIn);

        setAvailableTemplates(projectTemplates);
      }
    } catch (error) {
      console.error('Error loading project:', error);
    }
  }, [normalizedProjectId, projectStorage, templateStorage]);

  React.useEffect(() => {
    loadProjectAndTemplates();
  }, [loadProjectAndTemplates]);

  const handleSelectTemplate = async (template: DataTemplate) => {
    setTemplateId(template.id);
  };

  const handleSubmit = async () => {
    if (!normalizedProjectId) {
      Alert.alert('Missing Project', 'Choose a project before creating a record.');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Validation Error', 'Please enter a name for this record');
      return;
    }

    const numericValue = value.trim() ? Number(value) : undefined;
    if (numericValue !== undefined && !Number.isFinite(numericValue)) {
      Alert.alert('Validation Error', 'Enter a valid numeric value.');
      return;
    }

    try {
      const selectedTemplateId = templateId || availableTemplates[0]?.id || 'manual_record';

      const savedRecord = await recordStorage.create({
        projectId: normalizedProjectId,
        templateId: selectedTemplateId,
        values: {
          name: name.trim(),
          description: description.trim(),
          value: numericValue,
          capturedDate: dateValue.toISOString(),
        },
        metadata: {
          capturedAt: dateValue.toISOString(),
          appVersion: 'local',
        },
        status,
      });

      router.push({
        pathname: '/data-collection/[recordId]/view',
        params: { recordId: savedRecord.id },
      });

    } catch (error) {
      console.error('Error creating record:', error);
      Alert.alert('Error', 'Failed to create record. Please try again.');
    }
  };

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (selectedDate) {
      setDateValue(selectedDate);
      setShowDatePicker(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      style={{ flex: 1, backgroundColor: '#ffffff' }}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, padding: 24 }}
        showsVerticalScrollIndicator={false}
      >
        <Stack.Screen
          options={{
            title: 'Create Record',
            headerBackTitle: 'Back',
          }}
        />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>New Record</Text>
          <Text style={styles.headerSubtitle}>
            {project ? `Add a record to ${project.name}` : 'Fill in the details below'}
          </Text>
        </View>

        {/* Template Selection (if available) */}
        {availableTemplates.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Select Template</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.templateScrollContainer}
            >
              {availableTemplates.map(template => (
                <TouchableOpacity
                  key={template.id}
                  style={[
                    styles.templateCard,
                    templateId === template.id && styles.selectedTemplate
                  ]}
                  onPress={() => handleSelectTemplate(template)}
                >
                  <View style={styles.templateHeader}>
                    <Text style={[
                      styles.templateName,
                      templateId === template.id && styles.selectedTemplateName
                    ]}>
                      {template.name}
                    </Text>
                  </View>

                  {template.description && (
                    <Text style={styles.templateDescription} numberOfLines={2}>
                      {template.description}
                    </Text>
                  )}

                  {template.version ? (
                    <View style={styles.versionBadge}>
                      <Text style={styles.versionText}>v{template.version}</Text>
                    </View>
                  ) : null}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Basic Fields */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={[styles.input, name.length > 0 && styles.inputValid]}
              placeholder="Record name"
              placeholderTextColor="#9ca3af"
              value={name}
              onChangeText={setName}
              onSubmitEditing={() => {} // Could navigate to description
            }
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.textAreaInput, description.length > 0 && styles.inputValid]}
              placeholder="Optional description"
              placeholderTextColor="#9ca3af"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
            />
          </View>

          {/* Value */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Value (Optional)</Text>
            <TextInput
              style={[styles.input, value.length > 0 && styles.inputValid]}
              placeholder="Enter numeric value"
              placeholderTextColor="#9ca3af"
              value={value}
              onChangeText={setValue}
              keyboardType="numeric"
            />
          </View>

          {/* Status */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusButtonsContainer}>
              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'draft' ? styles.activeStatus : styles.inactiveStatus,
                ]}
                onPress={() => setStatus('draft')}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'draft' && styles.activeStatusText,
                  ]}
                >
                  Draft
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  status === 'submitted' ? styles.activeStatus : styles.inactiveStatus,
                ]}
                onPress={() => setStatus('submitted')}
              >
                <Text
                  style={[
                    styles.statusButtonText,
                    status === 'submitted' && styles.activeStatusText,
                  ]}
                >
                  Submitted
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Created Date</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={styles.dateButtonText}>
                {dateValue.toLocaleDateString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={dateValue}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={handleDateChange}
              />
            )}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.cancelButton, { backgroundColor: '#e5e7eb' }]}
            onPress={() => router.back()}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }]}
            onPress={handleSubmit}
          >
            <Text style={styles.saveButtonText}>Create Record</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const baseInput = {
  backgroundColor: '#f9fafb',
  borderRadius: 10,
  paddingVertical: 12,
  paddingHorizontal: 16,
  fontSize: 16,
  color: '#1f2937',
  borderWidth: 1,
  borderColor: '#e5e7eb',
};

const styles = StyleSheet.create({
  header: { marginBottom: 24 },
  headerTitle: { fontSize: 32, fontWeight: 'bold', color: '#1e293b' },
  headerSubtitle: { fontSize: 16, color: '#6b7280', marginTop: 4 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: '600', color: '#374151', marginBottom: 12 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '500', color: '#374151', marginBottom: 8 },
  input: baseInput,
  inputValid: { backgroundColor: '#ecfdf5', borderColor: '#86efac' },
  textAreaInput: {
    ...baseInput,
    minHeight: 100,
    paddingTop: 14,
  },
  templateScrollContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 8,
    paddingRight: 16,
  },
  templateCard: {
    flex: 1, // Changed from 0.8 to handle horizontal scrolling better
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  selectedTemplate: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
  },
  templateHeader: { marginBottom: 8 },
  templateName: { fontSize: 14, fontWeight: '600', color: '#1f2937' },
  selectedTemplateName: { color: '#3b82f6' },
  templateDescription: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 14,
  },
versionBadge: {
    marginTop: -4,
    marginBottom: -8,
    marginLeft: 'auto', // Fixed: was 'auto' without quotes
    backgroundColor: '#3b82f6',
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  versionText: { color: 'white', fontSize: 9, fontWeight: '600' },
  statusButtonsContainer: { flexDirection: 'row', gap: 8 },
  statusButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
    borderColor: '#86efac',
  },
  inactiveStatus: {
    backgroundColor: '#f3f4f6',
    borderColor: '#e5e7eb',
  },
  statusButtonText: { color: '#374151' },
  activeStatusText: { color: '#065f46', fontWeight: '600' },
  dateButton: {
    backgroundColor: '#f9fafb',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    alignItems: 'center',
  },
  dateButtonText: { color: '#374151', fontSize: 14 },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
    paddingBottom: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: { color: '#374151', fontSize: 16, fontWeight: '600' },
  saveButton: {
    flex: 2,
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
  },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '700' },
});
