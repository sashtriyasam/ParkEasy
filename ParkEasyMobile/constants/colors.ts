const PRIMARY_GRADIENT = ['#1A73E8', '#6366F1'] as const;

export const colors = {
  primary: '#1A73E8',         // Electric Blue
  primaryGlow: 'rgba(26, 115, 232, 0.35)',
  secondary: '#6366F1',       // Indigo
  background: '#0A0F1E',      // Deep Navy (Night Sky)
  surface: 'rgba(255, 255, 255, 0.04)', // Card Surface
  glass: 'rgba(255, 255, 255, 0.06)',   // Glass Panels
  glassBorder: 'rgba(255, 255, 255, 0.12)',
  textPrimary: '#FFFFFF',
  textSecondary: 'rgba(255, 255, 255, 0.6)', // ~7.2:1 contrast ratio against #0A0F1E (Passes WCAG AAA)
  textMuted: 'rgba(255, 255, 255, 0.4)',
  
  border: 'rgba(255, 255, 255, 0.12)',
  tertiary: '#6366F1',
  
  primaryDark: '#0E4AA0',
  primaryLight: '#4285F4',
  
  glassSurface: 'rgba(255, 255, 255, 0.04)',
  overlay: 'rgba(0, 0, 0, 0.6)',
  
  premium: {
    primary: '#FACC15',
    secondary: '#EAB308',
  },
  
  tabBarBackground: '#0A0F1E',
  tabBarActive: '#1A73E8',
  tabBarInactive: 'rgba(255, 255, 255, 0.4)',
  
  success: '#34C759',         // Apple Mint Green
  warning: '#FF9F0A',         // Amber
  error: '#FF453A',           // Red
  danger: '#FF453A',
  dangerSurface: 'rgba(255, 69, 58, 0.15)',
  dangerBorder: 'rgba(255, 69, 58, 0.3)',
  info: '#1A73E8',
  
  gradients: {
    primary: PRIMARY_GRADIENT,
    glass: ['rgba(255, 255, 255, 0.1)', 'rgba(255, 255, 255, 0.02)'],
    navy: ['#0A0F1E', '#161d31'],
    success: ['#34C759', '#30D158'],
    warning: ['#FF9F0A', '#FFD60A'],
    danger: ['#FF453A', '#FF3B30'],
  },
  
  shadows: {
    glass: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.4,
      shadowRadius: 24,
      elevation: 10,
    },
    primary: {
      shadowColor: '#1A73E8',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.5,
      shadowRadius: 12,
      elevation: 8,
    },
  }
} as const;

export const VEHICLE_TYPE_COLORS = {
  bike: colors.primary,
  scooter: colors.primary,
  car: colors.warning,
  truck: colors.secondary,
};

export const SLOT_STATUS_COLORS = {
  free: colors.success,      // Green for availability (UX standard)
  occupied: colors.error,    // Red for occupied
  reserved: colors.warning,  // Amber for reserved
  maintenance: '#6B7280',    // Muted Gray for offline/maintenance
};

