import React from 'react';
import { StyleSheet, View, ViewStyle, Pressable, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  intensity?: number;
  hasGlow?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  onPress, 
  intensity = 20,
  hasGlow = false 
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 10, stiffness: 200 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 200 });
  };

  const cardStyle = [
    styles.outerContainer,
    hasGlow && styles.glowEffect,
    animatedStyle,
    style
  ];

  if (onPress) {
    return (
      <AnimatedPressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        accessibilityRole="button"
        style={cardStyle}
      >
        <BlurView intensity={intensity} tint="dark" style={styles.blurContainer}>
          {children}
        </BlurView>
      </AnimatedPressable>
    );
  }

  return (
    <Animated.View 
      style={cardStyle}
      accessible={false}
    >
      <BlurView intensity={intensity} tint="dark" style={styles.blurContainer}>
        {children}
      </BlurView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    overflow: 'hidden',
    ...colors.shadows.glass,
  },
  glowEffect: {
    shadowColor: colors.primary,
    shadowOpacity: 0.2,
    shadowRadius: 15,
    borderWidth: 1.5,
    borderColor: 'rgba(26, 115, 232, 0.3)',
    ...Platform.select({
      android: {
        elevation: 8,
      }
    }),
  },
  blurContainer: {
    padding: 16,
    width: '100%',
  }
});

