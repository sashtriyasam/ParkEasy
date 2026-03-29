import React, { ReactNode } from 'react';
import { View, TouchableOpacity, ViewStyle, StyleSheet, Platform, StyleProp } from 'react-native';
import { colors } from '../../constants/colors';

interface CardProps {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, style, onPress }) => {
  const Comp = onPress ? TouchableOpacity : View;
  
  return (
    <Comp
      style={[styles.card, style]}
      activeOpacity={onPress ? 0.8 : 1}
      onPress={onPress}
    >
      {children}
    </Comp>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginVertical: 8,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
    }),
  },
});
