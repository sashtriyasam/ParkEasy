import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ComponentProps } from 'react';

type IconName = ComponentProps<typeof Ionicons>['name'];
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import { ParkingFacility } from '../types';
import { GlassCard } from './ui/GlassCard';
import { colors } from '../constants/colors';
import { formatCurrency } from '../utils/format';

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

  const getAmenityIcon = (amenity: string): IconName => {
    const a = amenity.toLowerCase();
    if (a.includes('valet')) return 'car-sport';
    if (a.includes('ev') || a.includes('charging')) return 'flash';
    if (a.includes('cctv') || a.includes('security')) return 'shield-checkmark';
    if (a.includes('disability') || a.includes('accessible')) return 'body';
    return 'star';
  };

  return (
    <GlassCard style={[styles.container, style]} onPress={onPress}>
      <View style={styles.imageWrapper}>
        <Image
          source={facility.images?.[0] || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&q=80&w=400'} 
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        <View style={styles.priceBadge}>
          <Text style={styles.priceLabel}>{formatCurrency(facility.price_per_hour)}</Text>
          <Text style={styles.priceUnit}>/hr</Text>
        </View>
        
        {facility.verified && (
          <View style={styles.verifiedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#FFF" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>{facility.name}</Text>
          {facility.rating !== null && facility.rating !== undefined && (
            <View style={styles.ratingBox}>
              <Ionicons name="star" size={10} color={colors.warning} />
              <Text style={styles.ratingText}>{facility.rating}</Text>
            </View>
          )}
        </View>

        <View style={styles.addressRow}>
          <Ionicons name="location-outline" size={12} color={colors.textSecondary} />
          <Text style={styles.address} numberOfLines={1}>{facility.address}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.footer}>
          <View style={styles.statsRow}>
            <View style={styles.availability}>
              <Animated.View style={[styles.dot, { backgroundColor: statusColor }, animatedDotStyle]} />
              <Text style={[styles.slotsText, { color: statusColor }]}>
                {facility.available_slots} Slots
              </Text>
            </View>
            
            {distance !== undefined && (
              <View style={styles.distanceBox}>
                <Ionicons name="navigate-outline" size={10} color={colors.primary} />
                <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
              </View>
            )}
          </View>

          <View style={styles.amenities}>
            {facility.amenities?.slice(0, 3).map((amenity) => (
              <View key={amenity} style={styles.amenityIcon}>
                <Ionicons name={getAmenityIcon(amenity)} size={12} color="rgba(255,255,255,0.6)" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </GlassCard>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
    padding: 0,
    overflow: 'hidden',
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  priceBadge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'baseline',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
  },
  priceLabel: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  priceUnit: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 9,
    fontWeight: '600',
    marginLeft: 1,
  },
  verifiedBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: colors.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFF',
  },
  content: {
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.2,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255, 159, 10, 0.1)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  ratingText: {
    color: colors.warning,
    fontSize: 10,
    fontWeight: '700',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 12,
  },
  address: {
    fontSize: 11,
    color: colors.textSecondary,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 10,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  availability: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  slotsText: {
    fontSize: 11,
    fontWeight: '700',
  },
  distanceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  distanceText: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: '600',
  },
  amenities: {
    flexDirection: 'row',
    gap: 8,
  },
  amenityIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.06)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});

