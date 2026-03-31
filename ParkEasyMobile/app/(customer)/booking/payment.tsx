import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { post } from '../../../services/api';
import { Button } from '../../../components/ui/Button';
import { GlassCard } from '../../../components/ui/GlassCard';
import { colors } from '../../../constants/colors';
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
    setCreatedTicket,
    selected_payment_method,
    created_ticket_id
  } = useBookingFlowStore();

  const [loading, setLoading] = useState(false);
  const [showPaymentSheet, setShowPaymentSheet] = useState(false);

  // Fallbacks if user navigated directly without data
  if (!facility_id || !selected_slot) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color={colors.danger} />
        <Text style={styles.errorText}>Missing booking data. Please start again.</Text>
        <Button label="Go Back Home" onPress={() => router.replace('/(customer)/')} style={{marginTop: 24}} />
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
        vehicle_type: vehicle_type || 'car',
        payment_method: selected_payment_method || 'upi',
        status: 'PENDING'
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
      <LinearGradient colors={['#FFFFFF', '#F8FAFC']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '66%' }]} />
        </View>
        <Text style={styles.progressLabel}>Step 2 of 3: Review & Pay</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.title}>Confirm Booking</Text>

          <GlassCard style={styles.summaryCard}>
            <View style={styles.summaryBadge}>
              <Text style={styles.summaryBadgeText}>BOOKING SUMMARY</Text>
            </View>
            <Text style={styles.facilityName}>{facility_name || 'Parking Facility'}</Text>
            
            <View style={styles.divider} />
            
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <Text style={styles.label}>SPOT / SLOT</Text>
                <View style={styles.valueRow}>
                  <Ionicons name="navigate" size={16} color={colors.primary} />
                  <Text style={styles.value}>{selected_slot.slot_number}</Text>
                </View>
              </View>
              
              <View style={styles.summaryItem}>
                <Text style={styles.label}>VEHICLE</Text>
                <View style={styles.valueRow}>
                  <Ionicons name="car-sport" size={16} color={colors.primary} />
                  <View>
                    <Text style={styles.value}>{vehicle_number}</Text>
                    <Text style={styles.subValue}>{(vehicle_type || '').toUpperCase()}</Text>
                  </View>
                </View>
              </View>
            </View>
          </GlassCard>

          <Text style={styles.sectionTitle}>Price Breakdown</Text>
          <View style={styles.costContainer}>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Hourly Rate</Text>
              <Text style={styles.costValue}>₹{costPerHour}</Text>
            </View>
            <View style={styles.costRow}>
              <Text style={styles.costLabel}>Platform Fee</Text>
              <Text style={styles.costValue}>₹0.00</Text>
            </View>
            <View style={styles.dividerLight} />
            <View style={[styles.costRow, { marginTop: 8 }]}>
              <Text style={styles.totalLabel}>Total per hour</Text>
              <Text style={styles.totalValue}>₹{costPerHour}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Security & Policy</Text>
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: colors.success + '15' }]}>
                <Ionicons name="shield-checkmark" size={20} color={colors.success} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Secure Payment</Text>
                <Text style={styles.infoText}>Encrypted with industry-standard 256-bit SSL.</Text>
              </View>
            </View>
            
            <View style={[styles.dividerLight, { marginVertical: 12 }]} />
            
            <View style={styles.infoRow}>
              <View style={[styles.infoIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="time" size={20} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.infoTitle}>Auto-Cancellation</Text>
                <Text style={styles.infoText}>Slot is reserved for 10 min. please pay promptly.</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>
        <View style={{ height: 140 }} />
      </ScrollView>

      <PaymentSheet
        visible={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        onSuccess={handlePaymentSuccess}
        amount={costPerHour}
        facilityName={facility_name || ''}
        bookingId={created_ticket_id || ''}
        slotId={selected_slot.id}
        vehicleNumber={vehicle_number || ''}
        vehicleType={vehicle_type as any || 'car'}
      />

      <GlassCard style={styles.footer} intensity={90}>
        <Button 
          label="Proceed to Payment" 
          onPress={handleProceedToPayment} 
          loading={loading}
          size="lg"
          variant="primary"
        />
      </GlassCard>
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
    padding: 32,
    backgroundColor: 'white',
  },
  errorText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    textAlign: 'center',
    marginTop: 16,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    backgroundColor: colors.surface,
    paddingBottom: 20,
    ...colors.shadows.sm,
  },
  progressTrack: {
    height: 6,
    backgroundColor: colors.border,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  progressLabel: {
    fontSize: 12,
    color: colors.primary,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 32,
    letterSpacing: -1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginHorizontal: 24,
    marginBottom: 16,
    marginTop: 8,
    letterSpacing: -0.5,
  },
  summaryCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 30,
    marginBottom: 32,
  },
  summaryBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  summaryBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  facilityName: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 20,
  },
  dividerLight: {
    height: 1,
    backgroundColor: colors.border,
    opacity: 0.5,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 20,
  },
  summaryItem: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 8,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  value: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subValue: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  costContainer: {
    marginHorizontal: 24,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 24,
    marginBottom: 32,
    ...colors.shadows.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    alignItems: 'center',
  },
  costLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  costValue: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.primary,
  },
  infoCard: {
    marginHorizontal: 24,
    padding: 20,
    borderRadius: 24,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  infoText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    borderWidth: 0,
    borderTopWidth: 1,
  },
});
