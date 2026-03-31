import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  FlatList, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  ActivityIndicator
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { get } from '../../services/api';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { colors, VEHICLE_TYPE_COLORS } from '../../constants/colors';
import { ParkingFacility, VehicleType } from '../../types';
import { EmptyState } from '../../components/EmptyState';

const VEHICLE_FILTERS: { label: string; value: VehicleType; icon: any }[] = [
  { label: 'Bike', value: 'bike', icon: 'bicycle' },
  { label: 'Scooter', value: 'scooter', icon: 'bicycle-outline' },
  { label: 'Car', value: 'car', icon: 'car' },
  { label: 'Truck', value: 'truck', icon: 'bus' },
];

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [results, setResults] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string, type: VehicleType | null) => {
    setLoading(true);
    try {
      let url = `/parking/search?query=${encodeURIComponent(q)}`;
      if (type) url += `&vehicle_type=${type}`;
      const res = await get(url);
      setResults(res.data.data || []);
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query, vehicleType);
    }, 400);
    return () => clearTimeout(timer);
  }, [query, vehicleType, search]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Premium Search Header */}
      <View style={styles.header}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.searchBar}>
          <Ionicons name="search" size={22} color={colors.primary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by area, name, or landmark..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {loading && <ActivityIndicator size="small" color={colors.primary} />}
          {!loading && query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </Animated.View>

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={VEHICLE_FILTERS}
          keyExtractor={(item) => item.value}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item, index }) => {
            const isActive = vehicleType === item.value;
            const accentColor = VEHICLE_TYPE_COLORS[item.value];
            return (
              <Animated.View entering={FadeInDown.delay(index * 80)}>
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isActive && { backgroundColor: accentColor, borderColor: accentColor }
                  ]}
                  onPress={() => setVehicleType(isActive ? null : item.value)}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={item.icon} 
                    size={14} 
                    color={isActive ? 'white' : colors.textSecondary} 
                  />
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            );
          }}
        />
      </View>

      {results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.resultWrapper}>
              <ParkingFacilityCard 
                facility={item}
                onPress={() => router.push(`/(customer)/facility/${item.id}`)}
              />
            </View>
          )}
          ListHeaderComponent={
            <Text style={styles.resultsCount}>{results.length} SPOT{results.length > 1 ? 'S' : ''} FOUND</Text>
          }
        />
      ) : (
        <EmptyState
          icon={query.length > 0 ? "search-outline" : "map-outline"}
          title={query.length > 0 ? "No spots match your search" : "Discover Nearby Parking"}
          subtitle={query.length > 0 
            ? "Try a different keyword, area, or vehicle type." 
            : "Start typing an area, landmark, or parking name to find available spots."}
          actionLabel={query.length > 0 ? "Clear Filters" : undefined}
          onAction={query.length > 0 ? () => { setQuery(''); setVehicleType(null); } : undefined}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 12,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...colors.shadows.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    borderRadius: 20,
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.primary + '30',
    marginBottom: 16,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  clearBtn: {
    padding: 4,
  },
  filtersContent: {
    paddingHorizontal: 20,
    gap: 8,
    paddingBottom: 4,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: 'white',
  },
  resultsList: {
    padding: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 16,
    textAlign: 'center',
  },
  resultWrapper: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
});
