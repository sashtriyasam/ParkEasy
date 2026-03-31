import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, DimensionValue } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  interpolate 
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

interface SkeletonProps {
  width: DimensionValue;
  height: DimensionValue;
  borderRadius?: number;
  style?: ViewStyle;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, borderRadius = 12, style }) => {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmer.value,
      [0, 1],
      [-150, 150]
    );
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { width, height, borderRadius }, style]}>
      <Animated.View style={[StyleSheet.absoluteFill, animatedStyle]}>
        <LinearGradient
          colors={['transparent', 'rgba(255, 255, 255, 0.4)', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
  },
});
