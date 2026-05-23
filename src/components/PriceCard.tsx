import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ThemedView } from '../../components/ThemedView';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface PriceCardProps {
  itemName: string;
  category: string;
  currentValue: number;
  originalValue: number;
  changePercent: number;
  trend: 'up' | 'down' | 'stable';
  chartData?: { date: string; value: number; source: string }[];
  onEditPress: () => void;
}

export function PriceCard({ 
  itemName, 
  category, 
  currentValue, 
  originalValue,
  changePercent, 
  trend,
  chartData,
  onEditPress 
}: PriceCardProps) {
  // Format currency
  const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
  
  return (
    <ThemedView style={styles.card} testID={`price-card-${itemName.toLowerCase().replace(/\s+/g, '-')}`}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.itemName, trend === 'up' && styles.upTrend, trend === 'down' && styles.downTrend]}>
          {itemName}
        </Text>
        <Text style={[styles.categoryIcon, { color: '#6B7280' }]}>
          📊 {category}
        </Text>
      </View>

      {/* Price Display */}
      <ThemedView style={styles.priceSection}>
        <Text style={styles.label}>Current Value</Text>
        <Text style={[styles.currentValue, trend === 'up' && styles.greenText, trend === 'down' && styles.redText]}>
          {formatCurrency(currentValue)}
        </Text>

        {/* Change indicator */}
        <View style={[
          styles.changeBadge,
          trend === 'up' && styles.upBadge,
          trend === 'down' && styles.downBadge
        ]}>
          <Icon 
            name={trend === 'up' ? 'trending-up' : trend === 'down' ? 'trending-down' : 'equalizer'} 
            size={16} 
            color={trend === 'up' ? '#059669' : trend === 'down' ? '#dc2626' : '#6B7280'}
          />
          <Text style={styles.changePercent}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(1)}%
          </Text>
        </View>
      </ThemedView>

      {/* Sparkline Chart */}
      {chartData && chartData.length > 0 && (
        <View style={styles.chartContainer}>
          {/* Vertical grid lines */}
          <View style={styles.gridLines}>
            {[1, 2, 3].map(i => (
              <View key={i} style={[styles.gridLine, i === 2 && styles.middleGridLine]} />
            ))}
          </View>

          {/* Data line */}
          <View style={styles.chartArea}>
            {chartData.length > 1 ? (
              <>
                {/* Start point */}
                <View style={[
                  styles.chartPoint,
                  { 
                    top: `${(chartData[0].value - originalValue) / originalValue * 100}%`,
                    backgroundColor: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280',
                  }
                ]}>
                  <View style={styles.pointPulse} />
                </View>

                {/* Connecting line (simplified as bars for now) */}
                {chartData.map((point, index) => (
                  <View key={index} style={[
                    styles.chartBar,
                    { 
                      height: `${Math.max(5, ((point.value - originalValue) / originalValue * 100))}%`,
                      top: `${(originalValue > 0 ? (originalValue) : 0)}%`, // simplified positioning
                      backgroundColor: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280',
                    }
                  ]} />
                ))}
              </>
            ) : (
              <View style={styles.placeholderBar}>
                <View style={[
                  styles.placeholderFill,
                  { 
                    height: `${Math.abs(changePercent)}%`,
                    backgroundColor: trend === 'up' ? '#10B981' : trend === 'down' ? '#EF4444' : '#6B7280',
                  }
                ]} />
              </View>
            )}
          </View>
        </View>
      )}

      {/* Actions */}
      <TouchableOpacity 
        style={styles.editButton} 
        onPress={onEditPress}
        testID={`edit-button-${itemName.toLowerCase()}`}
      >
        <Icon name="edit" size={20} color="#6B7280" />
        <Text style={styles.editText}>Edit Valuation</Text>
      </TouchableOpacity>

      {/* Legend */}
      {trend === 'up' && (
        <View style={[styles.legend, styles.upLegend]}>
          <Icon name="trending-up" size={14} color="#059669" />
          <Text style={[styles.legendText, { color: '#059669' }]}>
            Value increased by ${formatCurrency(currentValue - originalValue)}
          </Text>
        </View>
      )}

      {trend === 'down' && (
        <View style={[styles.legend, styles.downLegend]}>
          <Icon name="trending-down" size={14} color="#dc2626" />
          <Text style={[styles.legendText, { color: '#dc2626' }]}>
            Value decreased by ${formatCurrency(originalValue - currentValue)}
          </Text>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  upTrend: { color: '#059669' },
  downTrend: { color: '#dc2626' },
  categoryIcon: {
    fontSize: 14,
    fontWeight: '500',
  },
  priceSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    color: '#6B7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  currentValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  greenText: { color: '#059669' },
  redText: { color: '#dc2626' },
  changeBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginTop: 6,
    alignItems: 'center',
  },
  upBadge: { borderColor: '#10B981', borderWidth: 1, },
  downBadge: { borderColor: '#EF4444', borderWidth: 1, },
  changePercent: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  chartContainer: {
    marginVertical: 12,
    padding: 12,
    backgroundColor: 'rgba(243, 244, 246, 0.5)',
    borderRadius: 12,
  },
  gridLines: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 80,
    marginRight: 16,
  },
  gridLine: {
    width: 3,
    flex: 1,
    backgroundColor: '#E5E7EB',
    marginBottom: -40,
    marginLeft: 16,
  },
  middleGridLine: {
    height: 50,
  },
  chartArea: {
    flex: 1,
    flexDirection: 'column-reverse',
    justifyContent: 'space-between',
  },
  chartPoint: {
    width: 12,
    height: 12,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: -8,
    marginRight: 4,
  },
  pointPulse: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  chartBar: {
    flex: 1,
    backgroundColor: '#6366F1',
    borderRadius: 4,
    marginHorizontal: -6,
  },
  placeholderBar: {
    height: 2,
    width: '100%',
    marginTop: -4,
  },
  placeholderFill: {
    height: 20,
    backgroundColor: '#6366F1',
    borderRadius: 4,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  editText: {
    color: '#6B7280',
    fontSize: 14,
    marginLeft: 4,
    fontWeight: '500',
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  upLegend: { borderColor: '#10B981', backgroundColor: 'rgba(16, 185, 129, 0.1)' },
  downLegend: { borderColor: '#EF4444', backgroundColor: 'rgba(239, 68, 68, 0.1)' },
  legendText: {
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 6,
  },
});
