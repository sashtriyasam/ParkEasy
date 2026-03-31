import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { get } from '../../../services/api';
import { SlotGrid } from '../../../components/SlotGrid';
import { Button } from '../../../components/ui/Button';
import { GlassCard } from '../../../components/ui/GlassCard';
import { Skeleton } from '../../../components/ui/SkeletonLoader';
import { colors } from '../../../constants/colors';
import { ParkingFacility, ParkingSlot } from '../../../types';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { useLiveSlots } from '../../../hooks/useLiveSlots';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 300;

export default function FacilityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [facility, setFacilityData] = useState<ParkingFacility | null>(null);
  const [initialSlots, setInitialSlots] = useState<ParkingSlot[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { slots: liveSlots, isConnected, highlightedSlotId } = useLiveSlots(id || '', initialSlots);
  const { setFacility, setSlot } = useBookingFlowStore();

  const scrollY = useSharedValue(0);
  const scrollHandler = useAnimatedScrollHandler(event => {
    scrollY.value = event.contentOffset.y;
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateY: interpolate(scrollY.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [-HEADER_HEIGHT / 2, 0, HEADER_HEIGHT * 0.75])
        },
        {
          scale: interpolate(scrollY.value, [-HEADER_HEIGHT, 0, HEADER_HEIGHT], [2, 1, 1])
        }
      ]
    };
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, slotsRes] = await Promise.all([
          get(`/parking/facilities/${id}`),
          get(`/parking/facilities/${id}/slots`)
        ]);
        setFacilityData(facRes.data.data);
        setInitialSlots(slotsRes.data.data);
      } catch (e) {
        console.error('Error fetching facility details', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBookNow = () => {
    if (!selectedSlot || !facility) return;
    setFacility(facility.id, facility.name);
    setSlot(selectedSlot);
    router.push('/(customer)/booking/vehicle');
  };

  if (loading || !facility) {
    return (
      <View style={styles.container}>
        <Skeleton width={width} height={HEADER_HEIGHT} borderRadius={0} />
        <View style={{ padding: 24, gap: 16 }}>
          <Skeleton width={250} height={32} />
          <Skeleton width={200} height={20} />
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 20 }}>
            <Skeleton width={80} height={40} borderRadius={20} />
            <Skeleton width={80} height={40} borderRadius={20} />
            <Skeleton width={80} height={40} borderRadius={20} />
          </View>
          <Skeleton width="100%" height={300} borderRadius={24} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  const floors = Array.from({ length: facility.floors }, (_, i) => i + 1);
  const floorSlots = liveSlots.filter(s => s.floor_id === selectedFloor.toString() || s.floor === selectedFloor);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      <Animated.ScrollView 
        onScroll={scrollHandler} 
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[styles.header, headerAnimatedStyle]}>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
            {(facility.images?.length ? facility.images : ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000']).map((img, idx) => (
              <Image key={idx} source={img} style={styles.image} contentFit="cover" />
            ))}
          </ScrollView>
          <LinearGradient 
            colors={['rgba(0,0,0,0.4)', 'transparent', 'transparent', 'rgba(0,0,0,0.6)']} 
            style={StyleSheet.absoluteFill} 
          />
          
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <GlassCard style={styles.backButtonInner}>
              <Ionicons name="chevron-back" size={24} color="white" />
            </GlassCard>
          </TouchableOpacity>

          <GlassCard style={styles.statusBadge} intensity={80}>
            <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.textMuted }]} />
            <Text style={[styles.statusText, { color: 'white' }]}>
              {isConnected ? 'LIVE' : 'OFFLINE'}
            </Text>
          </GlassCard>
        </Animated.View>
        
        <View style={styles.content}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{facility.name}</Text>
              {facility.pricing_rules?.[0]?.hourly_rate ? (
                <View style={styles.priceTag}>
                  <Text style={styles.pricePrefix}>₹</Text>
                  <Text style={styles.priceValue}>{Math.round(facility.pricing_rules[0].hourly_rate)}</Text>
                  <Text style={styles.priceSuffix}>/hr</Text>
                </View>
              ) : (
                <View style={[styles.priceTag, { backgroundColor: colors.border + '30' }]}>
                  <Text style={[styles.priceSuffix, { color: colors.textSecondary, opacity: 1 }]}>Price Varies</Text>
                </View>
              )}
            </View>

            <View style={styles.metaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="star" size={16} color={colors.warning} />
                <Text style={styles.metaText}>{facility.rating} ({facility.review_count})</Text>
              </View>
              <View style={styles.metaDivider} />
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.metaText}>{facility.operating_hours}</Text>
              </View>
            </View>

            <View style={styles.locationContainer}>
              <Ionicons name="location-sharp" size={18} color={colors.primary} />
              <Text style={styles.address}>{facility.address}, {facility.city}</Text>
            </View>
            
            <Text style={styles.description}>{facility.description}</Text>
            
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Select Parking Spot</Text>
              <View style={[styles.connectedIndicator, { backgroundColor: isConnected ? colors.success + '10' : colors.warning + '10' }]}>
                <Text style={[styles.connectedText, { color: isConnected ? colors.success : colors.warning }]}>
                  {isConnected ? 'Synced' : 'Connecting...'}
                </Text>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floorTabs} contentContainerStyle={{ paddingHorizontal: 4 }}>
              {floors.map(floor => (
                <TouchableOpacity
                  key={floor}
                  style={[styles.floorTab, selectedFloor === floor && styles.floorTabActive]}
                  onPress={() => {
                    setSelectedFloor(floor);
                    setSelectedSlot(null);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.floorTabText, selectedFloor === floor && styles.floorTabTextActive]}>
                    FLOOR {floor}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            
            <GlassCard style={styles.slotsCard} intensity={40}>
               <SlotGrid 
                 slots={floorSlots} 
                 onSlotPress={(slot) => setSelectedSlot(slot)} 
                 selectedSlotId={selectedSlot?.id || null} 
                 highlightedSlotId={highlightedSlotId}
               />
            </GlassCard>
          </Animated.View>
        </View>
        <View style={{ height: 140 }} />
      </Animated.ScrollView>

      <GlassCard style={styles.bottomBar} intensity={90}>
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>SELECTED SLOT</Text>
          <Text style={styles.selectedValue}>
            {selectedSlot ? `Spot ${selectedSlot.slot_number}` : 'Please select a spot'}
          </Text>
          {selectedSlot && <Text style={styles.floorInfo}>Level {selectedSlot.floor_id || selectedSlot.floor}</Text>}
        </View>
        <Button 
          label="Book Now" 
          onPress={handleBookNow} 
          disabled={!selectedSlot} 
          style={styles.bookButton}
          size="lg"
        />
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    height: HEADER_HEIGHT,
    overflow: 'hidden',
  },
  image: {
    width,
    height: HEADER_HEIGHT,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    zIndex: 10,
  },
  backButtonInner: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  statusBadge: {
    position: 'absolute',
    top: 50,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  content: {
    padding: 24,
    backgroundColor: colors.background,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    marginTop: -32,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  name: {
    fontSize: 28,
    fontWeight: '900',
    color: colors.textPrimary,
    flex: 1,
    letterSpacing: -0.5,
  },
  priceTag: {
    flexDirection: 'row',
    alignItems: 'baseline',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  pricePrefix: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  priceValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.primary,
  },
  priceSuffix: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    opacity: 0.8,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  metaDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  address: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    flex: 1,
  },
  description: {
    fontSize: 15,
    color: colors.textSecondary,
    lineHeight: 22,
    fontWeight: '500',
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  connectedIndicator: {
    backgroundColor: colors.success + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  connectedText: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.success,
  },
  floorTabs: {
    marginBottom: 20,
  },
  floorTab: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: 'white',
    marginRight: 10,
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.shadows.sm,
  },
  floorTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  floorTabText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.textSecondary,
    letterSpacing: 0.5,
  },
  floorTabTextActive: {
    color: 'white',
  },
  slotsCard: {
    borderRadius: 30,
    padding: 20,
    minHeight: 340,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: 'white',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 0,
    borderTopWidth: 1,
  },
  selectedInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textSecondary,
    letterSpacing: 1,
    marginBottom: 4,
  },
  selectedValue: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  floorInfo: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
    marginTop: 2,
  },
  bookButton: {
    minWidth: 140,
  },
});
