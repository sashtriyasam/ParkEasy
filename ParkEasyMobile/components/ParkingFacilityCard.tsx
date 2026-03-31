import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ParkingFacility } from '../types';
import { GlassCard } from './ui/GlassCard';
import { colors } from '../constants/colors';

interface ParkingFacilityCardProps {
  facility: ParkingFacility;
  onPress?: () => void;
  distance?: number;
  style?: any;
}

export const ParkingFacilityCard: React.FC<ParkingFacilityCardProps> = ({ facility, onPress, distance, style }) => {
  const pulse = useSharedValue(1);

  React.useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedDotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: pulse.value > 1.1 ? 0.7 : 1,
  }));

  const getStatusColor = (slots: number) => {
    if (slots > 5) return colors.success;
    if (slots > 0) return colors.warning;
    return colors.danger;
  };

  const statusColor = getStatusColor(facility.available_slots);

  return (
    <GlassCard style={[styles.container, style]} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image
          source={facility.images?.[0] || 'https://via.placeholder.com/400x200'} 
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.priceOverlay}>
          <Text style={styles.currency}>₹</Text>
          <Text style={styles.priceValue}>{Math.round(facility.price_per_hour || 0)}</Text>
          <Text style={styles.priceUnit}>/hr</Text>
        </View>
        
        {distance !== undefined && (
          <View style={styles.distanceBadge}>
            <Ionicons name="navigate-outline" size={10} color={colors.textPrimary} />
            <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{facility.name}</Text>
          {facility.rating != null && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={12} color={colors.warning} />
              <Text style={styles.ratingText}>{facility.rating}</Text>
            </View>
          )}
        </View>

        <Text style={styles.address} numberOfLines={1}>{facility.address}</Text>
        
        <View style={styles.footerRow}>
          <View style={styles.statusContainer}>
            <Animated.View style={[styles.statusDot, { backgroundColor: statusColor }, animatedDotStyle]} />
            <Text style={[styles.slotsText, { color: statusColor }]}>
              {facility.available_slots} slots available
            </Text>
          </View>
          
          <Ionicons name="chevron-forward-circle" size={24} color={colors.primary} />
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 290,
    marginRight: 20,
    padding: 0,
    paddingBottom: 4,
  },
  imageWrapper: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
  },
  priceOverlay: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    ...colors.shadows.md,
  },
  currency: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.primary,
    marginRight: 1,
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  priceUnit: {
    fontSize: 10,
    color: colors.textSecondary,
    marginLeft: 1,
  },
  distanceBadge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    backgroundColor: colors.glassSurface,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: colors.glassBorder,
  },
  distanceText: {
    fontSize: 11,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  content: {
    padding: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  address: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  slotsText: {
    fontSize: 13,
    fontWeight: '700',
  },
});
