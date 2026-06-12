import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useAppTheme } from '@/hooks/useAppTheme';
import { CollectionScreen } from '@/src/screens/CollectionScreen';
import { ProjectStorage, RecordStorage, StorageInitializer } from '@/src/services/storage-exports';
import { type DataProject, type ProjectStatus } from '@/src/types/data-collection';

const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

type CollectMode = 'projects' | 'collection';

export default function ProjectsListScreen() {
  const router = useRouter();
  const colorScheme = useAppTheme();
  const colors = Colors[colorScheme];
  const mutedText = colorScheme === 'dark' ? '#D6D3D1' : '#78716C';
  const subtleText = colorScheme === 'dark' ? '#A8A29E' : '#57534E';
  const controlBg = colorScheme === 'dark' ? '#1C1917' : '#FEF7F0';
  const [projects, setProjects] = useState<DataProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<DataProject[]>([]);
  const [recordCounts, setRecordCounts] = useState<Record<string, number>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterActive, setFilterActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeMode, setActiveMode] = useState<CollectMode>('projects');
  const projectStorage = useMemo(() => new ProjectStorage(), []);
  const recordStorage = useMemo(() => new RecordStorage(), []);
  const storageInitializer = useMemo(() => new StorageInitializer(), []);

  const filterProjects = useCallback((sourceProjects: DataProject[], query: string, showActiveOnly: boolean) => {
    let filtered = [...sourceProjects];

    if (showActiveOnly) {
      filtered = filtered.filter(project => project.status === 'active');
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(project =>
        project.name.toLowerCase().includes(lowerQuery) ||
        project.description?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredProjects(filtered);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const [allProjects, allRecords] = await Promise.all([
        projectStorage.getAll(),
        recordStorage.getAll(),
      ]);
      const nextCounts = allRecords.reduce<Record<string, number>>((counts, record) => {
        counts[record.projectId] = (counts[record.projectId] || 0) + 1;
        return counts;
      }, {});

      setProjects(allProjects);
      setRecordCounts(nextCounts);
      filterProjects(allProjects, searchQuery, filterActive);
    } catch (error) {
      console.error('Error fetching projects:', error);
      Alert.alert('Could not load projects', 'Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filterActive, filterProjects, projectStorage, recordStorage, searchQuery]);

  React.useEffect(() => {
    async function init() {
      try {
        await storageInitializer.init();
        fetchProjects();
      } catch (error) {
        console.error('Error initializing storage:', error);
        Alert.alert('Storage unavailable', 'Project storage could not be initialized.');
        setIsLoading(false);
      }
    }

    init();
  }, [fetchProjects, storageInitializer]);

  React.useEffect(() => {
    filterProjects(projects, searchQuery, filterActive);
  }, [searchQuery, filterActive, filterProjects, projects]);

  const activeProjects = projects.filter(project => project.status === 'active').length;
  const archivedProjects = projects.filter(project => project.status === 'archived').length;
  const totalRecords = Object.values(recordCounts).reduce((sum, count) => sum + count, 0);

  const openCreateModal = () => {
    setNewProjectName('');
    setNewProjectDescription('');
    setShowCreateModal(true);
  };

  const handleCreateProject = async () => {
    const trimmedName = newProjectName.trim();
    const trimmedDescription = newProjectDescription.trim();

    if (!trimmedName) {
      Alert.alert('Project name required', 'Enter a name so this project is easy to find later.');
      return;
    }

    try {
      setIsCreating(true);
      const newProject = await projectStorage.create(
        trimmedName,
        trimmedDescription || 'Untitled data collection project'
      );

      await fetchProjects();
      setShowCreateModal(false);

      router.push({
        pathname: '/data-collection/projects/[id]/detail',
        params: { id: newProject.id },
      });
    } catch (error) {
      console.error('Error creating project:', error);
      Alert.alert('Could not create project', 'Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleMoveProject = async (project: DataProject, nextStatus: ProjectStatus) => {
    const action = nextStatus === 'archived' ? 'Archive' : 'Restore';
    Alert.alert(
      `${action} project`,
      `${action} "${project.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: action,
          onPress: async () => {
            try {
              await projectStorage.moveStatus(project.id, nextStatus);
              fetchProjects();
            } catch (error) {
              console.error('Error moving project:', error);
              Alert.alert(`Could not ${action.toLowerCase()} project`, 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleDeleteProject = async (project: DataProject) => {
    Alert.alert(
      'Delete project',
      `Delete "${project.name}" and its records? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recordStorage.deleteByProject(project.id);
              await projectStorage.delete(project.id);
              fetchProjects();
            } catch (error) {
              console.error('Error deleting project:', error);
              Alert.alert('Could not delete project', 'Please try again.');
            }
          },
        },
      ]
    );
  };

  const renderProjectItem = ({ item }: { item: DataProject }) => {
    const isArchived = item.status === 'archived';
    const projectRecordCount = recordCounts[item.id] || 0;

    return (
      <TouchableOpacity
        style={[styles.projectCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() =>
          router.push({
            pathname: '/data-collection/projects/[id]/detail',
            params: { id: item.id },
          })
        }
        activeOpacity={0.82}
      >
        <View style={styles.projectHeader}>
          <View style={styles.projectTitleBlock}>
            <Text style={[styles.projectName, { color: colors.text }]} numberOfLines={2}>{item.name}</Text>
            <Text style={[styles.projectUpdated, { color: subtleText }]}>Updated {formatDate(item.updatedAt)}</Text>
          </View>
          <View style={[
            styles.statusPill,
            isArchived ? styles.statusArchived : { backgroundColor: `${colors.tint}18` },
          ]}>
            <Ionicons
              name={isArchived ? 'archive-outline' : 'radio-button-on'}
              size={13}
              color={isArchived ? subtleText : colors.tint}
            />
            <Text style={[styles.statusText, { color: isArchived ? subtleText : colors.tint }]}>
              {item.status}
            </Text>
          </View>
        </View>

        <Text style={[styles.projectDescription, { color: mutedText }]} numberOfLines={2}>
          {item.description || 'No description added yet.'}
        </Text>

        <View style={styles.projectMetaRow}>
          <View style={[styles.metaChip, { backgroundColor: controlBg }]}>
            <Ionicons name="document-text-outline" size={16} color={colors.tint} />
            <Text style={[styles.metaChipText, { color: colors.text }]}>
              {projectRecordCount} {projectRecordCount === 1 ? 'record' : 'records'}
            </Text>
          </View>
          <View style={[styles.metaChip, { backgroundColor: controlBg }]}>
            <Ionicons name="layers-outline" size={16} color={colors.warning} />
            <Text style={[styles.metaChipText, { color: colors.text }]}>
              {item.templateIds?.length || 0} templates
            </Text>
          </View>
        </View>

        <View style={styles.actionsContainer}>
          {isArchived ? (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: controlBg }]}
              onPress={() => handleMoveProject(item, 'active')}
            >
              <Ionicons name="refresh" size={17} color={colors.tint} />
              <Text style={[styles.secondaryButtonText, { color: colors.tint }]}>Restore</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.secondaryButton, { backgroundColor: controlBg }]}
              onPress={() => handleMoveProject(item, 'archived')}
            >
              <Ionicons name="archive-outline" size={17} color={subtleText} />
              <Text style={[styles.secondaryButtonText, { color: subtleText }]}>Archive</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.deleteButton}
            onPress={() => handleDeleteProject(item)}
          >
            <Ionicons name="trash-outline" size={17} color={colors.error} />
            <Text style={[styles.deleteButtonText, { color: colors.error }]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  if (activeMode === 'collection') {
    return (
      <ThemedView style={styles.container}>
        <Stack.Screen
          options={{
            title: 'Collect',
            headerLeft: () => null,
          }}
        />
        <View style={styles.modeSwitcherRow}>
          <TouchableOpacity
            style={[
              styles.modeChip,
              { backgroundColor: controlBg, borderColor: colors.border },
              styles.modeChipInactive,
            ]}
            onPress={() => setActiveMode('projects')}
          >
            <Ionicons name="layers-outline" size={16} color={mutedText} />
            <Text style={[styles.modeChipText, { color: mutedText }]}>Projects</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.modeChip,
              { backgroundColor: `${colors.tint}16`, borderColor: colors.tint },
            ]}
            disabled
          >
            <Ionicons name="albums" size={16} color={colors.tint} />
            <Text style={[styles.modeChipText, { color: colors.tint }]}>Collection</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.inlineModeContent}>
          <CollectionScreen />
        </View>
      </ThemedView>
    );
  }

  const renderHeader = () => (
    <View style={styles.headerContent}>
      <View style={[styles.hero, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={[styles.heroIcon, { backgroundColor: `${colors.tint}16` }]}>
          <Ionicons name="folder-open-outline" size={28} color={colors.tint} />
        </View>
        <View style={styles.heroTextBlock}>
          <Text style={[styles.heroTitle, { color: colors.text }]}>Collection Projects</Text>
          <Text style={[styles.heroSubtitle, { color: mutedText }]}>
            Organize records by workflow, audit, inventory set, or research batch.
          </Text>
        </View>
      </View>

      <View style={styles.modeSwitcherRow}>
        <TouchableOpacity
          style={[
            styles.modeChip,
            { backgroundColor: `${colors.tint}16`, borderColor: colors.tint },
          ]}
          disabled
        >
          <Ionicons name="layers" size={16} color={colors.tint} />
          <Text style={[styles.modeChipText, { color: colors.tint }]}>Projects</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.modeChip,
            { backgroundColor: controlBg, borderColor: colors.border },
          ]}
          onPress={() => setActiveMode('collection')}
        >
          <Ionicons name="albums-outline" size={16} color={mutedText} />
          <Text style={[styles.modeChipText, { color: mutedText }]}>Collection</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.heroAction, { backgroundColor: colors.tint }]}
        onPress={openCreateModal}
      >
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.heroActionText}>New Project</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{activeProjects}</Text>
          <Text style={[styles.statLabel, { color: mutedText }]}>Active</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{totalRecords}</Text>
          <Text style={[styles.statLabel, { color: mutedText }]}>Records</Text>
        </View>
        <View style={[styles.statTile, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.text }]}>{archivedProjects}</Text>
          <Text style={[styles.statLabel, { color: mutedText }]}>Archived</Text>
        </View>
      </View>

      <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name="search" size={20} color={mutedText} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder="Search projects"
          placeholderTextColor={mutedText}
          value={searchQuery}
          onChangeText={setSearchQuery}
          returnKeyType="search"
        />
        {searchQuery ? (
          <TouchableOpacity onPress={() => setSearchQuery('')} style={styles.clearSearchButton}>
            <Ionicons name="close" size={18} color={mutedText} />
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={[styles.segmentedControl, { backgroundColor: controlBg }]}>
        {[
          { activeOnly: true, label: 'Active' },
          { activeOnly: false, label: 'All' },
        ].map(option => {
          const selected = filterActive === option.activeOnly;
          return (
            <TouchableOpacity
              key={option.label}
              style={[styles.segmentButton, selected && { backgroundColor: colors.surface }]}
              onPress={() => setFilterActive(option.activeOnly)}
            >
              <Text style={[styles.segmentText, { color: selected ? colors.tint : mutedText }]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );

  const renderEmpty = () => {
    const noProjects = projects.length === 0;

    return (
      <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <Ionicons name={noProjects ? 'folder-open-outline' : 'search-outline'} size={44} color={mutedText} />
        <Text style={[styles.emptyStateTitle, { color: colors.text }]}>
          {noProjects ? 'No projects yet' : 'No projects match'}
        </Text>
        <Text style={[styles.emptyStateDescription, { color: mutedText }]}>
          {noProjects
            ? 'Create a project to group templates, records, and field work in one place.'
            : 'Try another search term or switch to All projects.'}
        </Text>
        {noProjects && (
          <TouchableOpacity
            style={[styles.emptyStateButton, { backgroundColor: colors.tint }]}
            onPress={openCreateModal}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.emptyStateButtonText}>Create Project</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen
        options={{
          title: 'Collect',
          headerLeft: () => null,
        }}
      />

      <FlatList
        data={filteredProjects}
        renderItem={renderProjectItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={isLoading ? null : renderEmpty}
        refreshing={isLoading}
        onRefresh={fetchProjects}
        showsVerticalScrollIndicator={false}
      />

      <TouchableOpacity
        style={[styles.fab, { backgroundColor: colors.tint, shadowColor: colors.tint }]}
        onPress={openCreateModal}
        accessibilityLabel="Create project"
      >
        <Ionicons name="add" size={30} color="#FFFFFF" />
      </TouchableOpacity>

      <Modal visible={showCreateModal} animationType="fade" transparent onRequestClose={() => setShowCreateModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>Create Project</Text>
            <Text style={[styles.modalSubtitle, { color: mutedText }]}>
              Start with a clear project name. You can add templates and records next.
            </Text>

            <TextInput
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Project name"
              placeholderTextColor={mutedText}
              style={[styles.inputPlaceholder, { backgroundColor: controlBg, color: colors.text }]}
              autoFocus
            />

            <TextInput
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              placeholder="Description (optional)"
              placeholderTextColor={mutedText}
              multiline
              style={[styles.inputPlaceholder, styles.descriptionInput, { backgroundColor: controlBg, color: colors.text }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: controlBg }]}
                onPress={() => setShowCreateModal(false)}
                disabled={isCreating}
              >
                <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: colors.tint }, isCreating && styles.disabledButton]}
                onPress={handleCreateProject}
                disabled={isCreating}
              >
                <Text style={styles.createButtonText}>{isCreating ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    padding: 16,
    paddingBottom: 104,
  },
  headerContent: {
    gap: 12,
    marginBottom: 14,
  },
  modeSwitcherRow: {
    flexDirection: 'row',
    gap: 8,
  },
  modeChip: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
    minHeight: 40,
    paddingHorizontal: 12,
  },
  modeChipInactive: {
    opacity: 0.82,
  },
  modeChipText: {
    fontSize: 13,
    fontWeight: '800',
  },
  hero: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 14,
  },
  heroIcon: {
    alignItems: 'center',
    borderRadius: 8,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  heroTextBlock: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  heroSubtitle: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3,
  },
  heroAction: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 4,
    minHeight: 40,
    paddingHorizontal: 12,
  },
  heroActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  inlineModeContent: {
    marginTop: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  statTile: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    padding: 12,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
  },
  searchContainer: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    minHeight: 48,
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
    paddingVertical: 10,
  },
  clearSearchButton: {
    padding: 6,
  },
  segmentedControl: {
    borderRadius: 8,
    flexDirection: 'row',
    padding: 4,
  },
  segmentButton: {
    alignItems: 'center',
    borderRadius: 6,
    flex: 1,
    paddingVertical: 10,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  projectCard: {
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14,
  },
  projectHeader: {
    alignItems: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 8,
  },
  projectTitleBlock: {
    flex: 1,
  },
  projectName: {
    fontSize: 17,
    fontWeight: '800',
  },
  projectUpdated: {
    fontSize: 12,
    marginTop: 3,
  },
  statusPill: {
    alignItems: 'center',
    borderRadius: 999,
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  statusArchived: {
    backgroundColor: 'rgba(120, 113, 108, 0.14)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  projectDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  projectMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  metaChip: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  metaChipText: {
    fontSize: 12,
    fontWeight: '700',
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'flex-end',
    marginTop: 14,
  },
  secondaryButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  secondaryButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  deleteButton: {
    alignItems: 'center',
    backgroundColor: 'rgba(220, 38, 38, 0.08)',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 5,
    minHeight: 38,
    paddingHorizontal: 12,
  },
  deleteButtonText: {
    fontSize: 13,
    fontWeight: '800',
  },
  emptyState: {
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 34,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '800',
    marginTop: 12,
  },
  emptyStateDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
    textAlign: 'center',
  },
  emptyStateButton: {
    alignItems: 'center',
    borderRadius: 8,
    flexDirection: 'row',
    gap: 6,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 11,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  fab: {
    alignItems: 'center',
    borderRadius: 28,
    bottom: 24,
    elevation: 8,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: 24,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.28,
    shadowRadius: 6,
    width: 56,
  },
  modalOverlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    borderRadius: 8,
    maxWidth: 500,
    padding: 22,
    width: '100%',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 16,
    marginTop: 4,
  },
  inputPlaceholder: {
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 12,
    minHeight: 46,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  descriptionInput: {
    minHeight: 88,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
    marginTop: 4,
  },
  modalButton: {
    alignItems: 'center',
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    minHeight: 46,
    paddingHorizontal: 18,
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '800',
  },
  createButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.7,
  },
});
