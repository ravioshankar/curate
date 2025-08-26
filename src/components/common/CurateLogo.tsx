import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

interface CurateLogoProps {
  size?: number;
  backgroundColor?: string;
  orbColor?: string;
  elementColor?: string;
}

export function CurateLogo({ 
  size = 60, 
  backgroundColor = 'rgba(255,215,0,0.15)', 
  orbColor = '#FFD700',
  elementColor = '#FF6B35'
}: CurateLogoProps) {
  const frameThickness = Math.max(1, size * 0.04);
  const gemSize = size * 0.35;
  const cornerSize = size * 0.08;
  const innerFrameSize = size * 0.72;
  const decorativeLineThickness = Math.max(1, size * 0.015);
  
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const gemOpacity1 = useRef(new Animated.Value(1)).current;
  const gemOpacity2 = useRef(new Animated.Value(0)).current;
  const gemOpacity3 = useRef(new Animated.Value(0)).current;
  
  useEffect(() => {
    const rotateAnimation = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: true,
      })
    );
    
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        })
      ])
    );
    
    const gemCycleAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(gemOpacity1, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(gemOpacity1, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(gemOpacity2, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(gemOpacity2, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(gemOpacity3, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.delay(2000),
        Animated.timing(gemOpacity3, { toValue: 0, duration: 500, useNativeDriver: true })
      ])
    );
    
    rotateAnimation.start();
    pulseAnimation.start();
    gemCycleAnimation.start();
    
    return () => {
      rotateAnimation.stop();
      pulseAnimation.stop();
      gemCycleAnimation.stop();
    };
  }, []);
  
  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={[
      styles.container, 
      { 
        width: size, 
        height: size, 
        borderRadius: size * 0.12,
        backgroundColor 
      }
    ]}>
      {/* Gold shine background */}
      <Animated.View style={[
        styles.goldShine,
        {
          width: size * 0.9,
          height: size * 0.9,
          borderRadius: size * 0.1,
          backgroundColor: 'linear-gradient(135deg, #FFD700, #FFA500, #FF8C00)',
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.6,
          shadowRadius: 8,
          elevation: 10,
          transform: [{ scale: pulseAnim }]
        }
      ]} />
      
      {/* Outer frame */}
      <View style={[
        styles.frame,
        {
          width: size * 0.85,
          height: size * 0.85,
          borderWidth: frameThickness,
          borderColor: '#B8860B',
          borderRadius: size * 0.08,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.4,
          shadowRadius: 4,
          elevation: 6
        }
      ]} />
      
      {/* Inner decorative frame */}
      <View style={[
        styles.innerFrame,
        {
          width: innerFrameSize,
          height: innerFrameSize,
          borderWidth: decorativeLineThickness,
          borderColor: '#DAA520',
          borderRadius: size * 0.06,
          shadowColor: '#FFD700',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.3,
          shadowRadius: 2,
          elevation: 3
        }
      ]} />
      
      {/* Gem 1 - Diamond */}
      <Animated.View style={[
        styles.gem,
        {
          width: gemSize,
          height: gemSize,
          backgroundColor: '#FF1493',
          transform: [{ rotate: '45deg' }, { rotate: spin }],
          shadowColor: '#FF1493',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 8,
          opacity: gemOpacity1
        }
      ]} />
      
      {/* Gem 2 - Circle */}
      <Animated.View style={[
        styles.gemCircle,
        {
          width: gemSize,
          height: gemSize,
          backgroundColor: '#00CED1',
          borderRadius: gemSize / 2,
          shadowColor: '#00CED1',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 8,
          opacity: gemOpacity2,
          transform: [{ rotate: spin }]
        }
      ]} />
      
      {/* Gem 3 - Hexagon */}
      <Animated.View style={[
        styles.gemHexagon,
        {
          width: gemSize,
          height: gemSize,
          backgroundColor: '#32CD32',
          shadowColor: '#32CD32',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.8,
          shadowRadius: 6,
          elevation: 8,
          opacity: gemOpacity3,
          transform: [{ rotate: spin }]
        }
      ]} />
      
      {/* Gem highlight */}
      <Animated.View style={[
        styles.gemHighlight,
        {
          width: gemSize * 0.4,
          height: gemSize * 0.4,
          backgroundColor: '#FFFFFF',
          borderRadius: gemSize * 0.2,
          transform: [{ rotate: spin }],
          top: '42%',
          left: '42%',
          opacity: 0.6
        }
      ]} />
      
      {/* Gem facet lines */}
      <Animated.View style={[
        styles.gemFacet,
        styles.verticalFacet,
        {
          width: decorativeLineThickness,
          height: gemSize * 0.6,
          backgroundColor: '#FFFFFF',
          shadowColor: '#FFFFFF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.9,
          shadowRadius: 2,
          elevation: 4,
          transform: [{ rotate: spin }]
        }
      ]} />
      
      {/* Corner ornaments */}
      <View style={[
        styles.cornerOrnament,
        styles.topLeft,
        {
          width: cornerSize,
          height: cornerSize,
          backgroundColor: '#32CD32',
          top: size * 0.12,
          left: size * 0.12,
          shadowColor: '#32CD32',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 3,
          elevation: 5
        }
      ]} />
      <View style={[
        styles.cornerAccent,
        styles.topLeftInner,
        {
          width: cornerSize * 0.5,
          height: cornerSize * 0.5,
          backgroundColor: '#98FB98',
          top: size * 0.14,
          left: size * 0.14
        }
      ]} />
      
      <View style={[
        styles.cornerOrnament,
        styles.topRight,
        {
          width: cornerSize,
          height: cornerSize,
          backgroundColor: '#1E90FF',
          top: size * 0.12,
          right: size * 0.12,
          shadowColor: '#1E90FF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 3,
          elevation: 5
        }
      ]} />
      <View style={[
        styles.cornerAccent,
        styles.topRightInner,
        {
          width: cornerSize * 0.5,
          height: cornerSize * 0.5,
          backgroundColor: '#87CEEB',
          top: size * 0.14,
          right: size * 0.14
        }
      ]} />
      
      <View style={[
        styles.cornerOrnament,
        styles.bottomLeft,
        {
          width: cornerSize,
          height: cornerSize,
          backgroundColor: '#9370DB',
          bottom: size * 0.12,
          left: size * 0.12,
          shadowColor: '#9370DB',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 3,
          elevation: 5
        }
      ]} />
      <View style={[
        styles.cornerAccent,
        styles.bottomLeftInner,
        {
          width: cornerSize * 0.5,
          height: cornerSize * 0.5,
          backgroundColor: '#DDA0DD',
          bottom: size * 0.14,
          left: size * 0.14
        }
      ]} />
      
      <View style={[
        styles.cornerOrnament,
        styles.bottomRight,
        {
          width: cornerSize,
          height: cornerSize,
          backgroundColor: '#FF4500',
          bottom: size * 0.12,
          right: size * 0.12,
          shadowColor: '#FF4500',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.7,
          shadowRadius: 3,
          elevation: 5
        }
      ]} />
      <View style={[
        styles.cornerAccent,
        styles.bottomRightInner,
        {
          width: cornerSize * 0.5,
          height: cornerSize * 0.5,
          backgroundColor: '#FFA07A',
          bottom: size * 0.14,
          right: size * 0.14
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
  goldShine: {
    position: 'absolute',
    opacity: 0.3,
  },
  frame: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  innerFrame: {
    position: 'absolute',
    backgroundColor: 'transparent',
  },
  gem: {
    position: 'absolute',
    borderRadius: 4,
  },
  gemCircle: {
    position: 'absolute',
  },
  gemHexagon: {
    position: 'absolute',
    borderRadius: 6,
    transform: [{ rotate: '30deg' }],
  },
  gemHighlight: {
    position: 'absolute',
  },
  gemFacet: {
    position: 'absolute',
  },
  verticalFacet: {
    left: '50%',
    top: '50%',
    transform: [{ translateX: -0.5 }, { translateY: -30 }],
  },

  cornerOrnament: {
    position: 'absolute',
    borderRadius: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  cornerAccent: {
    position: 'absolute',
    borderRadius: 1,
    opacity: 0.9,
  },
  topLeft: {},
  topRight: {},
  bottomLeft: {},
  bottomRight: {},
  topLeftInner: {},
  topRightInner: {},
  bottomLeftInner: {},
  bottomRightInner: {},
});