import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

// Import storage services
import { projectStorage } from '@/src/services/project-storage';
import { recordStorage } from '@/src/services/record-storage';
import { type DataRecord } from '@/src/types/data-collection';

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  
  // State
  const [project, setProject] = useState<any>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  useEffect(() => {
    loadProjectData();
  }, [id]);

  const loadProjectData = async () => {
    try {
      // Get project details
      const projectData = await projectStorage.getById(id as string);
      setProject(projectData);

      // Get all records for this project
      const allRecords = await recordStorage.getByProjectId(id as string);
      
      // Filter by search query if provided
      let filteredRecords = allRecords;
      if (searchQuery) {
        filteredRecords = allRecords.filter(record => 
          record.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          record.description?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      // Sort records
      const sortedRecords = [...filteredRecords].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return sortOrder === 'asc' 
              ? a.name.localeCompare(b.name) 
              : b.name.localeCompare(a.name);
          case 'value':
            if (a.value && b.value) {
              return sortOrder === 'asc' ? a.value - b.value : b.value - a.value;
            }
            return 0;
          case 'date':
          default:
            return sortOrder === 'asc' 
              ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });

      setRecords(sortedRecords);
    } catch (error) {
      console.error('Error loading project data:', error);
      Alert.alert('Error', 'Failed to load project data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecord = async () => {
    try {
      // Navigate to create record screen (placeholder)
      router.push({
        pathname: '/data-collection/create-record',
        params: { projectId: id as string },
      });
      
      // Reload records after creation
      await loadProjectData();
    } catch (error) {
      console.error('Error creating record:', error);
      Alert.alert('Error', 'Failed to create record');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    Alert.alert(
      'Delete Record',
      'Are you sure you want to delete this record?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recordStorage.delete(recordId);
              Alert.alert('Success', 'Record deleted successfully');
              await loadProjectData();
            } catch (error) {
              console.error('Error deleting record:', error);
              Alert.alert('Error', 'Failed to delete record');
            }
          },
        },
      ]
    );
  };

  const renderRecordCard = ({ item }: { item: DataRecord }) => (
    <TouchableOpacity 
      style={styles.recordCard}
      onPress={() => router.push({
        pathname: '/data-collection/[recordId]/view',
        params: { recordId: item.id },
      })}
    >
      <View style={styles.recordHeader}>
        <Text style={styles.recordName}>{item.name || 'Untitled'}</Text>
        <View style={styles.badgesContainer}>
          {item.status && (
            <View style={[styles.badge, item.status === 'completed' ? styles.badgeCompleted : styles.badgePending]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          )}
        </View>
      </View>

      {item.description && (
        <Text style={styles.recordDescription} numberOfLines={2}>
          {item.description}
        </Text>
      )}

      {item.value !== undefined && item.value !== null && (
        <Text style={styles.recordValue}>{item.value}</Text>
      )}

      <View style={styles.recordFooter}>
        <Text style={styles.recordDate}>
          {new Date(item.createdAt).toLocaleDateString()}
        </Text>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            onPress={() => handleDeleteRecord(item.id)}
            style={styles.deleteButton}
          >
            <Ionicons name="trash-outline" size={16} color="#dc2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Stack.Screen options={{ title: 'Project Details' }} />
        <ActivityIndicator size="large" color="#3498db" />
        <Text>Loading project records...</Text>
      </View>
    );
  }

  if (!project) {
    return (
      <View style={{ flex: 1, padding: 24 }}>
        <Stack.Screen options={{ title: 'Project Details' }} />
        <Text style={styles.errorText}>Project not found</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen 
        options={{
          title: `${project.name} - Records`,
        }}
      />

      {/* Project Info Card */}
      <View style={styles.projectCard}>
        <Text style={styles.projectName}>{project.name}</Text>
        {project.description && (
          <Text style={styles.projectDescription}>{project.description}</Text>
        )}
        <View style={styles.divider} />
        <Text style={styles.statsText}>
          Records: {records.length} • 
          {project.templates && project.templates.length > 0 && (
            <span> Templates: {project.templates.length}</span>
          )}
        </Text>
      </View>

      {/* Search and Filter Bar */}
      <View style={styles.searchBarContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search records..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <View style={styles.filterButtons}>
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'date' ? styles.activeFilter : {}]}
            onPress={() => setSortBy('date')}
          >
            <Text style={styles.filterText}>Date</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'name' ? styles.activeFilter : {}]}
            onPress={() => setSortBy('name')}
          >
            <Text style={styles.filterText}>Name</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.filterButton, sortBy === 'value' ? styles.activeFilter : {}]}
            onPress={() => setSortBy('value')}
          >
            <Text style={styles.filterText}>Value</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={styles.sortOrderButton}
          onPress={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
        >
          <Ionicons 
            name={sortOrder === 'desc' ? 'arrow-up-down' : 'arrow-down-up'} 
            size={16} 
            color="#6b7280" 
          />
        </TouchableOpacity>
      </View>

      {/* Records List */}
      {records.length > 0 ? (
        <FlatList
          data={records}
          renderItem={renderRecordCard}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="document-text-outline" size={64} color="#9ca3af" />
          <Text style={styles.emptyText}>No records yet</Text>
          <Text style={styles.emptySubtext}>Create your first record to get started!</Text>
          
          <TouchableOpacity 
            style={styles.createButton}
            onPress={handleCreateRecord}
          >
            <Text style={styles.createButtonText}>+ Create Record</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Floating Action Button - only show if records exist */}
      {records.length > 0 && (
        <TouchableOpacity 
          style={styles.fab}
          onPress={handleCreateRecord}
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      )}
    </View>
  );
}

