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
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { get } from '../../services/api';
import { colors } from '../../constants/colors';
import { ParkingFacility } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { mapAppearance } from '../../constants/mapAppearance';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const mapRef = useRef<MapView>(null);
  
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
      const uniqueIds = new Set();
      const recents: ParkingFacility[] = [];
      tickets.forEach((t: any) => {
        if (!uniqueIds.has(t.facility.id) && recents.length < 3) {
          uniqueIds.add(t.facility.id);
          recents.push(t.facility);
        }
      });
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
            onPress={() => {}}
          >
            <View style={styles.customMarker}>
              <View style={styles.markerPriceContainer}>
                <Text style={styles.markerCurrency}>₹</Text>
                <Text style={styles.markerPrice}>{Math.round(Number(facility.pricing_rules[0]?.hourly_rate || 0))}</Text>
              </View>
              <View style={styles.markerArrow} />
            </View>
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
        <TouchableOpacity 
          style={styles.searchBarFloating}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.9}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text style={styles.searchText}>Search for parking...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.mapOverlayBottom}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.horizontalFacilities}
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
    <ScrollView 
      style={styles.scrollContainer}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />}
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>{getGreeting()}, {user?.name?.split(' ')[0] || 'User'}</Text>
        <Text style={styles.title}>Where are you parking today?</Text>
        
        <TouchableOpacity 
          style={styles.searchBar}
          onPress={() => router.push('/(customer)/search')}
          activeOpacity={0.8}
        >
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <Text style={styles.searchText}>Search for parking...</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nearby Locations</Text>
          <TouchableOpacity onPress={() => setViewMode('map')}>
            <Text style={styles.seeAll}>Show Map</Text>
          </TouchableOpacity>
        </View>
        
        {loading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
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
          <Text style={styles.sectionTitle}>Recents</Text>
        </View>
        
        {loading ? (
           <ActivityIndicator color={colors.primary} style={{ marginTop: 20 }} />
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
    </ScrollView>
  );

  return (
    <View style={styles.container}>
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
  scrollContainer: {
    flex: 1,
  },
  header: {
    padding: 24,
    backgroundColor: colors.surface,
    paddingTop: 60,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 20,
  },
  greeting: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 12,
  },
  searchBarFloating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 16,
    width: width - 48,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
    gap: 12,
  },
  searchText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  section: {
    marginTop: 28,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
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
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
    gap: 10,
  },
  toggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
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
    bottom: 110,
    left: 0,
    right: 0,
  },
  horizontalFacilities: {
    paddingHorizontal: 24,
    gap: 16,
  },
  horizontalCard: {
    width: width * 0.75,
    marginRight: 0,
  },
  myLocationButton: {
    position: 'absolute',
    right: 20,
    top: 130,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  customMarker: {
    alignItems: 'center',
  },
  markerPriceContainer: {
    backgroundColor: colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'white',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
    fontWeight: '800',
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
    width: 200,
  },
  calloutContainer: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
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
    marginTop: 10,
    justifyContent: 'flex-end',
    gap: 4,
  },
  calloutAction: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '700',
  }
});

