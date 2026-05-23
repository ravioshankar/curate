import React from 'react';
import { View, StyleSheet, ColorValue } from 'react-native';
import { ThemedText } from '../../../components/ThemedText';

interface CurateLogoProps {
  size?: number;
  showText?: boolean;
  backgroundColor?: ColorValue;
  orbColor?: ColorValue;
  elementColor?: ColorValue;
}

export function CurateLogo({ size = 120, showText = false, backgroundColor = 'transparent', orbColor }: CurateLogoProps) {
  const scale = size / 120;
  const circleSize = Math.max(20, 50 * scale); // Minimum size for very small screens
  const spacing = Math.max(8, 15 * scale); // Responsive spacing
  const primaryOrbColor = orbColor || '#DC2626';
  
  return (
    <View style={[styles.container, { width: size, height: size, backgroundColor }]}>
      {/* Red circle - top left */}
      <View style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: primaryOrbColor,
          opacity: 0.8,
          position: 'absolute',
          left: spacing,
          top: spacing,
        }
      ]} />
      
      {/* Blue circle - top right */}
      <View style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: '#2563EB',
          opacity: 0.8,
          position: 'absolute',
          left: size - circleSize - spacing,
          top: spacing,
        }
      ]} />
      
      {/* Green circle - bottom center */}
      <View style={[
        styles.circle,
        {
          width: circleSize,
          height: circleSize,
          borderRadius: circleSize / 2,
          backgroundColor: '#16A34A',
          opacity: 0.8,
          position: 'absolute',
          left: (size - circleSize) / 2,
          top: size - circleSize - spacing,
        }
      ]} />
      
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
    // Base circle styles
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
