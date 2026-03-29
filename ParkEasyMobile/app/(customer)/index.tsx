import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { get } from '../../services/api';
import { colors } from '../../constants/colors';
import { ParkingFacility } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [nearbyFacilities, setNearbyFacilities] = useState<ParkingFacility[]>([]);
  const [recentFacilities, setRecentFacilities] = useState<ParkingFacility[]>([]);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const fetchFacilities = async (lat?: number, lon?: number) => {
    try {
      setLoading(true);
      const url = (lat && lon) 
        ? `/parking/search?lat=${lat}&lon=${lon}&limit=5` 
        : `/parking/search?limit=5`;
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <ScrollView 
      style={styles.container}
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
          <Text style={styles.sectionTitle}>Nearby</Text>
        </View>
        
        {loading ? (
          <View style={styles.skeletonContainer}>
            <View style={styles.skeletonCard} />
            <View style={styles.skeletonCard} />
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
          <Text style={styles.sectionTitle}>Recent</Text>
        </View>
        
        {loading ? (
           <View style={styles.skeletonContainer}>
            <View style={styles.skeletonCard} />
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    backgroundColor: colors.surface,
    paddingTop: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  greeting: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 8,
  },
  searchText: {
    color: colors.textMuted,
    fontSize: 16,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 24,
  },
  emptyText: {
    paddingHorizontal: 24,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  skeletonContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    gap: 16,
  },
  skeletonCard: {
    width: 280,
    height: 200,
    backgroundColor: colors.border,
    borderRadius: 12,
    opacity: 0.5,
  },
});
