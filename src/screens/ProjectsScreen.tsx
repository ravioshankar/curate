import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { AppDispatch, RootState } from '../store/store';
import {
  createDataProject,
  createDataRecord,
  loadDataCollection,
} from '../store/dataCollectionStore';
import { DataRecord, DataTemplate, TemplateField } from '../types/dataCollection';

const formatDate = (value: string) => new Date(value).toLocaleDateString();

const getRecordTitle = (record: DataRecord, template?: DataTemplate) => {
  const firstDisplayField = template?.fields.find((field) => field.display?.showInList) || template?.fields[0];
  const value = firstDisplayField ? record.values[firstDisplayField.key] : undefined;
  return typeof value === 'string' && value.trim() ? value : 'Untitled record';
};

const valueToText = (value: unknown) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (value === undefined || value === null || value === '') return 'Blank';
  return String(value);
};

export function ProjectsScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const { projects, templates, records, loading } = useSelector((state: RootState) => state.dataCollection);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showRecordModal, setShowRecordModal] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [recordValues, setRecordValues] = useState<Record<string, unknown>>({});
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    dispatch(loadDataCollection());
  }, [dispatch]);

  const activeProjects = useMemo(
    () => projects.filter((project) => project.status === 'active'),
    [projects]
  );

  const selectedProject = useMemo(() => {
    return activeProjects.find((project) => project.id === selectedProjectId) || activeProjects[0] || null;
  }, [activeProjects, selectedProjectId]);

  const selectedProjectTemplate = useMemo(() => {
    if (!selectedProject) return null;
    return templates.find((template) => template.id === selectedProject.templateIds[0]) || null;
  }, [selectedProject, templates]);

  const projectRecords = useMemo(() => {
    if (!selectedProject) return [];
    return records.filter((record) => record.projectId === selectedProject.id);
  }, [records, selectedProject]);

  const templateForNewProject = templates.find((template) => template.id === selectedTemplateId) || templates[0];

  const openProjectModal = () => {
    setProjectName('');
    setProjectDescription('');
    setSelectedTemplateId(templates[0]?.id || null);
    setShowProjectModal(true);
  };

  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      Alert.alert('Project name required', 'Add a name before creating this project.');
      return;
    }

    if (!templateForNewProject) {
      Alert.alert('Template required', 'Choose a template before creating this project.');
      return;
    }

    const project = await dispatch(createDataProject({
      name: projectName,
      description: projectDescription,
      templateId: templateForNewProject.id,
    })).unwrap();

    setSelectedProjectId(project.id);
    setShowProjectModal(false);
  };

  const openRecordModal = () => {
    if (!selectedProject || !selectedProjectTemplate) return;

    const initialValues = selectedProjectTemplate.fields.reduce<Record<string, unknown>>((values, field) => {
      if (field.defaultValue !== undefined) values[field.key] = field.defaultValue;
      if (field.type === 'boolean') values[field.key] = false;
      return values;
    }, {});

    setRecordValues(initialValues);
    setValidationErrors({});
    setShowRecordModal(true);
  };

  const validateRecord = (template: DataTemplate) => {
    const errors: Record<string, string> = {};

    for (const field of template.fields) {
      const value = recordValues[field.key];
      const isBlank = value === undefined || value === null || value === '';
      if (field.required && isBlank) {
        errors[field.key] = `${field.label} is required`;
      }

      if ((field.type === 'number' || field.type === 'currency' || field.type === 'rating') && !isBlank) {
        const numericValue = Number(value);
        if (!Number.isFinite(numericValue)) {
          errors[field.key] = `${field.label} must be a number`;
        }
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSaveRecord = async (status: DataRecord['status']) => {
    if (!selectedProject || !selectedProjectTemplate) return;

    if (status === 'submitted' && !validateRecord(selectedProjectTemplate)) {
      return;
    }

    await dispatch(createDataRecord({
      projectId: selectedProject.id,
      templateId: selectedProjectTemplate.id,
      values: recordValues,
      status,
    })).unwrap();

    setShowRecordModal(false);
  };

  const updateValue = (field: TemplateField, value: unknown) => {
    setRecordValues((current) => ({ ...current, [field.key]: value }));
    setValidationErrors((current) => {
      const next = { ...current };
      delete next[field.key];
      return next;
    });
  };

  const renderField = (field: TemplateField) => {
    const value = recordValues[field.key];
    const error = validationErrors[field.key];

    if (field.type === 'boolean') {
      return (
        <View key={field.id} style={styles.fieldBlock}>
          <View style={styles.switchRow}>
            <Text style={styles.fieldLabel}>{field.label}</Text>
            <Switch value={Boolean(value)} onValueChange={(next) => updateValue(field, next)} />
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );
    }

    if (field.type === 'select' && field.options?.length) {
      return (
        <View key={field.id} style={styles.fieldBlock}>
          <Text style={styles.fieldLabel}>{field.label}{field.required ? ' *' : ''}</Text>
          <View style={styles.optionGrid}>
            {field.options.map((option) => {
              const selected = value === option;
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.optionChip, selected && styles.optionChipSelected]}
                  onPress={() => updateValue(field, option)}
                >
                  <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{option}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          {error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      );
    }

    const keyboardType = field.type === 'number' || field.type === 'currency' || field.type === 'rating'
      ? 'decimal-pad'
      : 'default';

    return (
      <View key={field.id} style={styles.fieldBlock}>
        <Text style={styles.fieldLabel}>{field.label}{field.required ? ' *' : ''}</Text>
        <TextInput
          value={value === undefined ? '' : String(value)}
          onChangeText={(next) => updateValue(field, next)}
          placeholder={field.placeholder}
          keyboardType={keyboardType}
          multiline={field.type === 'longText'}
          style={[styles.input, field.type === 'longText' && styles.longInput]}
        />
        {error && <Text style={styles.errorText}>{error}</Text>}
      </View>
    );
  };

  const renderTemplateAdmin = () => {
    if (Platform.OS !== 'web') return null;

    return (
      <ThemedView style={styles.adminPanel}>
        <View style={styles.sectionHeader}>
          <View>
            <ThemedText type="subtitle">Template Admin</ThemedText>
            <Text style={styles.mutedText}>Web-only workspace controls</Text>
          </View>
          <Icon name="desktop-windows" size={22} color="#2563EB" />
        </View>
        {templates.map((template) => (
          <View key={template.id} style={styles.templateAdminRow}>
            <View style={styles.templateAdminText}>
              <Text style={styles.recordTitle}>{template.name}</Text>
              <Text style={styles.mutedText}>{template.fields.length} fields - v{template.version}</Text>
            </View>
            <Text style={styles.templateBadge}>{template.isBuiltIn ? 'Built-in' : 'Custom'}</Text>
          </View>
        ))}
      </ThemedView>
    );
  };

  return (
    <ThemedView style={styles.container} testID="projects-screen">
      <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
        <ThemedView style={styles.header}>
          <View>
            <ThemedText type="title">Projects</ThemedText>
            <Text style={styles.mutedText}>Collect structured records from reusable templates.</Text>
          </View>
          <TouchableOpacity style={styles.primaryIconButton} onPress={openProjectModal}>
            <Icon name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </ThemedView>

        <ThemedView style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{activeProjects.length}</Text>
            <Text style={styles.statLabel}>Projects</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{records.length}</Text>
            <Text style={styles.statLabel}>Records</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{templates.length}</Text>
            <Text style={styles.statLabel}>Templates</Text>
          </View>
        </ThemedView>

        <ThemedView style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle">Active Projects</ThemedText>
            <TouchableOpacity style={styles.secondaryButton} onPress={openProjectModal}>
              <Icon name="library-add" size={18} color="#2563EB" />
              <Text style={styles.secondaryButtonText}>New</Text>
            </TouchableOpacity>
          </View>

          {loading && <Text style={styles.mutedText}>Loading workspace...</Text>}

          {!loading && activeProjects.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No projects yet</Text>
              <Text style={styles.mutedText}>Create a project from a built-in template to start collecting records.</Text>
            </View>
          )}

          {activeProjects.map((project) => {
            const template = templates.find((item) => item.id === project.templateIds[0]);
            const count = records.filter((record) => record.projectId === project.id).length;
            const selected = selectedProject?.id === project.id;

            return (
              <TouchableOpacity
                key={project.id}
                style={[styles.projectRow, selected && styles.projectRowSelected]}
                onPress={() => setSelectedProjectId(project.id)}
              >
                <View style={styles.projectIcon}>
                  <Icon name="folder" size={22} color={selected ? '#FFFFFF' : '#2563EB'} />
                </View>
                <View style={styles.projectText}>
                  <Text style={styles.recordTitle}>{project.name}</Text>
                  <Text style={styles.mutedText}>{template?.name || 'Template'} - {count} records</Text>
                </View>
                <Text style={styles.dateText}>{formatDate(project.updatedAt)}</Text>
              </TouchableOpacity>
            );
          })}
        </ThemedView>

        {selectedProject && selectedProjectTemplate && (
          <ThemedView style={styles.section}>
            <View style={styles.sectionHeader}>
              <View>
                <ThemedText type="subtitle">{selectedProject.name}</ThemedText>
                <Text style={styles.mutedText}>{selectedProjectTemplate.name}</Text>
              </View>
              <TouchableOpacity style={styles.primaryButton} onPress={openRecordModal}>
                <Icon name="post-add" size={18} color="#FFFFFF" />
                <Text style={styles.primaryButtonText}>Collect</Text>
              </TouchableOpacity>
            </View>

            {projectRecords.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No records collected</Text>
                <Text style={styles.mutedText}>Use Collect to add your first structured record.</Text>
              </View>
            ) : (
              projectRecords.slice(0, 6).map((record) => (
                <View key={record.id} style={styles.recordRow}>
                  <View style={styles.recordText}>
                    <Text style={styles.recordTitle}>{getRecordTitle(record, selectedProjectTemplate)}</Text>
                    <Text style={styles.mutedText}>{record.status.replace('_', ' ')} - {formatDate(record.updatedAt)}</Text>
                  </View>
                  <View style={styles.recordPreview}>
                    {selectedProjectTemplate.fields.slice(0, 2).map((field) => (
                      <Text key={field.id} style={styles.previewText}>{field.label}: {valueToText(record.values[field.key])}</Text>
                    ))}
                  </View>
                </View>
              ))
            )}
          </ThemedView>
        )}

        {renderTemplateAdmin()}
      </ScrollView>

      <Modal visible={showProjectModal} transparent animationType="slide" onRequestClose={() => setShowProjectModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Create Project</Text>
              <TouchableOpacity onPress={() => setShowProjectModal(false)}>
                <Icon name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <Text style={styles.fieldLabel}>Project name</Text>
            <TextInput
              value={projectName}
              onChangeText={setProjectName}
              placeholder="Warehouse audit"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>Description</Text>
            <TextInput
              value={projectDescription}
              onChangeText={setProjectDescription}
              placeholder="Optional context"
              style={[styles.input, styles.longInput]}
              multiline
            />

            <Text style={styles.fieldLabel}>Template</Text>
            <View style={styles.templatePicker}>
              {templates.map((template) => {
                const selected = templateForNewProject?.id === template.id;
                return (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.templateOption, selected && styles.templateOptionSelected]}
                    onPress={() => setSelectedTemplateId(template.id)}
                  >
                    <Text style={styles.recordTitle}>{template.name}</Text>
                    <Text style={styles.mutedText}>{template.description}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <TouchableOpacity style={styles.fullPrimaryButton} onPress={handleCreateProject}>
              <Text style={styles.primaryButtonText}>Create Project</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showRecordModal} transparent animationType="slide" onRequestClose={() => setShowRecordModal(false)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Collect Record</Text>
                <Text style={styles.mutedText}>{selectedProjectTemplate?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowRecordModal(false)}>
                <Icon name="close" size={22} color="#374151" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.recordForm} showsVerticalScrollIndicator={false}>
              {selectedProjectTemplate?.fields.map(renderField)}
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.draftButton} onPress={() => handleSaveRecord('draft')}>
                <Text style={styles.draftButtonText}>Save Draft</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={() => handleSaveRecord('submitted')}>
                <Text style={styles.primaryButtonText}>Submit</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    gap: 14,
  },
  header: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mutedText: {
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  primaryIconButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: 'transparent',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
  },
  statValue: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  statLabel: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 2,
  },
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 14,
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  emptyState: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 16,
    gap: 4,
  },
  emptyTitle: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  projectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
  },
  projectRowSelected: {
    borderColor: '#93C5FD',
    backgroundColor: '#EFF6FF',
  },
  projectIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DBEAFE',
  },
  projectText: {
    flex: 1,
  },
  dateText: {
    color: '#64748B',
    fontSize: 12,
  },
  recordRow: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  recordText: {
    gap: 2,
  },
  recordTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
  },
  recordPreview: {
    gap: 2,
  },
  previewText: {
    color: '#475569',
    fontSize: 12,
  },
  adminPanel: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    padding: 14,
    gap: 10,
  },
  templateAdminRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    gap: 12,
  },
  templateAdminText: {
    flex: 1,
  },
  templateBadge: {
    color: '#1D4ED8',
    backgroundColor: '#DBEAFE',
    borderRadius: 8,
    overflow: 'hidden',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 18,
    maxHeight: '88%',
    gap: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modalTitle: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  fieldBlock: {
    gap: 6,
    marginBottom: 12,
  },
  fieldLabel: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    minHeight: 46,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    color: '#0F172A',
    fontSize: 15,
    backgroundColor: '#FFFFFF',
  },
  longInput: {
    minHeight: 84,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  templatePicker: {
    gap: 8,
  },
  templateOption: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    gap: 4,
  },
  templateOptionSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  fullPrimaryButton: {
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 13,
  },
  recordForm: {
    maxHeight: 420,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  optionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  optionChip: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  optionChipSelected: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
  },
  optionText: {
    color: '#334155',
    fontSize: 13,
    fontWeight: '700',
  },
  optionTextSelected: {
    color: '#1D4ED8',
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 6,
  },
  draftButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 13,
  },
  draftButtonText: {
    color: '#334155',
    fontSize: 14,
    fontWeight: '800',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#2563EB',
    borderRadius: 8,
    paddingVertical: 13,
  },
});
