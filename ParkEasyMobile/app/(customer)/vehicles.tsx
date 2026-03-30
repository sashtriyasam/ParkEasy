import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { get, post, del } from '../../services/api';
import { Vehicle, VehicleType } from '../../types';

export default function VehiclesScreen() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [newVehicle, setNewVehicle] = useState({
    vehicle_number: '',
    vehicle_type: 'car' as VehicleType,
    nickname: '',
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const res = await get('/customer/vehicles');
      setVehicles(res.data.data);
    } catch (e) {
      console.error('Error fetching vehicles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleAddVehicle = async () => {
    if (!newVehicle.vehicle_number) {
      Alert.alert('Error', 'Please enter vehicle number');
      return;
    }
    try {
      await post('/customer/vehicles', newVehicle);
      setModalVisible(false);
      setNewVehicle({ vehicle_number: '', vehicle_type: 'car', nickname: '' });
      fetchVehicles();
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to add vehicle');
    }
  };

  const handleDeleteVehicle = (id: string) => {
    Alert.alert('Delete Vehicle', 'Are you sure you want to remove this vehicle?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Delete', 
        style: 'destructive', 
        onPress: async () => {
          try {
            await del(`/customer/vehicles/${id}`);
            fetchVehicles();
          } catch (e) {
            Alert.alert('Error', 'Failed to delete vehicle');
          }
        }
      }
    ]);
  };

  const renderVehicle = ({ item }: { item: Vehicle }) => (
    <Card style={styles.vehicleCard}>
      <View style={styles.vehicleIconBox}>
        <Ionicons 
          name={item.vehicle_type === 'car' ? 'car' : item.vehicle_type === 'bike' ? 'bicycle' : 'bus'} 
          size={32} 
          color={colors.primary} 
        />
      </View>
      <View style={styles.vehicleDetails}>
        <Text style={styles.vehiclePlate}>{item.vehicle_number.toUpperCase()}</Text>
        <Text style={styles.vehicleType}>{item.nickname || item.vehicle_type.toUpperCase()}</Text>
      </View>
      <TouchableOpacity onPress={() => handleDeleteVehicle(item.id)}>
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </Card>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Vehicles</Text>
        <Text style={styles.subtitle}>Manage your vehicles for quick booking</Text>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={vehicles}
          renderItem={renderVehicle}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="car-outline" size={64} color={colors.textMuted} />
              <Text style={styles.emptyText}>No vehicles added yet</Text>
            </View>
          }
        />
      )}

      <Button 
        label="Add New Vehicle" 
        onPress={() => setModalVisible(true)} 
        style={styles.fab}
      />

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Vehicle</Text>
            
            <TextInput
              style={styles.input}
              placeholder="Vehicle Number (e.g. MH12AB1234)"
              value={newVehicle.vehicle_number}
              onChangeText={(text) => setNewVehicle({...newVehicle, vehicle_number: text})}
              autoCapitalize="characters"
            />
            
            <TextInput
              style={styles.input}
              placeholder="Nickname (Optional)"
              value={newVehicle.nickname}
              onChangeText={(text) => setNewVehicle({...newVehicle, nickname: text})}
            />

            <View style={styles.typeRow}>
              {(['car', 'bike', 'scooter', 'truck'] as VehicleType[]).map((type) => (
                <TouchableOpacity 
                  key={type}
                  style={[styles.typeBtn, newVehicle.vehicle_type === type && styles.typeBtnActive]}
                  onPress={() => setNewVehicle({...newVehicle, vehicle_type: type})}
                >
                  <Text style={[styles.typeBtnText, newVehicle.vehicle_type === type && styles.typeBtnTextActive]}>
                    {type.toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <Button label="Cancel" variant="secondary" style={{ flex: 1 }} onPress={() => setModalVisible(false)} />
              <View style={{ width: 16 }} />
              <Button label="Save" style={{ flex: 1 }} onPress={handleAddVehicle} />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  list: {
    paddingBottom: 100,
  },
  vehicleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 16,
    backgroundColor: colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },
  vehicleIconBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  vehicleDetails: {
    flex: 1,
  },
  vehiclePlate: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  vehicleType: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  fab: {
    position: 'absolute',
    bottom: 110,
    left: 20,
    right: 20,
    ...colors.shadows.lg,
  },
  empty: {
    alignItems: 'center',
    marginTop: 100,
  },
  emptyText: {
    color: colors.textMuted,
    marginTop: 16,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 30,
    ...colors.shadows.lg,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    color: colors.textPrimary,
  },
  input: {
    backgroundColor: colors.background,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  typeBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeBtnActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.textSecondary,
  },
  typeBtnTextActive: {
    color: 'white',
  },
  modalActions: {
    flexDirection: 'row',
  }
});
