export const colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  success: '#10B981',
  danger: '#EF4444',
  error: '#EF4444',
  warning: '#F59E0B',
  info: '#3B82F6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  border: '#E2E8F0',
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  
  // Premium Design System (Task 1)
  glassSurface: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.4)',
  blurredBorder: 'rgba(226, 232, 240, 0.5)',
  
  gradients: {
    primary: ['#2563EB', '#3B82F6'],
    success: ['#10B981', '#34D399'],
    card: ['#FFFFFF', '#F8FAFC'],
    premium: ['#4F46E5', '#2563EB'], // Deep Indigo to Primary Blue
    sunset: ['#F59E0B', '#EF4444'], // Warning Orange to Danger Red
  },
  
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 4 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 8 },
  }
};

export const VEHICLE_TYPE_COLORS = {
  bike: colors.primary,
  scooter: colors.success,
  car: colors.warning,
  truck: colors.danger,
};

export const SLOT_STATUS_COLORS = {
  free: colors.success,
  occupied: colors.danger,
  reserved: colors.warning,
  maintenance: colors.textMuted,
};
