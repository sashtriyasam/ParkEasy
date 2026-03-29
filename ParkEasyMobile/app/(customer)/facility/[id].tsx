import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../../services/api';
import { SlotGrid } from '../../../components/SlotGrid';
import { Button } from '../../../components/ui/Button';
import { colors } from '../../../constants/colors';
import { ParkingFacility, ParkingSlot } from '../../../types';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';

const { width } = Dimensions.get('window');

export default function FacilityDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  
  const [facility, setFacilityData] = useState<ParkingFacility | null>(null);
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [selectedFloor, setSelectedFloor] = useState<number>(1);
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [loading, setLoading] = useState(true);
  const { setFacility, setSlot } = useBookingFlowStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facRes, slotsRes] = await Promise.all([
          get(`/parking/facilities/${id}`),
          get(`/parking/facilities/${id}/slots`)
        ]);
        setFacilityData(facRes.data.data);
        setSlots(slotsRes.data.data);
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
      <View style={styles.center}>
        <Text style={{color: colors.textSecondary}}>Loading...</Text>
      </View>
    );
  }

  const floors = Array.from({ length: facility.floors }, (_, i) => i + 1);
  const floorSlots = slots.filter(s => s.floor === selectedFloor);

  return (
    <View style={styles.container}>
      <ScrollView>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false}>
          {(facility.images?.length ? facility.images : ['https://via.placeholder.com/400x200']).map((img, idx) => (
            <Image key={idx} source={img} style={styles.image} contentFit="cover" />
          ))}
        </ScrollView>
        
        <View style={styles.content}>
          <Text style={styles.name}>{facility.name}</Text>
          <View style={styles.row}>
            <Ionicons name="star" size={16} color={colors.warning} />
            <Text style={styles.rating}>{facility.rating} ({facility.review_count} reviews)</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="location" size={16} color={colors.textSecondary} />
            <Text style={styles.address}>{facility.address}, {facility.city}</Text>
          </View>
          <View style={styles.row}>
            <Ionicons name="time" size={16} color={colors.textSecondary} />
            <Text style={styles.hours}>{facility.operating_hours}</Text>
          </View>
          
          <Text style={styles.description}>{facility.description}</Text>
          
          <Text style={styles.sectionTitle}>Available Slots</Text>
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
                <Text style={[styles.floorTabText, selectedFloor === floor && styles.floorTabTextActive]}>
                  Floor {floor}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          
          <View style={styles.slotsContainer}>
             <SlotGrid 
               slots={floorSlots} 
               onSlotPress={(slot) => setSelectedSlot(slot)} 
               selectedSlotId={selectedSlot?.id || null} 
             />
          </View>

        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <View style={styles.selectedInfo}>
          <Text style={styles.selectedLabel}>Selected Slot</Text>
          <Text style={styles.selectedValue}>{selectedSlot ? `${selectedSlot.slotNumber} (Floor ${selectedSlot.floor})` : 'None'}</Text>
        </View>
        <Button 
          label="Book Now" 
          onPress={handleBookNow} 
          disabled={!selectedSlot} 
          style={styles.bookButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width,
    height: 200,
  },
  content: {
    padding: 24,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  address: {
    fontSize: 14,
    color: colors.textSecondary,
    flex: 1,
  },
  hours: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  description: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 24,
    marginBottom: 16,
  },
  floorTabs: {
    marginBottom: 16,
  },
  floorTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: 8,
  },
  floorTabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  floorTabText: {
    fontSize: 14,
    color: colors.textPrimary,
  },
  floorTabTextActive: {
    color: colors.surface,
    fontWeight: 'bold',
  },
  slotsContainer: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    minHeight: 300,
  },
  bottomBar: {
    backgroundColor: colors.surface,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectedInfo: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  selectedValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  bookButton: {
    width: 120,
  },
});
