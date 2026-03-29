import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { create } from 'zustand';
import { colors } from '../constants/colors';

type ToastType = 'success' | 'error' | 'info';

interface ToastState {
  message: string | null;
  type: ToastType;
  visible: boolean;
  showToast: (message: string, type: ToastType) => void;
  hideToast: () => void;
}

export const useToast = create<ToastState>((set) => ({
  message: null,
  type: 'info',
  visible: false,
  showToast: (message, type) => {
    set({ message, type, visible: true });
    setTimeout(() => {
      set({ visible: false });
    }, 3000);
  },
  hideToast: () => set({ visible: false }),
}));

export const ToastContainer = () => {
  const { message, type, visible } = useToast();
  const translateY = React.useRef(new Animated.Value(100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 10,
      }).start();
    } else {
      Animated.timing(translateY, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, translateY]);

  if (!message && !visible) return null;

  const bgColors = {
    success: colors.success,
    error: colors.danger,
    info: colors.primary,
  };

  const icons = {
    success: 'checkmark-circle',
    error: 'alert-circle',
    info: 'information-circle',
  } as const;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY }],
          backgroundColor: bgColors[type],
        },
      ]}
    >
      <Ionicons name={icons[type]} size={24} color="#FFF" />
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 80, // Above typical bottom tabs
    left: 20,
    right: 20,
    borderRadius: 8,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 9999, // Render on top of everything
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
    flex: 1,
  },
});
