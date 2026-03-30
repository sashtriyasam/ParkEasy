import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { post } from '../../../services/api';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../constants/colors';
import { PaymentMethod } from '../../../types';
import { PaymentSheet } from '../../../components/PaymentSheet';
import { useToast } from '../../../components/Toast';

export default function PaymentScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const { 
    facility_id, 
    facility_name, 
    selected_slot, 
    vehicle_number, 
    vehicle_type,
    setPaymentMethod,
    setCreatedTicket,
    selected_payment_method
  } = useBookingFlowStore();

  const [loading, setLoading] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  // Fallbacks if user navigated directly without data
  if (!facility_id || !selected_slot) {
    return (
      <View style={styles.center}>
        <Text>Missing booking data. Please start again.</Text>
        <Button label="Go Back" onPress={() => router.replace('/(customer)/')} style={{marginTop: 16}} />
      </View>
    );
  }

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      const payload = {
        facility_id,
        slot_id: selected_slot.id,
        vehicle_number,
        vehicle_type,
        payment_method: selected_payment_method || 'upi',
        status: 'PENDING' // Ensure backend supports initial pending state
      };

      const res = await post('/bookings', payload);
      const booking = res.data.data;
      
      setCreatedTicket(booking.id);
      setShowPaymentSheet(true);
      
    } catch (e: any) {
      console.error('Booking Creation Error', e);
      showToast(e.response?.data?.message || 'Failed to initialize booking.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = () => {
    router.replace('/(customer)/booking/success');
  };

  const costPerHour = selected_slot.price_per_hour || 0; 

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '66%' }]} />
        <Text style={styles.progressText}>Step 2 of 3</Text>
      </View>

      <Text style={styles.title}>Review & Pay</Text>

      <Card style={styles.summaryCard}>
        <Text style={styles.facilityName}>{facility_name || 'Parking Facility'}</Text>
        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.label}>Slot</Text>
            <Text style={styles.value}>{selected_slot.slot_number}</Text>
          </View>
          <View>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{vehicle_number}</Text>
            <Text style={styles.subValue}>{(vehicle_type || '').toUpperCase()}</Text>
          </View>
        </View>
      </Card>

      <Text style={styles.sectionTitle}>Estimated Cost</Text>
      <View style={styles.costContainer}>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>1 Hour</Text>
          <Text style={styles.costValue}>₹{costPerHour}</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>2 Hours</Text>
          <Text style={styles.costValue}>₹{costPerHour * 2}</Text>
        </View>
        <View style={styles.costRow}>
          <Text style={styles.costLabel}>Deposit</Text>
          <Text style={styles.costValue}>₹0</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Payment Information</Text>
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="shield-checkmark" size={20} color={colors.success} />
          <Text style={styles.infoText}>Your payment is secured with 256-bit encryption.</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={styles.infoText}>Slot will be reserved for 10 minutes upon proceeding.</Text>
        </View>
      </Card>

      <PaymentSheet
        visible={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        onSuccess={handlePaymentSuccess}
        amount={costPerHour}
        facilityName={facility_name || ''}
        bookingId={useBookingFlowStore.getState().created_ticket_id || ''}
        slotId={selected_slot.id}
        vehicleNumber={vehicle_number || ''}
        vehicleType={vehicle_type || 'car'}
      />

      <View style={styles.footer}>
        <Button 
          label="Proceed to Payment" 
          onPress={handleProceedToPayment} 
          loading={loading}
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
    padding: 24,
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
  summaryCard: {
    marginHorizontal: 24,
    padding: 16,
    marginBottom: 24,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subValue: {
    fontSize: 11,
    color: colors.textMuted,
  },
  costContainer: {
    marginHorizontal: 24,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  costLabel: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  costValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  infoCard: {
    marginHorizontal: 24,
    padding: 16,
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    flex: 1,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  methodSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  methodText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: colors.textPrimary,
    fontWeight: '500',
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  footer: {
    marginTop: 'auto',
    padding: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
