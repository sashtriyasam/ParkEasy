import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { useThemeColors } from '../../hooks/useThemeColors';

interface ProfessionalViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  hasVibrancy?: boolean;
  borderRadius?: number;
}

export const ProfessionalView: React.FC<ProfessionalViewProps> = ({ 
  children, 
  style, 
  intensity = 20,
  hasVibrancy = true,
  borderRadius = 28
}) => {
  const colors = useThemeColors();
  
  return (
    <View style={[styles.container, { borderRadius, borderColor: (colors as any).border || colors.glassBorder || colors.textPrimary + '20' }, style]}>
      {hasVibrancy && (
        <BlurView 
            intensity={intensity} 
            tint={colors.isDark ? 'dark' : 'light'} 
            style={StyleSheet.absoluteFill} 
        />
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 0.5,
  }
});

