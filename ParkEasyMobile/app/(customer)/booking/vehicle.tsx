import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { get } from '../../../services/api';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors, VEHICLE_TYPE_COLORS } from '../../../constants/colors';
import { Vehicle, VehicleType } from '../../../types';

export default function SelectVehicleScreen() {
  const router = useRouter();
  const { setVehicle, vehicle_number, vehicle_type: storeVehicleType } = useBookingFlowStore();
  
  const [savedVehicles, setSavedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [manualNumber, setManualNumber] = useState(vehicle_number || '');
  const [manualType, setManualType] = useState<VehicleType | null>(storeVehicleType || null);

  const vehicleTypes: { label: string; value: VehicleType; icon: keyof typeof Ionicons.glyphMap }[] = [
    { label: 'Bike', value: 'bike', icon: 'bicycle' },
    { label: 'Scooter', value: 'scooter', icon: 'bicycle-outline' },
    { label: 'Car', value: 'car', icon: 'car' },
    { label: 'Truck', value: 'truck', icon: 'bus' },
  ];

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await get('/customer/vehicles');
        setSavedVehicles(res.data.data || []);
      } catch (e) {
        console.error('Error fetching vehicles', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  const handleSavedSelect = (vehicle: Vehicle) => {
    setVehicle(vehicle, vehicle.vehicle_number, vehicle.vehicle_type);
    router.push('/(customer)/booking/payment');
  };

  const handleManualContinue = () => {
    if (manualNumber.trim() && manualType) {
      setVehicle(null, manualNumber.trim().toUpperCase(), manualType);
      router.push('/(customer)/booking/payment');
    }
  };

  const isManualValid = manualNumber.trim().length > 0 && manualType !== null;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '33%' }]} />
        <Text style={styles.progressText}>Step 1 of 3</Text>
      </View>

      <Text style={styles.title}>Select Vehicle</Text>

      <Text style={styles.sectionTitle}>Your Saved Vehicles</Text>
      {loading ? (
        <Text style={styles.loadingText}>Loading...</Text>
      ) : savedVehicles.length > 0 ? (
        <View style={styles.savedContainer}>
          {savedVehicles.map(vehicle => (
            <Card 
              key={vehicle.id} 
              style={styles.vehicleCard}
              onPress={() => handleSavedSelect(vehicle)}
            >
              <View style={styles.vehicleIconContainer}>
                <Ionicons 
                  name={vehicleTypes.find(t => t.value === vehicle.vehicle_type)?.icon || 'car'} 
                  size={24} 
                  color={VEHICLE_TYPE_COLORS[vehicle.vehicle_type as keyof typeof VEHICLE_TYPE_COLORS] || colors.primary} 
                />
              </View>
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleNumber}>{vehicle.vehicle_number}</Text>
                {vehicle.nickname && <Text style={styles.vehicleNickname}>{vehicle.nickname}</Text>}
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Card>
          ))}
        </View>
      ) : (
        <Text style={styles.emptyText}>No saved vehicles.</Text>
      )}

      <Text style={styles.sectionTitle}>Or enter manually</Text>
      <View style={styles.manualContainer}>
        <TextInput
          style={styles.input}
          placeholder="Vehicle Number (e.g. MH12AB1234)"
          value={manualNumber}
          onChangeText={(val) => setManualNumber(val.toUpperCase())}
          autoCapitalize="characters"
          maxLength={10}
        />
        
        <Text style={styles.label}>Vehicle Type</Text>
        <View style={styles.typeSelectorRow}>
          {vehicleTypes.map(type => (
            <TouchableOpacity
              key={type.value}
              style={[
                styles.typeChip,
                manualType === type.value && { backgroundColor: VEHICLE_TYPE_COLORS[type.value], borderColor: VEHICLE_TYPE_COLORS[type.value] }
              ]}
              onPress={() => setManualType(type.value)}
            >
              <Text style={[styles.typeText, manualType === type.value && styles.typeTextActive]}>
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button 
          label="Continue" 
          onPress={handleManualContinue} 
          disabled={!isManualValid}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  progressContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primaryLight,
  },
  progressText: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: 'bold',
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    margin: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textSecondary,
    marginHorizontal: 24,
    marginBottom: 12,
  },
  loadingText: {
    marginHorizontal: 24,
    color: colors.textMuted,
    marginBottom: 24,
  },
  emptyText: {
    marginHorizontal: 24,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginBottom: 24,
  },
  savedContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
    gap: 12,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  vehicleIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  vehicleInfo: {
    flex: 1,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  vehicleNickname: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 2,
  },
  manualContainer: {
    paddingHorizontal: 24,
    marginBottom: 40,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 8,
  },
  typeSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  typeText: {
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeTextActive: {
    color: colors.surface,
  },
  footer: {
    marginTop: 'auto',
    padding: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
