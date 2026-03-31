import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  RefreshControl, 
  StyleSheet, 
  TouchableOpacity, 
  Dimensions, 
  Platform,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  useAnimatedScrollHandler,
  Extrapolate
} from 'react-native-reanimated';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { get } from '../../services/api';
import { colors } from '../../constants/colors';
import { ParkingFacility } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { mapAppearance } from '../../constants/mapAppearance';
import { GlassCard } from '../../components/ui/GlassCard';
import { Skeleton } from '../../components/ui/SkeletonLoader';

const { width, height } = Dimensions.get('window');
const HEADER_MAX_HEIGHT = 240;
const HEADER_MIN_HEIGHT = 100;
const HEADER_SCROLL_DISTANCE = HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const mapRef = useRef<MapView>(null);
  
  // Animations
  const scrollY = useSharedValue(0);
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const scrollHandler = useAnimatedScrollHandler((event) => {
    scrollY.value = event.contentOffset.y;
  });

  const headerStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      Extrapolate.CLAMP
    );
    return { height, borderBottomLeftRadius: interpolate(scrollY.value, [0, HEADER_SCROLL_DISTANCE], [40, 0], Extrapolate.CLAMP) };
  });

  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE / 2, HEADER_SCROLL_DISTANCE],
      [1, 0.3, 0],
      Extrapolate.CLAMP
    );
    const scale = interpolate(
      scrollY.value,
      [0, HEADER_SCROLL_DISTANCE],
      [1, 0.8],
      Extrapolate.CLAMP
    );
    return { opacity, transform: [{ scale }] };
  });

  const animatedMarkerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
    opacity: interpolate(pulse.value, [1, 1.15], [1, 0.8]),
  }));
  
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nearbyFacilities, setNearbyFacilities] = useState<ParkingFacility[]>([]);
  const [recentFacilities, setRecentFacilities] = useState<ParkingFacility[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const fetchFacilities = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      const url = (lat && lon) 
        ? `/parking/search?lat=${lat}&lon=${lon}&limit=10` 
        : `/parking/search?limit=10`;
      const res = await get(url);
      setNearbyFacilities(res.data.data);
      
      const recentRes = await get('/customer/tickets');
      const tickets = recentRes.data.data || [];
      const recents: ParkingFacility[] = [];
      const seen = new Set();
      for (const t of tickets) {
        if (t.facility && !seen.has(t.facility.id) && recents.length < 3) {
          seen.add(t.facility.id);
          recents.push(t.facility);
        }
      }
      setRecentFacilities(recents);
    } catch (e) {
      console.error('Error fetching facilities', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const initLocationAndFetch = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      fetchFacilities();
      return;
    }

    try {
      let loc = await Location.getCurrentPositionAsync({});
      setLocation(loc);
      fetchFacilities(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
       fetchFacilities();
    }
  };

  useEffect(() => {
    initLocationAndFetch();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    if (location) {
      fetchFacilities(location.coords.latitude, location.coords.longitude);
    } else {
      initLocationAndFetch();
    }
  };

  const centerOnLocation = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const categories = [
    { title: 'Airport', icon: 'airplane', color: '#6366F1' },
    { title: 'Mall', icon: 'cart', color: '#EC4899' },
    { title: 'Office', icon: 'business', color: '#10B981' },
    { title: 'Hospital', icon: 'medkit', color: '#EF4444' },
  ];

  const renderMapView = () => (
    <View style={styles.mapContainer}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={{
          latitude: location?.coords.latitude || 28.6139,
          longitude: location?.coords.longitude || 77.2090,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        customMapStyle={mapAppearance}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {nearbyFacilities.map((facility) => (
          <Marker
            key={facility.id}
            coordinate={{
              latitude: Number(facility.latitude),
              longitude: Number(facility.longitude),
            }}
          >
            <Animated.View style={[styles.customMarker, animatedMarkerStyle]}>
              <View style={styles.markerPriceContainer}>
                <Text style={styles.markerCurrency}>₹</Text>
                <Text style={styles.markerPrice}>{Math.round(Number(facility.pricing_rules[0]?.hourly_rate || 0))}</Text>
              </View>
              <View style={styles.markerArrow} />
            </Animated.View>
            <Callout 
              tooltip 
              onPress={() => router.push(`/(customer)/facility/${facility.id}`)}
              style={styles.callout}
            >
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{facility.name}</Text>
                <Text style={styles.calloutSubtitle}>{facility.address.substring(0, 30)}...</Text>
                <View style={styles.calloutFooter}>
                  <Text style={styles.calloutAction}>View Details</Text>
                  <Ionicons name="chevron-forward" size={14} color={colors.primary} />
                </View>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      <TouchableOpacity 
        style={styles.myLocationButton} 
        onPress={centerOnLocation}
        activeOpacity={0.8}
      >
        <Ionicons name="locate" size={24} color={colors.primary} />
      </TouchableOpacity>

      <View style={styles.mapOverlayTop}>
        <GlassCard 
          style={styles.searchBarFloating}
          onPress={() => router.push('/(customer)/search')}
        >
          <Ionicons name="search" size={20} color={colors.textSecondary} />
          <Text style={styles.searchText}>Search for parking...</Text>
        </GlassCard>
      </View>

      <View style={styles.mapOverlayBottom}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalFacilities}
          snapToInterval={width * 0.8 + 16}
          decelerationRate="fast"
        >
          {nearbyFacilities.map((facility) => (
            <ParkingFacilityCard 
              key={facility.id} 
              facility={facility} 
              onPress={() => router.push(`/(customer)/facility/${facility.id}`)}
              style={styles.horizontalCard}
              distance={facility.distance}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );

  const renderListView = () => (
    <View style={styles.listContainer}>
      <Animated.View style={[styles.header, headerStyle]}>
        <LinearGradient
          colors={colors.gradients.premium}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Animated.View style={[styles.headerContent, headerTitleStyle]}>
          <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}</Text>
          <Text style={styles.title}>Where are you{'\n'}parking today?</Text>
        </Animated.View>
        
        <View style={styles.searchContainer}>
          <GlassCard 
            style={styles.searchBar}
            onPress={() => router.push('/(customer)/search')}
          >
            <Ionicons name="search" size={20} color={colors.textPrimary} />
            <Text style={styles.searchText}>Search for parking...</Text>
          </GlassCard>
        </View>
      </Animated.View>

      <Animated.ScrollView 
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        <View style={styles.categorySection}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryList}>
            {categories.map((cat, idx) => (
              <TouchableOpacity key={idx} style={styles.categoryItem} activeOpacity={0.7}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '15' }]}>
                  <Ionicons name={cat.icon as any} size={24} color={cat.color} />
                </View>
                <Text style={styles.categoryTitle}>{cat.title}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Nearby Locations</Text>
            <TouchableOpacity onPress={() => setViewMode('map')}>
              <Text style={styles.seeAll}>Show Map</Text>
            </TouchableOpacity>
          </View>
          
          {loading ? (
            <View style={styles.listContent}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                {[1, 2, 3].map((i) => (
                  <View key={i} style={{ width: 290, gap: 12 }}>
                    <Skeleton width={290} height={140} borderRadius={24} />
                    <Skeleton width={200} height={20} />
                    <Skeleton width={150} height={15} />
                  </View>
                ))}
              </ScrollView>
            </View>
          ) : nearbyFacilities.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {nearbyFacilities.map((facility) => (
                <ParkingFacilityCard 
                  key={facility.id} 
                  facility={facility} 
                  onPress={() => router.push(`/(customer)/facility/${facility.id}`)}
                  distance={facility.distance}
                />
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              icon="location-outline"
              title="None nearby"
              subtitle="We couldn't find any facilities in your immediate area."
              actionLabel="Search Everywhere"
              onAction={() => router.push('/(customer)/search')}
            />
          )}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
          </View>
          
          {loading ? (
             <View style={styles.listContent}>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
                 {[1, 2, 3].map((i) => (
                   <View key={i} style={{ width: 290, gap: 12 }}>
                     <Skeleton width={290} height={100} borderRadius={24} />
                     <Skeleton width={180} height={18} />
                   </View>
                 ))}
               </ScrollView>
             </View>
          ) : recentFacilities.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContent}>
              {recentFacilities.map((facility, index) => (
                <ParkingFacilityCard 
                  key={`${facility.id}-${index}`} 
                  facility={facility} 
                  onPress={() => router.push(`/(customer)/facility/${facility.id}`)}
                />
              ))}
            </ScrollView>
          ) : (
            <EmptyState
              icon="time-outline"
              title="No history"
              subtitle="Your recently visited parking spots will show up here."
            />
          )}
        </View>
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle={viewMode === 'list' ? 'light-content' : 'dark-content'} />
      {viewMode === 'list' ? renderListView() : renderMapView()}
      
      <TouchableOpacity 
        style={styles.viewToggle}
        onPress={() => setViewMode(viewMode === 'list' ? 'map' : 'list')}
        activeOpacity={0.9}
      >
        <Ionicons name={viewMode === 'list' ? 'map' : 'list'} size={24} color="white" />
        <Text style={styles.toggleText}>{viewMode === 'list' ? 'Map View' : 'List View'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    flex: 1,
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: HEADER_MAX_HEIGHT + 20,
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: 'hidden',
  },
  headerContent: {
    paddingTop: 60,
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    lineHeight: 38,
    letterSpacing: -1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  searchContainer: {
    position: 'absolute',
    bottom: -25,
    left: 24,
    right: 24,
    zIndex: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    gap: 12,
  },
  searchBarFloating: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 24,
    width: width - 48,
    gap: 12,
  },
  searchText: {
    color: colors.textSecondary,
    fontSize: 16,
    fontWeight: '500',
  },
  categorySection: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  categoryList: {
    gap: 20,
    paddingVertical: 10,
  },
  categoryItem: {
    alignItems: 'center',
    gap: 8,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  section: {
    marginTop: 32,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
  },
  listContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  viewToggle: {
    position: 'absolute',
    bottom: 30,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    paddingHorizontal: 28,
    borderRadius: 35,
    ...colors.shadows.premium,
    gap: 12,
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  mapContainer: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  mapOverlayTop: {
    position: 'absolute',
    top: 60,
    left: 24,
    right: 24,
  },
  mapOverlayBottom: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
  },
  horizontalFacilities: {
    paddingHorizontal: 24,
    gap: 16,
  },
  horizontalCard: {
    width: width * 0.8,
    marginRight: 0,
  },
  myLocationButton: {
    position: 'absolute',
    right: 20,
    top: 140,
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...colors.shadows.md,
  },
  customMarker: {
    alignItems: 'center',
  },
  markerPriceContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    ...colors.shadows.md,
  },
  markerCurrency: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    marginRight: 1,
  },
  markerPrice: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
  },
  markerArrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -2,
  },
  callout: {
    width: 220,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    width: '100%',
    ...colors.shadows.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  calloutSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  calloutFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12,
    justifyContent: 'flex-end',
    gap: 4,
  },
  calloutAction: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
  }
});
;

