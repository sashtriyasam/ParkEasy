import { StyleSheet, View, ViewStyle, TouchableOpacity, Platform, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../constants/colors';

interface GlassCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  style, 
  onPress, 
  intensity = 60 
}) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container 
      onPress={onPress} 
      activeOpacity={0.9} 
      style={[styles.outerContainer, style]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView intensity={intensity} tint="light" style={styles.blurContainer}>
          {children}
        </BlurView>
      ) : (
        <View style={styles.androidContainer}>
          {children}
        </View>
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    borderRadius: 24,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
    ...colors.shadows.md,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    overflow: 'hidden',
  },
  blurContainer: {
    padding: 16,
    width: '100%',
  },
  androidContainer: {
    padding: 16,
    width: '100%',
  }
});
