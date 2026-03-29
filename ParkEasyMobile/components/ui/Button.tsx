import React, { ReactNode } from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../constants/colors';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
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
  const isGhost = variant === 'ghost';
  
  const getContainerStyle = (): ViewStyleTheme => {
    let styleObj: any = { ...styles.baseContainer, ...styles[`${size}Container`] };
    if (!isGhost) {
      styleObj = { ...styleObj, ...styles[`${variant}Container`] };
    }
    if (disabled || loading) {
      styleObj = { ...styleObj, opacity: 0.6 };
    }
    return styleObj;
  };

  const getTextStyle = (): TextStyleTheme => {
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

  return (
    <TouchableOpacity
      style={[getContainerStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {icon && icon}
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.surface : colors.primary} />
      ) : (
        <Text style={getTextStyle()}>{label}</Text>
      )}
    </TouchableOpacity>
  );
};

type ViewStyleTheme = ViewStyle;
type TextStyleTheme = TextStyle;

const styles: any = StyleSheet.create({
  baseContainer: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  smContainer: { paddingVertical: 8, paddingHorizontal: 12 },
  mdContainer: { paddingVertical: 12, paddingHorizontal: 16 },
  lgContainer: { paddingVertical: 16, paddingHorizontal: 24 },
  
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
  dangerContainer: {
    backgroundColor: colors.danger,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  outlineContainer: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  
  baseText: {
    fontWeight: '600',
  },
  smText: { fontSize: 14 },
  mdText: { fontSize: 16 },
  lgText: { fontSize: 18 },
  
  primaryText: { color: colors.surface },
  secondaryText: { color: colors.primary },
  dangerText: { color: colors.surface },
  outlineText: { color: colors.primary },
});
