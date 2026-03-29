import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { ParkingFacility } from '../types';
import { Card } from './ui/Card';
import { colors } from '../constants/colors';

interface ParkingFacilityCardProps {
  facility: ParkingFacility;
  onPress?: () => void;
  distance?: number;
  style?: any;
}

export const ParkingFacilityCard: React.FC<ParkingFacilityCardProps> = ({ facility, onPress, distance, style }) => {
  const getBadgeColor = (slots: number) => {
    if (slots > 5) return colors.success;
    if (slots > 0) return colors.warning;
    return colors.danger;
  };

  return (
    <Card style={[styles.container, style]} onPress={onPress}>
      <Image
        source={facility.images?.[0] || 'https://via.placeholder.com/400x200'} 
        style={styles.image}
        contentFit="cover"
        transition={200}
      />
      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.name} numberOfLines={1}>{facility.name}</Text>
          {distance !== undefined && (
            <View style={styles.distanceBadge}>
              <Text style={styles.distanceText}>{distance.toFixed(1)} km</Text>
            </View>
          )}
        </View>
        <Text style={styles.address} numberOfLines={1}>{facility.address}</Text>
        
        <View style={styles.footerRow}>
          <View style={[styles.slotsBadge, { backgroundColor: getBadgeColor(facility.available_slots) }]}>
            <Text style={styles.slotsText}>{facility.available_slots} slots free</Text>
          </View>
          
          <Text style={styles.price}>
            ₹{facility.price_per_hour || 0}/hr
          </Text>
          
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color={colors.warning} />
            <Text style={styles.ratingText}>{facility.rating}</Text>
          </View>
        </View>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 280,
    marginRight: 16,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: 120,
    backgroundColor: colors.border,
  },
  content: {
    padding: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    flex: 1,
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  distanceBadge: {
    backgroundColor: colors.background,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  distanceText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slotsBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  slotsText: {
    color: colors.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
});
