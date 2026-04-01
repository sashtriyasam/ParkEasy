import React from 'react';
import { 
  StyleSheet, 
  Text, 
  Pressable, 
  ViewStyle, 
  TextStyle, 
  ActivityIndicator,
  View
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'glass';

interface GlassButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  style?: ViewStyle;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const GlassButton: React.FC<GlassButtonProps> = ({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const getVariantStyles = (): ViewStyle[] => {
    switch (variant) {
      case 'primary':
        return [styles.primary, colors.shadows.primary as ViewStyle];
      case 'danger':
        return [styles.danger];
      case 'glass':
        return [styles.glass];
      case 'ghost':
        return [styles.ghost];
      default:
        return [styles.secondary];
    }
  };


  const getTextStyle = () => {
    switch (variant) {
      case 'ghost':
        return [styles.text, { color: colors.primary }];
      default:
        return styles.text;
    }
  };

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[styles.button, ...getVariantStyles(), style, (disabled || loading) && styles.disabled, animatedStyle]}
    >
      {variant === 'glass' || variant === 'secondary' ? (
        <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
      ) : null}
      
      {loading ? (
        <ActivityIndicator color={colors.textPrimary} />
      ) : (
        <View style={styles.content}>
          {icon && <Ionicons name={icon} size={18} color={variant === 'ghost' ? colors.primary : colors.textPrimary} style={styles.icon} />}
          <Text style={getTextStyle()}>{label}</Text>
        </View>
      )}
    </AnimatedPressable>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    paddingHorizontal: 24,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  danger: {
    backgroundColor: colors.dangerSurface,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
  },
  glass: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  text: {
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  icon: {
    marginRight: 8,
  },
  disabled: {
    opacity: 0.5,
  }
});
