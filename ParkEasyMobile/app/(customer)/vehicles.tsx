import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, Platform, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { get, post, del } from '../../services/api';
import { Vehicle, VehicleType } from '../../types';

const { width } = Dimensions.get('window');

const VEHICLE_TYPES: { type: VehicleType; icon: any; label: string }[] = [
  { type: 'car', icon: 'car', label: 'Car' },
  { type: 'bike', icon: 'bicycle', label: 'Bike' },
  { type: 'scooter', icon: 'moped', label: 'Scooter' },
  { type: 'truck', icon: 'bus', label: 'Other' },
];

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '',
    vehicle_type: 'car' as VehicleType,
    nickname: '',
  });

  const fetchVehicles = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await get('/customer/vehicles');
      setVehicles(res.data.data || []);
    } catch (e) {
      console.error('Error fetching vehicles', e);
    } finally {
      if (showLoading) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!newVehicle.vehicle_number) {
      Alert.alert('Incomplete Info', 'Please provide a vehicle plate number.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await post('/customer/vehicles', newVehicle);
      setModalVisible(false);
      setNewVehicle({ vehicle_number: '', vehicle_type: 'car', nickname: '' });
      fetchVehicles(false);
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteVehicle = (id: string) => {
    Alert.alert(
      'Remove Vehicle', 
      'Are you sure you want to remove this vehicle from your account?', 
      [
        { text: 'Keep It', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive', 
          onPress: async () => {
            try {
              await del(`/customer/vehicles/${id}`);
              fetchVehicles(false);
            } catch (e) {
              Alert.alert('Error', 'Failed to remove vehicle.');
            }
          }
        }
      ]
    );
  };

  const renderVehicle = ({ item, index }: { item: Vehicle; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <GlassCard style={styles.vehicleCard} intensity={40}>
        <View style={[styles.vehicleIconBox, { backgroundColor: colors.primary + '15' }]}>
          <Ionicons 
            name={(VEHICLE_TYPES.find(t => t.type === item.vehicle_type)?.icon || 'car') as any} 
            size={28} 
            color={colors.primary} 
          />
        </View>
        <View style={styles.vehicleDetails}>
          <Text style={styles.vehiclePlate}>{item.vehicle_number.toUpperCase()}</Text>
          <Text style={styles.vehicleType}>{item.nickname || item.vehicle_type.toUpperCase()}</Text>
        </View>
        <TouchableOpacity 
          onPress={() => handleDeleteVehicle(item.id)}
          style={styles.deleteBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color={colors.danger} />
        </TouchableOpacity>
      </GlassCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Garage</Text>
        <Text style={styles.subtitle}>Save your vehicles for a faster booking experience</Text>
      </View>

      {loading ? (
        <View style={styles.list}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} width="100%" height={90} borderRadius={24} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={() => fetchVehicles(false)}
          refreshing={refreshing}
          ListEmptyComponent={
            <Animated.View entering={FadeInDown} style={styles.empty}>
              <View style={styles.emptyIconCircle}>
                <Ionicons name="car-outline" size={60} color={colors.textMuted} />
              </View>
              <Text style={styles.emptyText}>Your garage is empty</Text>
              <Text style={styles.emptySub}>Add a vehicle to get started with seamless parking</Text>
            </Animated.View>
          }
        />
      )}

      <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.fabContainer}>
        <Button 
          label="Add New Vehicle" 
          onPress={() => setModalVisible(true)} 
          variant="primary"
          icon="add"
          style={styles.addBtn}
        />
      </Animated.View>

      <Modal visible={modalVisible} animationType="fade" transparent onRequestClose={() => setModalVisible(false)}>
        <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Vehicle</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={24} color={colors.textPrimary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>PLATE NUMBER</Text>
              <TextInput
                style={styles.input}
                placeholder="MH12AB1234"
                placeholderTextColor={colors.textMuted}
                value={newVehicle.vehicle_number}
                onChangeText={(text) => setNewVehicle({...newVehicle, vehicle_number: text.toUpperCase()})}
                autoCapitalize="characters"
              />
            </View>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>NICKNAME (OPTIONAL)</Text>
              <TextInput
                style={styles.input}
                placeholder="My Awesome Car"
                placeholderTextColor={colors.textMuted}
                value={newVehicle.nickname}
                onChangeText={(text) => setNewVehicle({...newVehicle, nickname: text})}
              />
            </View>

            <Text style={styles.inputLabel}>VEHICLE TYPE</Text>
            <View style={styles.typeGrid}>
              {VEHICLE_TYPES.map((v) => (
                <TouchableOpacity 
                  key={v.type}
                  style={[styles.typeOption, newVehicle.vehicle_type === v.type && styles.typeOptionActive]}
                  onPress={() => setNewVehicle({...newVehicle, vehicle_type: v.type})}
                  activeOpacity={0.8}
                >
                  <Ionicons 
                    name={v.icon} 
                    size={22} 
                    color={newVehicle.vehicle_type === v.type ? 'white' : colors.textSecondary} 
                  />
                  <Text style={[styles.typeLabel, newVehicle.vehicle_type === v.type && styles.typeLabelActive]}>
                    {v.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Button 
              label={isSubmitting ? "Saving..." : "Save Vehicle"} 
              onPress={handleAddVehicle} 
              loading={isSubmitting}
              style={styles.saveBtn}
            />
          </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    paddingBottom: 32,
    backgroundColor: 'white',
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...colors.shadows.sm,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
    marginTop: 6,
    lineHeight: 20,
  },
  list: {
    padding: 24,
    paddingBottom: 150,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: 0.5,
  },
  vehicleType: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '700',
    textTransform: 'uppercase',
    marginTop: 4,
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.danger + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fabContainer: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  addBtn: {
    borderRadius: 20,
    height: 60,
    ...colors.shadows.md,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 32,
    paddingTop: 24,
    ...colors.shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  input: {
    backgroundColor: colors.primaryLight,
    padding: 18,
    borderRadius: 20,
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  typeOption: {
    flex: 1,
    height: 80,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  typeOptionActive: {
    backgroundColor: colors.primary,
  },
  typeLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textSecondary,
  },
  typeLabelActive: {
    color: 'white',
  },
  saveBtn: {
    height: 60,
    borderRadius: 20,
  }
});
