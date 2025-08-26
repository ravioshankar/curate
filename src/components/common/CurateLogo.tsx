import React from 'react';
import { View, StyleSheet } from 'react-native';

interface CurateLogoProps {
  size?: number;
  backgroundColor?: string;
  orbColor?: string;
  elementColor?: string;
}

export function CurateLogo({ 
  size = 60, 
  backgroundColor = 'rgba(185,28,28,0.1)', 
  orbColor = '#B91C1C',
  elementColor = '#B91C1C'
}: CurateLogoProps) {
  const logoSize = size;
  const orbSize = size * 0.4;
  const elementSizes = {
    orbit1: size * 0.16,
    orbit2: size * 0.14,
    orbit3: size * 0.18,
  };

  return (
    <View style={[
      styles.container, 
      { 
        width: logoSize, 
        height: logoSize, 
        borderRadius: logoSize * 0.15,
        backgroundColor 
      }
    ]}>
      <View style={[
        styles.centralOrb, 
        { 
          width: orbSize, 
          height: orbSize, 
          borderRadius: orbSize / 2,
          backgroundColor: orbColor 
        }
      ]} />
      <View style={[
        styles.orbitElement, 
        { 
          width: elementSizes.orbit1, 
          height: elementSizes.orbit1,
          backgroundColor: elementColor,
          top: size * 0.15,
          right: size * 0.2
        }
      ]} />
      <View style={[
        styles.orbitElement, 
        { 
          width: elementSizes.orbit2, 
          height: elementSizes.orbit2,
          backgroundColor: elementColor,
          bottom: size * 0.18,
          left: size * 0.18
        }
      ]} />
      <View style={[
        styles.orbitElement, 
        { 
          width: elementSizes.orbit3, 
          height: elementSizes.orbit3,
          backgroundColor: elementColor,
          top: size * 0.12,
          left: size * 0.15
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  centralOrb: {
    position: 'absolute',
    zIndex: 1,
  },
  orbitElement: {
    position: 'absolute',
    borderRadius: 50,
    zIndex: 2,
  },
  orbit1: {},
  orbit2: {},
  orbit3: {},
});