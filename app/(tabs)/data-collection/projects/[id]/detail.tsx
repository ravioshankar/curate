import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

import { ProjectStorage } from '@/src/services/project-storage';
import { RecordStorage } from '@/src/services/record-storage';
import { type DataProject, type DataRecord } from '@/src/types/data-collection';

const getRecordTitle = (record: DataRecord) =>
  typeof record.values.name === 'string' && record.values.name.trim()
    ? record.values.name
    : 'Untitled record';

const getRecordDescription = (record: DataRecord) =>
  typeof record.values.description === 'string' ? record.values.description : '';

const getRecordValue = (record: DataRecord) =>
  typeof record.values.value === 'number' ? record.values.value : undefined;

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const projectId = Array.isArray(id) ? id[0] : id;
  const projectStorage = useMemo(() => new ProjectStorage(), []);
  const recordStorage = useMemo(() => new RecordStorage(), []);

  const [project, setProject] = useState<DataProject | null>(null);
  const [records, setRecords] = useState<DataRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'value'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const loadProjectData = useCallback(async () => {
    if (!projectId) return;

    try {
      setLoading(true);
      const projectData = await projectStorage.getById(projectId);
      setProject(projectData);

      const allRecords = await recordStorage.getAll(projectId);

      let filteredRecords = allRecords;
      if (searchQuery) {
        const lowerSearchQuery = searchQuery.toLowerCase();
        filteredRecords = allRecords.filter(record =>
          getRecordTitle(record).toLowerCase().includes(lowerSearchQuery) ||
          getRecordDescription(record).toLowerCase().includes(lowerSearchQuery)
        );
      }

      const sortedRecords = [...filteredRecords].sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return sortOrder === 'asc'
              ? getRecordTitle(a).localeCompare(getRecordTitle(b))
              : getRecordTitle(b).localeCompare(getRecordTitle(a));
          case 'value':
            return sortOrder === 'asc'
              ? (getRecordValue(a) ?? 0) - (getRecordValue(b) ?? 0)
              : (getRecordValue(b) ?? 0) - (getRecordValue(a) ?? 0);
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
  }, [projectId, projectStorage, recordStorage, searchQuery, sortBy, sortOrder]);

  useEffect(() => {
    loadProjectData();
  }, [loadProjectData]);

  const handleCreateRecord = async () => {
    if (!projectId) return;

    router.push({
      pathname: '/data-collection/create-record',
      params: { projectId },
    });
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
        <Text style={styles.recordName}>{getRecordTitle(item)}</Text>
        <View style={styles.badgesContainer}>
          {item.status && (
            <View style={[styles.badge, item.status === 'submitted' || item.status === 'approved' ? styles.badgeCompleted : styles.badgePending]}>
              <Text style={styles.badgeText}>{item.status}</Text>
            </View>
          )}
        </View>
      </View>

      {getRecordDescription(item) ? (
        <Text style={styles.recordDescription} numberOfLines={2}>
          {getRecordDescription(item)}
        </Text>
      ) : null}

      {getRecordValue(item) !== undefined ? (
        <Text style={styles.recordValue}>{getRecordValue(item)}</Text>
      ) : null}

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
          Records: {records.length} • Templates: {project.templateIds.length}
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
            name={sortOrder === 'desc' ? 'swap-vertical' : 'swap-vertical-outline'}
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
