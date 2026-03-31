export const colors = {
  // Vibrant Premium Palette
  primary: '#2563EB',         // Royal Blue
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  secondary: '#7C3AED',       // Modern Violet
  
  success: '#10B981',         // Emerald
  danger: '#EF4444',          // Rose
  error: '#EF4444',           // Alias for danger
  warning: '#F59E0B',         // Amber
  info: '#3B82F6',            // Sky
  
  // Neutral Refinement
  background: '#F8FAFC',      // Slate 50
  surface: '#FFFFFF',
  border: '#E2E8F0',          // Slate 200
  textPrimary: '#0F172A',     // Slate 900
  textSecondary: '#475569',   // Slate 600
  textMuted: '#94A3B8',       // Slate 400
  
  // Glassmorphism & Effects
  glassSurface: 'rgba(255, 255, 255, 0.7)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  overlay: 'rgba(0, 0, 0, 0.4)',
  
  gradients: {
    primary: ['#2563EB', '#3B82F6'],
    premium: ['#4F46E5', '#2563EB'], // Deep Indigo to Primary Blue
    success: ['#10B981', '#34D399'],
    warning: ['#F59E0B', '#FBBF24'],
    danger: ['#EF4444', '#F87171'],
    glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)'],
  },
  
  shadows: {
    sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
    md: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 3 },
    lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.15, shadowRadius: 20, elevation: 6 },
    premium: { shadowColor: '#2563EB', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 20, elevation: 8 },
  }
} as const;

export const VEHICLE_TYPE_COLORS = {
  bike: colors.primary,
  scooter: colors.success,
  car: colors.warning,
  truck: colors.secondary,
};

export const SLOT_STATUS_COLORS = {
  free: colors.success,
  occupied: colors.danger,
  reserved: colors.warning,
  maintenance: colors.textMuted,
};
