import React from 'react';
import { StyleSheet, View, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/colors';

interface GlassViewProps {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  borderRadius?: number;
}

export const GlassView: React.FC<GlassViewProps> = ({ 
  children, 
  style, 
  intensity = 20,
  tint = 'dark',
  borderRadius = 24
}) => {
  return (
    <View style={[styles.container, { borderRadius }, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.glass,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  }
});
