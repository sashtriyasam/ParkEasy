import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../services/api';
import { ParkingFacilityCard } from '../../components/ParkingFacilityCard';
import { colors, VEHICLE_TYPE_COLORS } from '../../constants/colors';
import { ParkingFacility, VehicleType } from '../../types';
import { EmptyState } from '../../components/EmptyState';

export default function SearchScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType | null>(null);
  const [results, setResults] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(false);

  const vehicleTypes: { label: string; value: VehicleType }[] = [
    { label: 'Bike', value: 'bike' },
    { label: 'Scooter', value: 'scooter' },
    { label: 'Car', value: 'car' },
    { label: 'Truck', value: 'truck' },
  ];

  const search = useCallback(async (q: string, type: VehicleType | null) => {
    setLoading(true);
    try {
      let url = `/parking/search?query=${encodeURIComponent(q)}`;
      if (type) {
        url += `&vehicle_type=${type}`;
      }
      const res = await get(url);
      setResults(res.data.data);
    } catch (e) {
      console.error('Search error', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      search(query, vehicleType);
    }, 500);
    return () => clearTimeout(timer);
  }, [query, vehicleType, search]);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={styles.header}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city, area, or name..."
            value={query}
            onChangeText={setQuery}
            autoFocus
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.filtersContainer}>
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={vehicleTypes}
            keyExtractor={(item) => item.value}
            renderItem={({ item }) => {
              const isActive = vehicleType === item.value;
              return (
                <TouchableOpacity
                  style={[
                    styles.chip,
                    isActive && { backgroundColor: VEHICLE_TYPE_COLORS[item.value], borderColor: VEHICLE_TYPE_COLORS[item.value] }
                  ]}
                  onPress={() => setVehicleType(isActive ? null : item.value)}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            }}
            contentContainerStyle={styles.filtersContent}
          />
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <Text style={styles.textSecondary}>Searching...</Text>
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsList}
          renderItem={({ item }) => (
            <View style={styles.resultWrapper}>
              <ParkingFacilityCard 
                facility={item}
                onPress={() => router.push(`/(customer)/facility/${item.id}`)}
              />
            </View>
          )}
        />
      ) : (
        <EmptyState
          icon="search-outline"
          title="No parking found"
          subtitle="Try adjusting your search query or vehicle type filter to find more spots."
          actionLabel="Clear Filters"
          onAction={() => { setQuery(''); setVehicleType(null); }}
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
    paddingTop: 16,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    marginHorizontal: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    height: 48,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    fontSize: 16,
    color: colors.textPrimary,
  },
  filtersContainer: {
    marginTop: 16,
  },
  filtersContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  chipTextActive: {
    color: colors.surface,
  },
  resultsList: {
    padding: 16,
    alignItems: 'center',
  },
  resultWrapper: {
    marginBottom: 16,
    width: '100%',
    alignItems: 'center',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  textSecondary: {
    color: colors.textSecondary,
  },
});