import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8fafc' },
  projectCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  projectName: { fontSize: 22, fontWeight: 'bold', color: '#1e293b', marginBottom: 8 },
  projectDescription: { fontSize: 14, color: '#64748b', lineHeight: 20 },
  divider: { height: 1, backgroundColor: '#e2e8f0', marginVertical: 12 },
  statsText: { fontSize: 14, color: '#94a3b8' },
  searchBarContainer: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, marginBottom: 12 },
  searchInput: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#334155',
  },
  filterButtons: { flexDirection: 'row', marginLeft: 8, gap: 6 },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: '#e2e8f0',
    borderRadius: 14,
  },
  activeFilter: { backgroundColor: '#3b82f6' },
  filterText: { color: 'white', fontSize: 12, fontWeight: '500' },
  sortOrderButton: { marginRight: 8, padding: 6, borderRadius: 8, marginLeft: 4 },
  listContent: { paddingBottom: 16 },
  recordCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  recordName: { fontSize: 16, fontWeight: '600', color: '#1e293b', flex: 1, marginRight: 8 },
  badgesContainer: { flexDirection: 'row' },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12, marginLeft: 4 },
  badgeCompleted: { backgroundColor: '#dcfce7', borderWidth: 1, borderColor: '#86efac' },
  badgePending: { backgroundColor: '#fef3c7', borderWidth: 1, borderColor: '#fcd34d' },
  badgeText: { color: '#065f46', fontSize: 11, fontWeight: '500' },
  recordDescription: { fontSize: 13, color: '#64748b', marginTop: 8, lineHeight: 18 },
  recordValue: { fontSize: 14, fontWeight: '600', color: '#3b82f6', marginTop: 6 },
  recordFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  recordDate: { fontSize: 12, color: '#94a3b8' },
  actionButtons: { flexDirection: 'row' },
  deleteButton: { padding: 6, borderRadius: 8 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 18, fontWeight: '600', color: '#6b7280', marginTop: 16, textAlign: 'center' },
  emptySubtext: { fontSize: 14, color: '#9ca3af', marginTop: 8, textAlign: 'center' },
  createButton: { 
    backgroundColor: '#3b82f6', 
    paddingHorizontal: 24, 
    paddingVertical: 12, 
    borderRadius: 12, 
    marginTop: 24,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  createButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  errorText: { textAlign: 'center', color: '#ef4444', marginTop: 40, fontSize: 16 }
});
