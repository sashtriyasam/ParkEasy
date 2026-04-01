import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
  StatusBar,
  Pressable
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import Animated, {
  FadeInDown,
  FadeInUp,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming
} from 'react-native-reanimated';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { get } from '../../services/api';
import { colors } from '../../constants/colors';
import { ParkingFacility } from '../../types';
import { useAuthStore } from '../../store/authStore';
import { mapAppearance } from '../../constants/mapAppearance';
import { GlassCard } from '../../components/ui/GlassCard';

const { width } = Dimensions.get('window');
const DASHBOARD_HEIGHT = 280;
const CARD_WIDTH = 280;
const CARD_GAP = 16;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const mapRef = useRef<MapView>(null);

  const [loading, setLoading] = useState(true);
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [activeFilter, setActiveFilter] = useState('All');
  const pulse = useSharedValue(1);
  const insets = useSafeAreaInsets();
  
  

  const filteredFacilities = useMemo(() => {
    if (activeFilter === 'All') return facilities;
    
    return facilities.filter(f => {
      switch (activeFilter) {
        case 'Near Me':
          return (f.distance || 0) <= 5; // Within 5km
        case 'Low Price':
          return (f.price_per_hour || 0) <= 100;
        case 'Fast Valet':
          return f.amenities?.some(a => a.toLowerCase().includes('valet'));
        case 'EV Ready':
          return f.amenities?.some(a => a.toLowerCase().includes('ev'));
        default:
          return true;
      }
    });
  }, [facilities, activeFilter]);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1500 }),
        withTiming(1, { duration: 1500 })
      ),
      -1,
      true
    );
    initLocationAndFetch();
  }, []);

  const initLocationAndFetch = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      fetchFacilities();
      return;
    }

    try {
      const loc = await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Location timeout')), 5000)
        )
      ]);
      setLocation(loc);
      fetchFacilities(loc.coords.latitude, loc.coords.longitude);
    } catch (error) {
      fetchFacilities();
    }
  };

  const fetchFacilities = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      const url = lat && lon ? `/parking/search?lat=${lat}&lon=${lon}&limit=12` : `/parking/search?limit=12`;
      const res = await get(url);
      setFacilities(res?.data?.data || []);
    } catch (e) {
      console.error(e);
      // Consider showing a toast or error state to the user
    } finally {
      setLoading(false);
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

  const filters = ['All', 'Near Me', 'Low Price', 'Fast Valet', 'EV Ready'];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Hero Map Component */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        customMapStyle={mapAppearance}
        initialRegion={{
          latitude: 19.0760,
          longitude: 72.8777,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        {filteredFacilities.filter(f => f.latitude != null && f.longitude != null).map((f) => (
          <Marker
            key={f.id}
            coordinate={{ latitude: Number(f.latitude), longitude: Number(f.longitude) }}
            onPress={() => router.push(`/(customer)/facility/${f.id}`)}
          >
            <View style={styles.markerContainer}>
              <View style={styles.markerBadge}>
                <Text style={styles.markerPrice}>₹{Math.round(f.price_per_hour || 0)}</Text>
              </View>
              <View style={styles.markerTriangle} />
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Floating Header Protocol */ }
  <View style={styles.floatingHeader}>
    <Animated.View entering={FadeInDown.delay(200).duration(800)}>
      <GlassCard style={styles.searchCard}>
        <Pressable style={styles.searchInner} onPress={() => router.push('/(customer)/search')}>
          <Ionicons name="search" size={20} color={colors.primary} />
          <Text style={styles.searchPlaceholder}>Search premium parking nodes...</Text>
          <View style={styles.searchDivider} />
          <Ionicons name="options-outline" size={20} color={colors.textSecondary} />
        </Pressable>
      </GlassCard>
    </Animated.View>

    <Animated.ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.filterScroll}
      contentContainerStyle={styles.filterContent}
      entering={FadeInDown.delay(400).duration(800)}
    >
      {filters.map((f) => (
        <TouchableOpacity
          key={f}
          onPress={() => setActiveFilter(activeFilter === f ? 'All' : f)}
          style={[
            styles.filterPill,
            activeFilter === f && styles.filterPillActive
          ]}
        >
          <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
          <Text style={[
            styles.filterText,
            activeFilter === f && styles.filterTextActive
          ]}>{f}</Text>
        </TouchableOpacity>
      ))}
    </Animated.ScrollView>
  </View>

  {/* Map Actions */ }
  <View style={[styles.mapActions, { bottom: DASHBOARD_HEIGHT + insets.bottom + 20 }]}>
    <TouchableOpacity style={styles.actionBtn} onPress={centerOnLocation}>
      <BlurView intensity={30} tint="dark" style={styles.actionBlur}>
        <Ionicons name="navigate" size={22} color="#FFF" />
      </BlurView>
    </TouchableOpacity>
  </View>

  {/* Discovery Dashboard (Horizontal List) */ }
  <View style={styles.bottomDashboard}>
    <View style={styles.dashboardHeader}>
      <Text style={styles.dashboardTitle}>NEARBY DISCOVERIES</Text>
      <TouchableOpacity onPress={() => router.push('/(customer)/search')}>
        <Text style={styles.seeAll}>SEE ALL</Text>
      </TouchableOpacity>
    </View>

    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.cardScrollContent}
      snapToInterval={CARD_WIDTH + CARD_GAP}
      decelerationRate="fast"
    >
      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginLeft: 24 }} />
      ) : (
        filteredFacilities.map((f, i) => (
          <Animated.View key={f.id} entering={FadeInUp.delay(600 + i * 100)}>
            <ParkingFacilityCard
              facility={f}
              distance={f.distance}
              onPress={() => router.push(`/(customer)/facility/${f.id}`)}
              style={{ width: CARD_WIDTH, marginRight: CARD_GAP }}
            />
          </Animated.View>
        ))
      )}
    </ScrollView>
  </View>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  map: {
    flex: 1,
  },
  floatingHeader: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 60 : 40,
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    zIndex: 10,
  },
  searchCard: {
    padding: 0,
    height: 56,
    borderRadius: 28,
  },
  searchInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  searchPlaceholder: {
    flex: 1,
    color: colors.textSecondary,
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  searchDivider: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginHorizontal: 12,
  },
  filterScroll: {
    marginTop: 16,
  },
  filterContent: {
    gap: 10,
    paddingRight: 20,
  },
  filterPill: {
    height: 36,
    paddingHorizontal: 16,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 13,
    fontWeight: '700',
  },
  filterTextActive: {
    color: '#FFF',
  },
  mapActions: {
    position: 'absolute',
    right: 20,
    gap: 12,
    zIndex: 10,
  },
  actionBtn: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  actionBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomDashboard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingBottom: 40,
    height: 380, // Explicit height for easier calculation
    backgroundColor: 'transparent',
  },
  dashboardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  dashboardTitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  seeAll: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
  },
  cardScrollContent: {
    paddingLeft: 24,
    paddingRight: 8,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerBadge: {
    backgroundColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFF',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
  },
  markerPrice: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '800',
  },
  markerTriangle: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: colors.primary,
    marginTop: -2,
  }
});
