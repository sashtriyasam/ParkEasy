import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions, Platform, StatusBar } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown, useSharedValue, useAnimatedStyle, interpolate, Extrapolate, useAnimatedScrollHandler } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { get } from '../../../services/api';
import { SlotGrid } from '../../../components/SlotGrid';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { Skeleton } from '../../../components/ui/SkeletonLoader';
import { colors } from '../../../constants/colors';
import { ParkingFacility, ParkingSlot } from '../../../types';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { useLiveSlots } from '../../../hooks/useLiveSlots';

const { width } = Dimensions.get('window');
const HEADER_HEIGHT = 350;

export default function FacilityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  
  const [facility, setFacilityData] = useState<ParkingFacility | null>(null);
  const [initialSlots, setInitialSlots] = useState<ParkingSlot[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  
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
      <View style={[styles.container, { backgroundColor: '#0A0F1E' }]}>
        <Skeleton width={width} height={HEADER_HEIGHT} borderRadius={0} />
        <View style={{ padding: 24, gap: 16 }}>
          <Skeleton width={250} height={32} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Skeleton width={100} height={40} borderRadius={20} />
            <Skeleton width={100} height={40} borderRadius={20} />
          </View>
          <Skeleton width="100%" height={200} borderRadius={24} style={{ marginTop: 24 }} />
        </View>
      </View>
    );
  }

  const floors = Array.from({ length: facility.floors }, (_, i) => i + 1);
  const floorSlots = liveSlots.filter(s => s.floor_id === selectedFloor.toString() || s.floor === selectedFloor);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Animated Image Header */}
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <ScrollView 
          horizontal 
          pagingEnabled 
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const index = Math.round(e.nativeEvent.contentOffset.x / width);
            setActiveIndex(index);
          }}
        >
          {(facility.images?.length ? facility.images : ['https://images.unsplash.com/photo-1506521781263-d8422e82f27a?q=80&w=1000']).map((img, idx) => (
            <Image key={idx} source={img} style={styles.image} contentFit="cover" />
          ))}
        </ScrollView>
        <LinearGradient 
          colors={['rgba(10, 15, 30, 0.4)', 'transparent', 'rgba(10, 15, 30, 0.8)']} 
          style={StyleSheet.absoluteFill} 
        />
        
        {/* Pagination Dots */}
        <View style={styles.pagination}>
          {(facility.images?.length ? facility.images : ['https://...']).map((_, idx) => (
            <View 
              key={idx} 
              style={[
                styles.dot, 
                activeIndex === idx && styles.activeDot
              ]} 
            />
          ))}
        </View>
      </Animated.View>

      {/* Floating Navigation Controls */}
      <View style={[styles.navControls, { top: Math.max(insets.top, 20) + 16 }]}>
        <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
          <BlurView intensity={30} tint="dark" style={styles.navBlur}>
            <Ionicons name="chevron-back" size={24} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
        
        <GlassCard style={styles.liveBadge}>
          <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.danger }]} />
          <Text style={styles.statusText}>{isConnected ? 'LIVE FEED' : 'SYNCING'}</Text>
        </GlassCard>
      </View>

      <Animated.ScrollView 
        onScroll={scrollHandler} 
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.mainInfo}>
          <Animated.View entering={FadeInDown.delay(200).duration(600).springify()}>
            <Text style={styles.facilityName}>{facility.name}</Text>
            <View style={styles.locationRow}>
              <Ionicons name="location" size={16} color={colors.primary} />
              <Text style={styles.addressText}>{facility.address}, {facility.city}</Text>
            </View>

            <View style={styles.quickStats}>
               <View style={styles.statBox}>
                  <Text style={styles.statValue}>₹{Math.round(facility.price_per_hour || 0)}</Text>
                  <Text style={styles.statLabel}>PER HOUR</Text>
               </View>
               <View style={styles.statDivider} />
               <View style={styles.statBox}>
                  <Text style={styles.statValue}>{facility.rating ?? '4.5'}</Text>
                  <Text style={styles.statLabel}>RATING</Text>
               </View>
               <View style={styles.statDivider} />
               <View style={styles.statBox}>
                  <Text style={styles.statValue}>{facility.available_slots}</Text>
                  <Text style={styles.statLabel}>AVAILABLE</Text>
               </View>
            </View>

            {facility.amenities && facility.amenities.length > 0 && (
              <View style={styles.section}>
                 <Text style={styles.sectionTitle}>PREMIUM AMENITIES</Text>
                 <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.amenityRow}>
                    {facility.amenities.map((amenity, idx) => (
                      <GlassCard key={idx} style={styles.amenityCard}>
                         <Ionicons name="shield-checkmark" size={16} color={colors.primary} />
                         <Text style={styles.amenityText}>{amenity}</Text>
                      </GlassCard>
                    ))}
                 </ScrollView>
              </View>
            )}

            <View style={styles.section}>
              <View style={styles.floorHeader}>
                 <Text style={styles.sectionTitle}>SELECT ACCESS NODE</Text>
                 <Text style={styles.floorIndicator}>SECURE PROTOCOL</Text>
              </View>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.floorTabs}>
                {floors.map(floor => (
                  <TouchableOpacity
                    key={floor}
                    style={[styles.floorTab, selectedFloor === floor && styles.floorTabActive]}
                    onPress={() => {
                      setSelectedFloor(floor);
                      setSelectedSlot(null);
                    }}
                  >
                    <Text style={[styles.floorTabText, selectedFloor === floor && styles.floorTabTextActive]}>LEVEL {floor}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <GlassCard style={styles.gridCard}>
                <SlotGrid 
                  slots={floorSlots} 
                  onSlotPress={(slot) => setSelectedSlot(slot)} 
                  selectedSlotId={selectedSlot?.id || null} 
                  highlightedSlotId={highlightedSlotId}
                />
              </GlassCard>
            </View>

            <View style={styles.descriptionSection}>
               <Text style={styles.sectionTitle}>PROTOCOL DATA</Text>
               <Text style={styles.description}>{facility.description || 'Verified parking node with 24/7 security surveillance and automated entry protocols.'}</Text>
            </View>
          </Animated.View>
        </View>
        <View style={styles.footerSpacer} />
      </Animated.ScrollView>

      {/* Booking Procedural Bar */}
      <View style={styles.bookingBar}>
        <BlurView intensity={80} tint="dark" style={styles.bookingBlur} />
        <View style={styles.bookingInner}>
           <View style={styles.bookingInfo}>
              <Text style={styles.bookingLabel}>CHOSEN NODE</Text>
              <Text style={styles.bookingValue}>{selectedSlot ? `SPOT-${selectedSlot.slot_number}` : 'AWAITING SELECTION'}</Text>
           </View>
           <GlassButton 
              label="INITIALIZE BOOKING" 
              onPress={handleBookNow} 
              disabled={!selectedSlot} 
              variant="primary"
              style={styles.bookBtn}
           />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  header: {
    height: HEADER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  image: {
    width,
    height: HEADER_HEIGHT,
  },
  navControls: {
    position: 'absolute',
    left: 20,
    right: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveBadge: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingTop: HEADER_HEIGHT - 40,
  },
  mainInfo: {
    backgroundColor: '#0A0F1E',
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    padding: 24,
  },
  facilityName: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
    letterSpacing: -1,
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  addressText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '600',
  },
  quickStats: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    marginBottom: 32,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 16,
  },
  amenityRow: {
    gap: 12,
  },
  amenityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  amenityText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    fontWeight: '700',
  },
  floorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  floorIndicator: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  floorTabs: {
    marginBottom: 20,
  },
  floorTab: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
  },
  floorTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  floorTabText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '800',
  },
  floorTabTextActive: {
    color: '#FFF',
  },
  gridCard: {
    borderRadius: 28,
    padding: 16,
  },
  descriptionSection: {
    marginTop: 8,
  },
  description: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 15,
    lineHeight: 24,
    fontWeight: '500',
  },
  bookingBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    overflow: 'hidden',
  },
  bookingBlur: {
    ...StyleSheet.absoluteFillObject,
  },
  bookingInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  bookingInfo: {
    flex: 1,
  },
  bookingLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 4,
  },
  bookingValue: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
  },
  bookBtn: {
    flex: 1,
  },
  pagination: {
    position: 'absolute',
    bottom: 60,
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 6,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeDot: {
    width: 16,
    backgroundColor: colors.primary,
  },
  footerSpacer: {
    height: 160,
  }
});
