import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';

interface CurateLogoProps {
  size?: number;
  showText?: boolean;
}

export function CurateLogo({ size = 120, showText = false }: CurateLogoProps) {
  const circleRadius = size * 0.21;
  const centerX = size / 2;
  const centerY = size / 2;
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {/* Red circle */}
      <View style={[
        styles.circle,
        styles.redCircle,
        {
          width: circleRadius * 2,
          height: circleRadius * 2,
          borderRadius: circleRadius,
          left: centerX - circleRadius - size * 0.125,
          top: centerY - circleRadius - size * 0.125,
        }
      ]} />
      
      {/* Blue circle */}
      <View style={[
        styles.circle,
        styles.blueCircle,
        {
          width: circleRadius * 2,
          height: circleRadius * 2,
          borderRadius: circleRadius,
          left: centerX - circleRadius + size * 0.125,
          top: centerY - circleRadius - size * 0.125,
        }
      ]} />
      
      {/* Green circle */}
      <View style={[
        styles.circle,
        styles.greenCircle,
        {
          width: circleRadius * 2,
          height: circleRadius * 2,
          borderRadius: circleRadius,
          left: centerX - circleRadius,
          top: centerY - circleRadius + size * 0.125,
        }
      ]} />
      
      {/* Optional text below */}
      {showText && (
        <View style={styles.textContainer}>
          <ThemedText style={styles.brandText}>Curate</ThemedText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circle: {
    position: 'absolute',
  },
  redCircle: {
    backgroundColor: '#DC2626',
    opacity: 0.8,
  },
  blueCircle: {
    backgroundColor: '#2563EB',
    opacity: 0.8,
  },
  greenCircle: {
    backgroundColor: '#16A34A',
    opacity: 0.8,
  },
  textContainer: {
    position: 'absolute',
    bottom: -40,
    alignItems: 'center',
  },
  brandText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});