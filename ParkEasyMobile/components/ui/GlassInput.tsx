import React, { useState } from 'react';
import { 
  StyleSheet, 
  TextInput, 
  View, 
  Text, 
  TextInputProps,
  ViewStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  interpolateColor
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/colors';
import { Ionicons } from '@expo/vector-icons';

interface GlassInputProps extends TextInputProps {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  error?: string;
  containerStyle?: ViewStyle;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  label,
  icon,
  error,
  containerStyle,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const borderOpacity = useSharedValue(0);
  const glowOpacity = useSharedValue(0);

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    borderOpacity.value = withTiming(1);
    glowOpacity.value = withTiming(1);
    onFocus?.(e);
  };

  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    borderOpacity.value = withTiming(0);
    glowOpacity.value = withTiming(0);
    onBlur?.(e);
  };

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(
      borderOpacity.value,
      [0, 1],
      ['rgba(255, 255, 255, 0.12)', colors.primary]
    ),
    shadowOpacity: glowOpacity.value * 0.3,
  }));

  return (
    <View style={[styles.root, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      
      <Animated.View style={[styles.container, animatedContainerStyle]}>
        <BlurView intensity={15} tint="dark" style={StyleSheet.absoluteFill} />
        
        {icon && (
          <Ionicons 
            name={icon} 
            size={20} 
            color={isFocused ? colors.primary : colors.textSecondary} 
            style={styles.icon} 
          />
        )}
        
        <TextInput
          style={styles.input}
          placeholderTextColor="rgba(255, 255, 255, 0.3)"
          onFocus={(e) => handleFocus(e as NativeSyntheticEvent<TextInputFocusEventData>)}
          onBlur={(e) => handleBlur(e as NativeSyntheticEvent<TextInputFocusEventData>)}
          selectionColor={colors.primary}
          {...props}
        />
      </Animated.View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    color: colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginLeft: 4,
    letterSpacing: -0.2,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 56,
    borderRadius: 16,
    borderWidth: 1,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 10,
    elevation: 2,
  },
  icon: {
    marginLeft: 16,
  },
  input: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 16,
    color: colors.textPrimary,
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: -0.3,
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  }
});
