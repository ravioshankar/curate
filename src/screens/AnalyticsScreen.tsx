import { StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useSelector } from 'react-redux';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import { RootState } from '../store/store';
import { useThemeColor } from '@/hooks/useThemeColor';
import { getCategoryIcon } from '../utils/categoryIcons';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface AnalyticsScreenProps {
  onBack: () => void;
}

export function AnalyticsScreen({ onBack }: AnalyticsScreenProps) {
  const collection = useSelector((state: RootState) => state.collection.items);
  const formatPrice = (amount: number) => `$${amount.toFixed(2)}`;
  const tintColor = useThemeColor({}, 'tint');
  
  const totalValue = collection.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
  const expectedValue = collection.reduce((sum, item) => sum + (item.priceExpected || 0), 0);
  
  const categoryCounts = collection.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const categories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);
  
  const longUnusedItems = collection.filter(item => {
    const lastUsedDate = new Date(item.lastUsed);
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return lastUsedDate < oneYearAgo;
  });
  
  const topValueItems = [...collection]
    .filter(item => item.pricePaid)
    .sort((a, b) => (b.pricePaid || 0) - (a.pricePaid || 0))
    .slice(0, 3);

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Icon name="arrow-back" size={24} color={tintColor} />
        </TouchableOpacity>
        <ThemedText type="title">📊 Analytics Report</ThemedText>
        <ThemedView style={styles.placeholder} />
      </ThemedView>
      
      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Financial Overview */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>💰 Financial Overview</ThemedText>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Total Investment:</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#059669' }]}>{formatPrice(totalValue)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Expected Value:</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#d97706' }]}>{formatPrice(expectedValue)}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Net Change:</ThemedText>
            <ThemedText style={[styles.statValue, { color: expectedValue >= totalValue ? '#059669' : '#dc2626' }]}>
              {expectedValue >= totalValue ? '+' : ''}{formatPrice(expectedValue - totalValue)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Average Item Value:</ThemedText>
            <ThemedText style={styles.statValue}>{formatPrice(totalValue / (collection.length || 1))}</ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Collection Insights */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>📦 Collection Insights</ThemedText>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Total Items:</ThemedText>
            <ThemedText style={styles.statValue}>{collection.length}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Categories:</ThemedText>
            <ThemedText style={styles.statValue}>{categories.length}</ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Unused Items (>1yr):</ThemedText>
            <ThemedText style={[styles.statValue, { color: longUnusedItems.length > 0 ? '#dc2626' : '#059669' }]}>
              {longUnusedItems.length}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Items Used Recently:</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#059669' }]}>
              {collection.length - longUnusedItems.length}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Category Analysis */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>📊 Category Analysis</ThemedText>
          
          {/* Donut Chart - Category Distribution */}
          <ThemedView style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Category Distribution</ThemedText>
            <ThemedView style={styles.donutContainer}>
              <ThemedView style={styles.donutChart}>
                {Object.entries(
                  categories.reduce((acc, cat) => {
                    const categoryItems = collection.filter(item => item.category === cat);
                    acc[cat] = categoryItems.length;
                    return acc;
                  }, {} as Record<string, number>)
                )
                .sort(([,a], [,b]) => b - a)
                .slice(0, 6)
                .map(([category, count], index) => {
                  const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];
                  const percentage = ((count / collection.length) * 100).toFixed(1);
                  const angle = (count / collection.length) * 360;
                  
                  return (
                    <ThemedView key={category} style={styles.donutSegment}>
                      <ThemedView 
                        style={[
                          styles.donutArc,
                          { 
                            backgroundColor: colors[index % colors.length],
                            width: Math.max(angle / 6, 8)
                          }
                        ]} 
                      />
                      <ThemedView style={styles.donutLegendItem}>
                        <ThemedText style={styles.donutIcon}>{getCategoryIcon(category)}</ThemedText>
                        <ThemedText style={styles.donutLabel}>{category}</ThemedText>
                        <ThemedText style={styles.donutValue}>{percentage}%</ThemedText>
                      </ThemedView>
                    </ThemedView>
                  );
                })}
              </ThemedView>
            </ThemedView>
          </ThemedView>
          
          {/* Horizontal Bar Chart - Top Categories by Value */}
          <ThemedView style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Top Categories by Value</ThemedText>
            <ThemedView style={styles.horizontalBarChart}>
              {Object.entries(
                categories.reduce((acc, cat) => {
                  const categoryItems = collection.filter(item => item.category === cat);
                  const categoryValue = categoryItems.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
                  acc[cat] = { count: categoryItems.length, value: categoryValue };
                  return acc;
                }, {} as Record<string, { count: number; value: number }>)
              )
              .sort(([,a], [,b]) => b.value - a.value)
              .slice(0, 8)
              .map(([category, data], index) => {
                const maxValue = Math.max(...Object.values(
                  categories.reduce((acc, cat) => {
                    const categoryItems = collection.filter(item => item.category === cat);
                    const categoryValue = categoryItems.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
                    acc[cat] = categoryValue;
                    return acc;
                  }, {} as Record<string, number>)
                ));
                const barWidth = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
                
                return (
                  <ThemedView key={category} style={styles.horizontalBarRow}>
                    <ThemedView style={styles.horizontalBarLabel}>
                      <ThemedText style={styles.barIcon}>{getCategoryIcon(category)}</ThemedText>
                      <ThemedText style={styles.barLabelText}>{category.slice(0, 10)}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.horizontalBarContainer}>
                      <ThemedView 
                        style={[
                          styles.horizontalBar, 
                          { 
                            width: `${barWidth}%`, 
                            backgroundColor: colors[index % colors.length] 
                          }
                        ]} 
                      />
                    </ThemedView>
                    <ThemedText style={styles.horizontalBarValue}>{formatPrice(data.value)}</ThemedText>
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ThemedView>
          
          {/* Radar Chart - Category Performance */}
          <ThemedView style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Category Performance Radar</ThemedText>
            <ThemedView style={styles.radarChart}>
              {Object.entries(
                categories.reduce((acc, cat) => {
                  const categoryItems = collection.filter(item => item.category === cat);
                  const categoryValue = categoryItems.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
                  const avgValue = categoryValue / (categoryItems.length || 1);
                  const recentUsage = categoryItems.filter(item => {
                    const daysSince = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSince < 30;
                  }).length;
                  acc[cat] = { 
                    count: categoryItems.length, 
                    value: categoryValue,
                    avgValue,
                    usage: recentUsage
                  };
                  return acc;
                }, {} as Record<string, { count: number; value: number; avgValue: number; usage: number }>)
              )
              .sort(([,a], [,b]) => b.value - a.value)
              .slice(0, 5)
              .map(([category, data], index) => {
                const maxCount = Math.max(...categories.map(cat => collection.filter(item => item.category === cat).length));
                const maxValue = Math.max(...categories.map(cat => collection.filter(item => item.category === cat).reduce((sum, item) => sum + (item.pricePaid || 0), 0)));
                const maxUsage = Math.max(...categories.map(cat => collection.filter(item => item.category === cat).filter(item => {
                  const daysSince = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                  return daysSince < 30;
                }).length));
                
                const countScore = maxCount > 0 ? (data.count / maxCount) * 100 : 0;
                const valueScore = maxValue > 0 ? (data.value / maxValue) * 100 : 0;
                const usageScore = maxUsage > 0 ? (data.usage / maxUsage) * 100 : 0;
                const colors = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
                
                return (
                  <ThemedView key={category} style={styles.radarItem}>
                    <ThemedView style={styles.radarLabelContainer}>
                      <ThemedText style={styles.radarIcon}>{getCategoryIcon(category)}</ThemedText>
                      <ThemedText style={styles.radarLabel}>{category}</ThemedText>
                    </ThemedView>
                    <ThemedView style={styles.radarMetrics}>
                      <ThemedView style={styles.radarMetric}>
                        <ThemedText style={styles.radarMetricLabel}>Items</ThemedText>
                        <ThemedView style={styles.radarBar}>
                          <ThemedView 
                            style={[
                              styles.radarBarFill,
                              { width: `${countScore}%`, backgroundColor: colors[index % colors.length] }
                            ]} 
                          />
                        </ThemedView>
                        <ThemedText style={styles.radarMetricValue}>{data.count}</ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.radarMetric}>
                        <ThemedText style={styles.radarMetricLabel}>Value</ThemedText>
                        <ThemedView style={styles.radarBar}>
                          <ThemedView 
                            style={[
                              styles.radarBarFill,
                              { width: `${valueScore}%`, backgroundColor: colors[index % colors.length] }
                            ]} 
                          />
                        </ThemedView>
                        <ThemedText style={styles.radarMetricValue}>{formatPrice(data.value)}</ThemedText>
                      </ThemedView>
                      <ThemedView style={styles.radarMetric}>
                        <ThemedText style={styles.radarMetricLabel}>Usage</ThemedText>
                        <ThemedView style={styles.radarBar}>
                          <ThemedView 
                            style={[
                              styles.radarBarFill,
                              { width: `${usageScore}%`, backgroundColor: colors[index % colors.length] }
                            ]} 
                          />
                        </ThemedView>
                        <ThemedText style={styles.radarMetricValue}>{data.usage}</ThemedText>
                      </ThemedView>
                    </ThemedView>
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ThemedView>
          
          {Object.entries(
            categories.reduce((acc, cat) => {
              const categoryItems = collection.filter(item => item.category === cat);
              const categoryValue = categoryItems.reduce((sum, item) => sum + (item.pricePaid || 0), 0);
              acc[cat] = { count: categoryItems.length, value: categoryValue };
              return acc;
            }, {} as Record<string, { count: number; value: number }>)
          )
          .sort(([,a], [,b]) => b.value - a.value)
          .map(([category, data]) => (
            <ThemedView key={category} style={styles.categoryRow}>
              <ThemedView style={styles.categoryInfo}>
                <ThemedView style={styles.categoryNameRow}>
                  <ThemedText style={styles.categoryIcon}>{getCategoryIcon(category)}</ThemedText>
                  <ThemedText style={styles.categoryName}>{category}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.categoryCount}>{data.count} items</ThemedText>
              </ThemedView>
              <ThemedText style={styles.categoryValue}>{formatPrice(data.value)}</ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Usage Patterns */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>📈 Usage Patterns</ThemedText>
          
          {/* Usage Timeline Chart */}
          <ThemedView style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Usage Activity Timeline</ThemedText>
            <ThemedView style={styles.timelineChart}>
              {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Over 1 year'].map((period, index) => {
                let itemCount = 0;
                const now = Date.now();
                
                if (period === 'Last 7 days') {
                  itemCount = collection.filter(item => {
                    const daysSince = Math.floor((now - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSince <= 7;
                  }).length;
                } else if (period === 'Last 30 days') {
                  itemCount = collection.filter(item => {
                    const daysSince = Math.floor((now - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSince > 7 && daysSince <= 30;
                  }).length;
                } else if (period === 'Last 90 days') {
                  itemCount = collection.filter(item => {
                    const daysSince = Math.floor((now - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSince > 30 && daysSince <= 90;
                  }).length;
                } else {
                  itemCount = collection.filter(item => {
                    const daysSince = Math.floor((now - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                    return daysSince > 365;
                  }).length;
                }
                
                const maxItems = collection.length;
                const barHeight = maxItems > 0 ? (itemCount / maxItems) * 100 : 0;
                const colors = ['#10B981', '#F59E0B', '#EF4444', '#6B7280'];
                
                return (
                  <ThemedView key={period} style={styles.timelineBar}>
                    <ThemedView style={styles.timelineBarContainer}>
                      <ThemedView 
                        style={[
                          styles.timelineBarFill, 
                          { 
                            height: `${barHeight}%`, 
                            backgroundColor: colors[index] 
                          }
                        ]} 
                      />
                    </ThemedView>
                    <ThemedText style={styles.timelineLabel}>{period.replace('Last ', '').replace(' days', 'd')}</ThemedText>
                    <ThemedText style={styles.timelineValue}>{itemCount}</ThemedText>
                  </ThemedView>
                );
              })}
            </ThemedView>
          </ThemedView>
          
          {/* Value Distribution Donut */}
          <ThemedView style={styles.chartContainer}>
            <ThemedText style={styles.chartTitle}>Value Distribution by Range</ThemedText>
            <ThemedView style={styles.valueDonutContainer}>
              {(() => {
                const ranges = [
                  { label: '$0-50', min: 0, max: 50, color: '#10B981' },
                  { label: '$50-200', min: 50, max: 200, color: '#F59E0B' },
                  { label: '$200-500', min: 200, max: 500, color: '#6366F1' },
                  { label: '$500+', min: 500, max: Infinity, color: '#EF4444' }
                ];
                
                return ranges.map((range, index) => {
                  const itemsInRange = collection.filter(item => 
                    (item.pricePaid || 0) >= range.min && (item.pricePaid || 0) < range.max
                  ).length;
                  const percentage = collection.length > 0 ? ((itemsInRange / collection.length) * 100).toFixed(1) : '0.0';
                  
                  return (
                    <ThemedView key={range.label} style={styles.valueDonutItem}>
                      <ThemedView style={styles.valueDonutSegment}>
                        <ThemedView 
                          style={[
                            styles.valueDonutBar,
                            { 
                              width: `${Math.max(parseFloat(percentage), 5)}%`,
                              backgroundColor: range.color
                            }
                          ]} 
                        />
                      </ThemedView>
                      <ThemedView style={styles.valueDonutLegend}>
                        <ThemedText style={styles.valueDonutLabel}>{range.label}</ThemedText>
                        <ThemedText style={styles.valueDonutValue}>{percentage}% ({itemsInRange})</ThemedText>
                      </ThemedView>
                    </ThemedView>
                  );
                });
              })()}
            </ThemedView>
          </ThemedView>
          
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Most Active Category:</ThemedText>
            <ThemedText style={styles.statValue}>
              {categories.reduce((max, cat) => {
                const catItems = collection.filter(item => item.category === cat);
                const recentItems = catItems.filter(item => {
                  const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceUsed < 30;
                });
                return recentItems.length > (collection.filter(item => item.category === max).filter(item => {
                  const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                  return daysSinceUsed < 30;
                }).length || 0) ? cat : max;
              }, categories[0] || 'None')}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Items Used This Month:</ThemedText>
            <ThemedText style={[styles.statValue, { color: '#059669' }]}>
              {collection.filter(item => {
                const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                return daysSinceUsed < 30;
              }).length}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={styles.statLabel}>Avg. Days Since Last Use:</ThemedText>
            <ThemedText style={styles.statValue}>
              {Math.round(collection.reduce((sum, item) => {
                const daysSinceUsed = Math.floor((Date.now() - new Date(item.lastUsed).getTime()) / (1000 * 60 * 60 * 24));
                return sum + daysSinceUsed;
              }, 0) / (collection.length || 1))}
            </ThemedText>
          </ThemedView>
        </ThemedView>

        {/* Top Performers */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>🏆 Top Performers</ThemedText>
          <ThemedText style={styles.sectionSubtitle}>Most Valuable Items</ThemedText>
          {topValueItems.slice(0, 3).map(item => (
            <ThemedView key={item.id} style={styles.topItemRow}>
              <ThemedView style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemCategory}>{item.category}</ThemedText>
              </ThemedView>
              <ThemedText style={[styles.itemValue, { color: '#059669' }]}>
                {formatPrice(item.pricePaid || 0)}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>

        {/* Recommendations */}
        <ThemedView style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>💡 Smart Recommendations</ThemedText>
          {longUnusedItems.length > 0 && (
            <ThemedView style={styles.recommendationItem}>
              <ThemedText style={styles.recommendationIcon}>⚠️</ThemedText>
              <ThemedText style={styles.recommendationText}>
                Consider selling or donating {longUnusedItems.length} unused items to free up space and recover value.
              </ThemedText>
            </ThemedView>
          )}
          {expectedValue > totalValue && (
            <ThemedView style={styles.recommendationItem}>
              <ThemedText style={styles.recommendationIcon}>📈</ThemedText>
              <ThemedText style={styles.recommendationText}>
                Your inventory has appreciated by {formatPrice(expectedValue - totalValue)}. Consider insurance coverage.
              </ThemedText>
            </ThemedView>
          )}
          {categories.length > 5 && (
            <ThemedView style={styles.recommendationItem}>
              <ThemedText style={styles.recommendationIcon}>🗂️</ThemedText>
              <ThemedText style={styles.recommendationText}>
                You have {categories.length} categories. Consider consolidating similar items for better organization.
              </ThemedText>
            </ThemedView>
          )}
          <ThemedView style={styles.recommendationItem}>
            <ThemedText style={styles.recommendationIcon}>🎯</ThemedText>
            <ThemedText style={styles.recommendationText}>
              Focus on using items in the '{categories.reduce((max, cat) => {
                const catUnused = collection.filter(item => item.category === cat && longUnusedItems.includes(item));
                const maxUnused = collection.filter(item => item.category === max && longUnusedItems.includes(item));
                return catUnused.length > maxUnused.length ? cat : max;
              }, categories[0] || 'General')}' category - they have the most unused items.
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ScrollView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 44,
  },
  backButton: {
    padding: 8,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  section: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 12,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 16,
    fontWeight: '600',
    paddingHorizontal: 4,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.8,
    flex: 1,
    marginRight: 8,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 0,
    marginRight: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.1)',
  },
  categoryInfo: {
    flex: 1,
  },
  categoryNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  categoryIcon: {
    fontSize: 12,
  },
  categoryName: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 2,
  },
  categoryCount: {
    fontSize: 11,
    opacity: 0.6,
  },
  categoryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#059669',
    textAlign: 'right',
    minWidth: 60,
    marginRight: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
    opacity: 0.8,
  },
  topItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    marginBottom: 4,
  },
  itemInfo: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  itemCategory: {
    fontSize: 12,
    opacity: 0.6,
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#10B981',
  },
  recommendationItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    padding: 10,
    marginHorizontal: 4,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: 8,
  },
  recommendationIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  recommendationText: {
    flex: 1,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.9,
  },
  chartContainer: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 8,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  barChart: {
    gap: 8,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  barLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
    justifyContent: 'flex-end',
    gap: 4,
  },
  barIcon: {
    fontSize: 10,
  },
  barLabel: {
    fontSize: 11,
    textAlign: 'right',
  },
  barContainer: {
    flex: 1,
    height: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    borderRadius: 10,
    minWidth: 2,
  },
  barValue: {
    fontSize: 10,
    width: 50,
    textAlign: 'right',
    fontWeight: '600',
  },
  pieChart: {
    gap: 8,
  },
  pieItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pieColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  pieIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  pieLabel: {
    flex: 1,
    fontSize: 12,
  },
  pieValue: {
    fontSize: 12,
    fontWeight: '600',
    width: 40,
    textAlign: 'right',
  },
  timelineChart: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 120,
    paddingBottom: 20,
  },
  timelineBar: {
    alignItems: 'center',
    flex: 1,
  },
  timelineBarContainer: {
    width: 20,
    height: 80,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  timelineBarFill: {
    width: '100%',
    borderRadius: 10,
    minHeight: 2,
  },
  timelineLabel: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  timelineValue: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  // Donut Chart Styles
  donutContainer: {
    alignItems: 'center',
  },
  donutChart: {
    width: '100%',
  },
  donutSegment: {
    marginBottom: 8,
  },
  donutArc: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  donutLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  donutIcon: {
    fontSize: 12,
  },
  donutLabel: {
    flex: 1,
    fontSize: 12,
  },
  donutValue: {
    fontSize: 12,
    fontWeight: '600',
  },
  // Horizontal Bar Chart Styles
  horizontalBarChart: {
    gap: 10,
  },
  horizontalBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  horizontalBarLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 80,
    gap: 4,
  },
  barLabelText: {
    fontSize: 10,
    textAlign: 'left',
  },
  horizontalBarContainer: {
    flex: 1,
    height: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  horizontalBar: {
    height: '100%',
    borderRadius: 8,
    minWidth: 2,
  },
  horizontalBarValue: {
    fontSize: 9,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  // Radar Chart Styles
  radarChart: {
    gap: 12,
  },
  radarItem: {
    marginBottom: 8,
  },
  radarLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  radarIcon: {
    fontSize: 12,
  },
  radarLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
  radarMetrics: {
    gap: 4,
  },
  radarMetric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  radarMetricLabel: {
    fontSize: 10,
    width: 40,
    opacity: 0.7,
  },
  radarBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  radarBarFill: {
    height: '100%',
    borderRadius: 4,
    minWidth: 2,
  },
  radarMetricValue: {
    fontSize: 10,
    fontWeight: '600',
    width: 50,
    textAlign: 'right',
  },
  // Value Distribution Donut Styles
  valueDonutContainer: {
    gap: 8,
  },
  valueDonutItem: {
    marginBottom: 6,
  },
  valueDonutSegment: {
    marginBottom: 4,
  },
  valueDonutBar: {
    height: 12,
    borderRadius: 6,
    minWidth: 8,
  },
  valueDonutLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  valueDonutLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  valueDonutValue: {
    fontSize: 11,
    opacity: 0.8,
  },
});

export default AnalyticsScreen;