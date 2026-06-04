import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { projectStorage, templateStorage, StorageInitializer } from '@/src/services/storage-exports';

const { width } = Dimensions.get('window');

export default function TemplatesScreen() {
  const [templates, setTemplates] = useState([]);
  const [filterCategory, setFilterCategory] = useState('all');

  React.useEffect(() => {
    async function init() {
      try {
        await StorageInitializer.init();
        
        // Load all templates
        const allTemplates = await templateStorage.getAll();
        
        // Group by category
        const categories: Record<string, string[]> = {};
        
        for (const template of allTemplates) {
          const category = template.category || 'Custom';
          
          if (!categories[category]) {
            categories[category] = [];
          }
          
          categories[category].push(template);
        }
        
        setTemplates(categories);
      } catch (error) {
        console.error('Error loading templates:', error);
      }
    }
    
    init();
  }, []);

  const getCategoryName = (categoryId: string): string => {
    const nameMap: Record<string, string> = {
      'inventory': 'Cataloging',
      'inspection': 'Inspections',
      'audit': 'Audits',
      'maintenance': 'Maintenance',
      'research': 'Research',
    };
    
    return nameMap[categoryId] || categoryId;
  };

  const getTemplateName = (templateId: string): string => {
    const templateMap: Record<string, string> = {
      'tmpl_inventory_default': 'Inventory Item',
      'tmpl_inspection_default': 'Inspection Checklist',
      'tmpl_audit_default': 'Asset Audit',
      'tmpl_maintenance_default': 'Maintenance Log',
      'tmpl_research_default': 'Research Observation',
    };
    
    return templateMap[templateId] || 'Custom Template';
  };

  const getTemplateDescription = (template: any): string => {
    return template.description || '';
  };

  const renderTemplateCard = ({ item }: { item: any }) => {
    const isBuiltIn = item.isBuiltIn ?? false;
    
    return (
      <TouchableOpacity
        style={[styles.templateCard, isBuiltIn && styles.builtInIndicator]}
        onPress={() => {}} // Future: use or edit template
      >
        <View style={styles.templateHeader}>
          <Text style={styles.templateName}>{getTemplateName(item.id)}</Text>
          
          <View style={styles.categoryBadge}>
            <Ionicons name="pricetag" size={12} color="#666" />
            <Text style={styles.categoryBadgeText}>{getCategoryName(item.category || 'custom')}</Text>
          </View>
        </View>
        
        {item.description && (
          <Text style={styles.templateDescription}>
            {getTemplateDescription(item)}
          </Text>
        )}
        
        <Text style={styles.templateFields}>
          {item.fields?.length || 0} fields • 
          v{item.version || 1}
        </Text>

        {isBuiltIn && (
          <View style={styles.builtInBadge}>
            <Ionicons name="sparkles" size={14} color="#ffd700" />
            <Text style={styles.builtInText}>Built-in</Text>
          </View>
        )}

        <TouchableOpacity 
          style={styles.useButton}
          onPress={() => {}} // Future: use this template
        >
          <Text style={styles.useButtonText}>Use This Template</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.pageTitle}>Data Templates</Text>
        
        {/* Category Filter */}
        <View style={styles.filterChipsContainer}>
          {['all', 'cataloging', 'inspections', 'audits', 'maintenance', 'research'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterChip,
                filterCategory === filter && styles.filterChipActive
              ]}
              onPress={() => setFilterCategory(filter)}
            >
              <Text 
                style={[
                  styles.filterChipText,
                  filterCategory === filter && styles.filterChipTextActive
                ]}
              >
                {filter === 'all' ? 'All' : getCategoryName(filter)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Template Grid */}
      <FlatList
        data={Object.values(templates).flat()}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnSpacing={16}
        contentContainerStyle={styles.gridContainer}
        renderItem={renderTemplateCard}
        scrollEnabled={false} // Future: enable scrolling
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => {}} // Future: create new template
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  headerContainer: {
    backgroundColor: '#fff',
    padding: 24,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  filterChipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  filterChipActive: {
    backgroundColor: '#3498db',
  },
  filterChipText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  gridContainer: {
    padding: 16,
  },
  templateCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  builtInIndicator: {
    borderTopWidth: 1,
    borderTopColor: '#ffd700',
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 12,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#e8f5e9',
  },
  categoryBadgeText: {
    fontSize: 12,
    color: '#2e7d32',
    fontWeight: '500',
    marginLeft: 4,
  },
  templateDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginBottom: 8,
  },
  templateFields: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  builtInBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#fff8e1',
    marginBottom: 8,
  },
  builtInText: {
    fontSize: 11,
    color: '#e65100',
    fontWeight: '500',
    marginLeft: 4,
  },
  useButton: {
    width: '100%',
    backgroundColor: '#3498db',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  useButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
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
});
