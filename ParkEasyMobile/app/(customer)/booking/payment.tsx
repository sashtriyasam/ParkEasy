import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity, StatusBar } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { post } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { colors } from '../../../constants/colors';
import { PaymentSheet } from '../../../components/PaymentSheet';
import { useToast } from '../../../components/Toast';
import { VehicleType } from '../../../types';

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
  const [duration, setDuration] = useState(1); // Default 1 hour

  // Fallbacks if user navigated directly without data
  if (!facility_id || !selected_slot) {
    return (
      <View style={styles.center}>
        <Ionicons name="alert-circle" size={64} color={colors.danger} />
        <Text style={styles.errorText}>Missing booking data. Please start again.</Text>
        <GlassButton label="GO BACK HOME" onPress={() => router.replace('/(customer)/')} style={{ marginTop: 24 }} />
      </View>
    );
  }

  const costPerHour = selected_slot.price_per_hour || 0;
  const totalCost = costPerHour * duration;

  const handleProceedToPayment = async () => {
    setLoading(true);
    try {
      const payload = {
        facility_id,
        slot_id: selected_slot.id,
        vehicle_number,
        vehicle_type: vehicle_type || 'car',
        payment_method: selected_payment_method || 'upi',
        duration_hours: duration,
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

  const durations = [1, 2, 4, 8, 12, 24];

  const bookingRef = useMemo(() => Math.random().toString(36).substring(7).toUpperCase(), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Procedural Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '66%' }]} />
          </View>
          <Text style={styles.progressLabel}>PROTOCOL PHASE 02: VALUATION</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600).springify()}>
          <Text style={styles.title}>REVIEW & CONFIGURE</Text>

          <GlassCard style={styles.summaryCard}>
            <View style={styles.badgeRow}>
              <View style={styles.summaryBadge}>
                <Text style={styles.badgeText}>SECURE NODE</Text>
              </View>
              <Text style={styles.timestamp}>REF: {bookingRef}</Text>
            </View>

            <Text style={styles.facilityName}>{facility_name}</Text>

            <View style={styles.divider} />

            <View style={styles.grid}>
              <View style={styles.gridItem}>
                <Text style={styles.label}>ACCESS POINT</Text>
                <Text style={styles.value}>{selected_slot.slot_number}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.label}>VEHICLE ID</Text>
                <Text style={styles.value}>{vehicle_number}</Text>
              </View>
            </View>
          </GlassCard>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>TEMPORAL DURATION (HOURS)</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.durationScroll}>
              {durations.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[styles.durationPill, duration === d && styles.durationPillActive]}
                  onPress={() => setDuration(d)}
                  accessibilityRole="button"
                  accessibilityLabel={`${d} hour${d > 1 ? 's' : ''}`}
                  accessibilityState={{ selected: duration === d }}
                >
                  <Text style={[styles.durationText, duration === d && styles.durationTextActive]}>{d}H</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>VALUATION BREAKDOWN</Text>
            <GlassCard style={styles.costCard}>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Base Protocol Rate</Text>
                <Text style={styles.costValue}>₹{Number(costPerHour).toFixed(2)}/hr</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Multiplier (x{duration})</Text>
                <Text style={styles.costValue}>₹{totalCost.toFixed(2)}</Text>
              </View>
              <View style={styles.costRow}>
                <Text style={styles.costLabel}>Network Fee</Text>
                <Text style={styles.costValue}>₹0.00</Text>
              </View>
              <View style={styles.costDivider} />
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>TOTAL PAYOUT</Text>
                <View style={styles.totalContainer}>
                  <Text style={styles.totalValue}>₹{totalCost.toFixed(2)}</Text>
                  <View style={styles.neonGlow}>
                    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
                  </View>
                </View>
              </View>
            </GlassCard>
          </View>

          <View style={styles.infoSection}>
            <Ionicons name="shield-checkmark" size={20} color={colors.primary} />
            <Text style={styles.infoText}>Biometric encryption & 256-bit SSL secured transaction.</Text>
          </View>
        </Animated.View>
        <View style={{ height: 160 }} />
      </ScrollView>

      <View style={styles.footer}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <GlassButton
          label="INITIALIZE PROTOCOL"
          onPress={handleProceedToPayment}
          loading={loading}
          variant="primary"
        />
      </View>

      <PaymentSheet
        visible={showPaymentSheet}
        onClose={() => setShowPaymentSheet(false)}
        onSuccess={handlePaymentSuccess}
        amount={totalCost}
        facilityName={facility_name || ''}
        bookingId={created_ticket_id || ''}
        slotId={selected_slot.id}
        vehicleNumber={vehicle_number || ''}
        vehicleType={vehicle_type || 'car'}
      />
    </View>
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
    marginBottom: 32,
  },
  summaryCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 32,
    marginBottom: 32,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  summaryBadge: {
    backgroundColor: colors.primary + '20',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  timestamp: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 10,
    fontWeight: '700',
  },
  facilityName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
    marginBottom: 20,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
  },
  gridItem: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  value: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
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
  durationScroll: {
    paddingHorizontal: 24,
    gap: 12,
  },
  durationPill: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  durationPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    shadowColor: colors.primary,
    shadowRadius: 15,
    shadowOpacity: 0.4,
  },
  durationText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 14,
    fontWeight: '900',
  },
  durationTextActive: {
    color: '#FFF',
  },
  costCard: {
    marginHorizontal: 24,
    padding: 24,
    borderRadius: 32,
  },
  costRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  costLabel: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  costValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
  },
  costDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginTop: 8,
    marginBottom: 20,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  totalContainer: {
    position: 'relative',
    alignItems: 'flex-end',
  },
  totalValue: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: '900',
  },
  neonGlow: {
    position: 'absolute',
    bottom: -10,
    width: 60,
    height: 20,
    backgroundColor: colors.primaryGlow,
    borderRadius: 10,
    overflow: 'hidden',
  },
  infoSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    marginTop: 8,
  },
  infoText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 18,
    flex: 1,
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
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1E',
    padding: 40,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 20,
  }
});
