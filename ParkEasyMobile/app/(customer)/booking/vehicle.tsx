import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  ScrollView, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Dimensions, 
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, FadeInRight } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { get } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { colors, VEHICLE_TYPE_COLORS } from '../../../constants/colors';
import { Vehicle, VehicleType } from '../../../types';

const { width } = Dimensions.get('window');

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
      <StatusBar barStyle="light-content" />
      
      {/* Procedural Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '33%' }]} />
          </View>
          <Text style={styles.progressLabel}>PROTOCOL PHASE 01: VEHICLE ID</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.title}>IDENTIFY VEHICLE</Text>
          <Text style={styles.subtitle}>Specify the node to be secured in the parking matrix.</Text>
        </Animated.View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>KNOWN SIGNATURES</Text>
          {loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : savedVehicles.length > 0 ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.savedScroll}>
              {savedVehicles.map((vehicle, i) => (
                <Animated.View key={vehicle.id} entering={FadeInRight.delay(i * 100)}>
                  <TouchableOpacity onPress={() => handleSavedSelect(vehicle)}>
                    <GlassCard style={styles.vehicleCard}>
                      <View style={[styles.vehicleIcon, { backgroundColor: VEHICLE_TYPE_COLORS[vehicle.vehicle_type] + '20' }]}>
                        <Ionicons 
                          name={vehicleTypes.find(t => t.value === vehicle.vehicle_type)?.icon || 'car'} 
                          size={24} 
                          color={VEHICLE_TYPE_COLORS[vehicle.vehicle_type]} 
                        />
                      </View>
                      <Text style={styles.vehicleNumber}>{vehicle.vehicle_number}</Text>
                      <Text style={styles.vehicleNick}>{vehicle.nickname || 'PRIMARY'}</Text>
                    </GlassCard>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <Text style={styles.emptyText}>NO SAVED SIGNATURES DETECTED</Text>
            </GlassCard>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANUAL UPLINK</Text>
          <GlassCard style={styles.manualCard}>
            <Text style={styles.inputLabel}>LICENSE PLATE</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="REGISTRATION NO."
                placeholderTextColor="rgba(255,255,255,0.2)"
                value={manualNumber}
                onChangeText={(val) => setManualNumber(val.toUpperCase())}
                autoCapitalize="characters"
                maxLength={10}
              />
              <View style={styles.inputGlow}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              </View>
            </View>
            
            <Text style={[styles.inputLabel, { marginTop: 24 }]}>NODE CLASS</Text>
            <View style={styles.typeGrid}>
              {vehicleTypes.map(type => {
                const isActive = manualType === type.value;
                return (
                  <TouchableOpacity
                    key={type.value}
                    style={[
                      styles.typeChip,
                      isActive && { borderColor: colors.primary, backgroundColor: colors.primary + '15' }
                    ]}
                    onPress={() => setManualType(type.value)}
                  >
                    <Ionicons 
                      name={type.icon as any} 
                      size={20} 
                      color={isActive ? colors.primary : 'rgba(255,255,255,0.4)'} 
                    />
                    <Text style={[styles.typeText, isActive && { color: '#FFF' }]}>
                      {type.label.toUpperCase()}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </GlassCard>
        </View>
        <View style={{ height: 140 }} />
      </ScrollView>

      <View style={styles.footer}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <GlassButton 
          label="PROCEED TO PROTOCOL PHASE 02" 
          onPress={handleManualContinue} 
          disabled={!isManualValid}
          variant="primary"
        />
      </View>
    </KeyboardAvoidingView>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 20,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  progressContainer: {
    flex: 1,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  progressLabel: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingVertical: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFF',
    paddingHorizontal: 24,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    paddingHorizontal: 24,
    marginTop: 4,
    lineHeight: 20,
    marginBottom: 32,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    marginHorizontal: 24,
    marginBottom: 16,
    letterSpacing: 3,
  },
  savedScroll: {
    paddingLeft: 24,
    paddingRight: 8,
    gap: 16,
  },
  vehicleCard: {
    width: 160,
    padding: 20,
    alignItems: 'center',
    borderRadius: 24,
  },
  vehicleIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  vehicleNumber: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  vehicleNick: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    marginTop: 4,
    letterSpacing: 1,
  },
  loader: {
    alignSelf: 'flex-start',
    marginLeft: 40,
  },
  emptyCard: {
    marginHorizontal: 24,
    padding: 30,
    alignItems: 'center',
    borderRadius: 24,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  emptyText: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  manualCard: {
    marginHorizontal: 24,
    borderRadius: 32,
    padding: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 12,
    letterSpacing: 2,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 20,
    padding: 20,
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 4,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  inputGlow: {
    position: 'absolute',
    bottom: -10,
    alignSelf: 'center',
    width: '60%',
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primaryGlow,
    overflow: 'hidden',
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  typeChip: {
    flex: 1,
    minWidth: '45%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    gap: 12,
  },
  typeText: {
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '900',
    fontSize: 11,
    letterSpacing: 1,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  }
});
