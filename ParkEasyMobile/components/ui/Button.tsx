import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle, Platform } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode | string;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  style,
  textStyle,
}) => {
  const scale = useSharedValue(1);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onPress();
  };

  const isGhost = variant === 'ghost';
  
  const getContainerStyle = (): ViewStyle => {
    let styleObj: any = { ...styles.baseContainer, ...styles[`${size}Container`] };
    if (!isGhost) {
      styleObj = { ...styleObj, ...styles[`${variant}Container`] };
    }
    if (disabled || loading) {
      styleObj = { ...styleObj, opacity: 0.6 };
    }
    return styleObj;
  };

  const getTextStyle = (): TextStyle => {
    let styleObj: any = { ...styles.baseText, ...styles[`${size}Text`] };
    if (!isGhost) {
      styleObj = { ...styleObj, ...styles[`${variant}Text`] };
    } else {
      styleObj = { ...styleObj, color: colors.primary };
    }
    if (textStyle) {
      styleObj = { ...styleObj, ...textStyle };
    }
    return styleObj;
  };

  const iconColor = (variant === 'primary' || variant === 'danger') 
    ? colors.surface 
    : (variant === 'glass' ? colors.textPrimary : colors.primary);
  const iconSize = size === 'sm' ? 16 : size === 'lg' ? 22 : 18;

  const renderIcon = () => {
    if (!icon) return null;
    if (typeof icon === 'string') {
      return <Ionicons name={icon as any} size={iconSize} color={iconColor} />;
    }
    return icon;
  };

  return (
    <AnimatedTouchableOpacity
      style={[getContainerStyle(), animatedStyle, style]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={1}
    >
      {renderIcon()}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.surface : colors.primary} />
      ) : (
        <Text style={getTextStyle()}>{label}</Text>
      )}
    </AnimatedTouchableOpacity>
  );
};

const styles: any = StyleSheet.create({
  baseContainer: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    ...colors.shadows.md,
  },
  smContainer: { paddingVertical: 10, paddingHorizontal: 16 },
  mdContainer: { paddingVertical: 14, paddingHorizontal: 20 },
  lgContainer: { paddingVertical: 18, paddingHorizontal: 28 },
  
  primaryContainer: {
    backgroundColor: colors.primary,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  secondaryContainer: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  glassContainer: {
    backgroundColor: colors.glassSurface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    ...colors.shadows.sm,
  },
  dangerContainer: {
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1.5,
    borderColor: colors.primary,
    ...colors.shadows.sm,
  },
  
  baseText: {
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  smText: { fontSize: 13 },
  mdText: { fontSize: 15 },
  lgText: { fontSize: 17 },
  
  primaryText: { color: colors.surface },
  secondaryText: { color: colors.primary },
  glassText: { color: colors.textPrimary },
  dangerText: { color: colors.surface },
  outlineText: { color: colors.primary },
});
