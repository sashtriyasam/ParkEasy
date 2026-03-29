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
