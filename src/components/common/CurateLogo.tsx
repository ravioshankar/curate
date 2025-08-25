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
  const orbSize = size * 0.33;
  const elementSizes = {
    orbit1: size * 0.13,
    orbit2: size * 0.1,
    orbit3: size * 0.12,
    orbit4: size * 0.08,
  };

  return (
    <View style={[
      styles.container, 
      { 
        width: logoSize, 
        height: logoSize, 
        borderRadius: logoSize * 0.25,
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
        styles.orbit1, 
        { 
          width: elementSizes.orbit1, 
          height: elementSizes.orbit1,
          backgroundColor: elementColor,
          top: size * 0.13,
          right: size * 0.25
        }
      ]} />
      <View style={[
        styles.orbitElement, 
        styles.orbit2, 
        { 
          width: elementSizes.orbit2, 
          height: elementSizes.orbit2,
          backgroundColor: elementColor,
          bottom: size * 0.13,
          left: size * 0.2
        }
      ]} />
      <View style={[
        styles.orbitElement, 
        styles.orbit3, 
        { 
          width: elementSizes.orbit3, 
          height: elementSizes.orbit3,
          backgroundColor: elementColor,
          top: size * 0.25,
          left: size * 0.13
        }
      ]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centralOrb: {
    position: 'absolute',
  },
  orbitElement: {
    position: 'absolute',
    borderRadius: 50,
  },
  orbit1: {},
  orbit2: {},
  orbit3: {},
});