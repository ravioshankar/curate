import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useRouter } from 'expo-router';
import { ProjectStorage, StorageInitializer } from '@/src/services/storage-exports';
import { type DataProject } from '@/src/types/data-collection';

export default function ProjectsListScreen() {
  const router = useRouter();
  const [projects, setProjects] = useState<DataProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<DataProject[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [filterActive, setFilterActive] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const projectStorage = useMemo(() => new ProjectStorage(), []);
  const storageInitializer = useMemo(() => new StorageInitializer(), []);

  const filterProjects = useCallback((sourceProjects: DataProject[], query: string, showActiveOnly: boolean) => {
    let filtered = [...sourceProjects];

    if (showActiveOnly) {
      filtered = filtered.filter(p => p.status === 'active');
    }

    if (query.trim()) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.description?.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredProjects(filtered);
  }, []);

  const fetchProjects = useCallback(async () => {
    try {
      const allProjects = await projectStorage.getAll();
      setProjects(allProjects);
      filterProjects(allProjects, searchQuery, filterActive);
    } catch (error) {
      console.error('Error fetching projects:', error);
    }
  }, [filterActive, filterProjects, projectStorage, searchQuery]);

  React.useEffect(() => {
    async function init() {
      try {
        await storageInitializer.init();
        fetchProjects();
      } catch (error) {
        console.error('Error initializing storage:', error);
      }
    }

    init();
  }, [fetchProjects, storageInitializer]);

  React.useEffect(() => {
    filterProjects(projects, searchQuery, filterActive);
  }, [searchQuery, filterActive, filterProjects, projects]);

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
      setNewProjectName('');
      setNewProjectDescription('');
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

  const handleDeleteProject = async (projectId: string, projectName: string) => {
    Alert.alert(
      'Delete project',
      `Delete "${projectName}" and its records? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await projectStorage.delete(projectId);
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
    return (
      <TouchableOpacity
        style={styles.projectCard}
        onPress={() =>
          router.push({
            pathname: '/data-collection/projects/[id]/detail',
            params: { id: item.id },
          })
        }
      >
        <View style={styles.projectHeader}>
          <Text style={styles.projectName}>{item.name}</Text>
          <Text style={[styles.statusText, item.status === 'active' ? styles.statusActive : styles.statusArchived]}>
            {item.status}
          </Text>
        </View>

        {item.description && (
          <Text style={styles.projectDescription}>{item.description}</Text>
        )}

        <Text style={styles.projectTemplates}>
          Templates: {item.templateIds?.length || 0}
        </Text>

        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => {}} // Future: edit project
          >
            <Ionicons name="pencil" size={18} color="#666" />
            <Text style={styles.editButtonText}>Edit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.deleteButton, item.status === 'archived' && styles.archiveHighlight]}
            onPress={() => handleDeleteProject(item.id, item.name)}
          >
            <Ionicons name="trash" size={18} color="#e74c3c" />
            {item.status === 'archived' && (
              <Text style={[styles.deleteButtonText, styles.archiveHighlightText]}>
                Restore
              </Text>
            )}
            <Text style={styles.deleteButtonText}>Delete</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: 'My Projects',
          headerLeft: () => null, // Will be handled by tab layout
        }}
      />

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search projects..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Filter Toggle */}
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => setFilterActive(!filterActive)}
      >
        <Ionicons
          name={filterActive ? 'radio-button-on' : 'radio-button-off'}
          size={24}
          color="#666"
        />
        <Text style={styles.filterButtonText}>
          {filterActive ? 'Show Active Only' : 'Show All Projects'}
        </Text>
      </TouchableOpacity>

      {/* Empty State */}
      {filteredProjects.length === 0 && projects.length === 0 && (
        <View style={styles.emptyState}>
          <Ionicons name="folder-open" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Projects Yet</Text>
          <Text style={styles.emptyStateDescription}>
            Create a project to group templates, records, and field work in one place.
          </Text>
          <TouchableOpacity
            style={styles.emptyStateButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Ionicons name="add" size={18} color="#fff" />
            <Text style={styles.emptyStateButtonText}>Create Project</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Project List */}
      {filteredProjects.length === 0 && projects.length > 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="search" size={64} color="#ccc" />
          <Text style={styles.emptyStateTitle}>No Projects Match</Text>
          <Text style={styles.emptyStateDescription}>
            Try adjusting your search or filter.
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>

      {/* Create Project Modal (Placeholder) */}
      {showCreateModal && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Create New Project</Text>

            <TextInput
              value={newProjectName}
              onChangeText={setNewProjectName}
              placeholder="Project Name"
              placeholderTextColor="#999"
              style={styles.inputPlaceholder}
            />

            <TextInput
              value={newProjectDescription}
              onChangeText={setNewProjectDescription}
              placeholder="Project Description (optional)"
              placeholderTextColor="#999"
              multiline
              style={[styles.inputPlaceholder, { minHeight: 80 }]}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: '#f5f5f5' }]}
                onPress={() => setShowCreateModal(false)}
              >
                <Text style={styles.modalButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleCreateProject}
                disabled={isCreating}
              >
                <Text style={styles.modalButtonText}>{isCreating ? 'Creating...' : 'Create'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  projectCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderColor: '#3498db',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
    textTransform: 'capitalize',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  statusActive: {
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
  },
  statusArchived: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  projectDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  projectTemplates: {
    fontSize: 13,
    color: '#999',
    marginBottom: 12,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff0f0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  archiveHighlight: {
    backgroundColor: '#fff8e1',
    borderLeftWidth: 2,
    borderLeftColor: '#ff9800',
  },
  deleteButtonText: {
    color: '#e74c3c',
    fontSize: 14,
    fontWeight: '500',
  },
  archiveHighlightText: {
    color: '#ff9800',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptyStateDescription: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  emptyStateButton: {
    alignItems: 'center',
    backgroundColor: '#3498db',
    borderRadius: 10,
    flexDirection: 'row',
    gap: 6,
    marginTop: 18,
    paddingHorizontal: 18,
    paddingVertical: 12,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3498db',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    maxWidth: 500,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  inputPlaceholder: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#666',
    minHeight: 42,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#3498db',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
});
