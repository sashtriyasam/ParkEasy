import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Modal, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  ActivityIndicator,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';
import { Button } from './ui/Button';
import RazorpayCheckout from 'react-native-razorpay';
import { post } from '../services/api';
import { useAuthStore } from '../store/authStore';

const { height } = Dimensions.get('window');

interface PaymentSheetProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  facilityName: string;
  bookingId: string;
  slotId: string;
  vehicleNumber: string;
  vehicleType: string;
}

type PaymentMethod = 'upi' | 'card' | 'wallet';

export const PaymentSheet: React.FC<PaymentSheetProps> = ({ 
  visible, 
  onClose, 
  onSuccess, 
  amount,
  facilityName,
  bookingId,
  slotId,
  vehicleNumber,
  vehicleType
}) => {
  const [step, setStep] = useState<'selection' | 'processing' | 'success'>('selection');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('upi');
  const slideAnim = useState(new Animated.Value(height))[0];
  const { user } = useAuthStore();

  useEffect(() => {
    if (visible) {
      setStep('selection');
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: height,
        duration: 300,
        useNativeDriver: true
      }).start();
    }
  }, [visible]);

  const handlePayment = async () => {
    setStep('processing');
    try {
      // 1. Create order on backend
      const orderRes = await post('/payments/create-order', {
        slot_id: slotId,
        amount
      });

      if (!orderRes.data?.success) {
        throw new Error(orderRes.data?.message || 'Failed to create payment order');
      }

      const orderData = orderRes.data.data;

      // 2. Open Razorpay Checkout
      const options = {
        description: `Booking at ${facilityName}`,
        image: 'https://i.imgur.com/39YbR3X.png', // ParkEasy Logo
        currency: orderData.currency,
        key: orderData.key || process.env.EXPO_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_demo',
        amount: orderData.amount,
        name: 'ParkEasy',
        order_id: orderData.orderId,
        prefill: {
          email: user?.email || '',
          contact: user?.phone || '',
          name: user?.name || ''
        },
        theme: { color: colors.primary }
      };

      const data = await RazorpayCheckout.open(options);
      
      // 3. Verify payment on backend (Phase 7A Alignment)
      const verifyRes = await post('/payments/verify', {
        razorpay_order_id: data.razorpay_order_id,
        razorpay_payment_id: data.razorpay_payment_id,
        razorpay_signature: data.razorpay_signature,
        slot_id: slotId,
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType
      });

      if (verifyRes.data?.success) {
        setStep('success');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error: any) {
      console.error('Payment Error:', error);
      setStep('selection');
      // In a real app, we'd show a toast or alert here
      alert(error.description || error.message || 'Payment Failed');
    }
  };

  const renderMethod = (id: PaymentMethod, title: string, icon: any, subtitle: string) => {
    const isSelected = selectedMethod === id;
    return (
      <TouchableOpacity 
        style={[styles.methodItem, isSelected && styles.methodItemSelected]}
        onPress={() => setSelectedMethod(id)}
        activeOpacity={0.7}
      >
        <View style={[styles.iconContainer, isSelected && styles.iconContainerSelected]}>
          <Ionicons name={icon} size={24} color={isSelected ? colors.primary : colors.textMuted} />
        </View>
        <View style={styles.methodInfo}>
          <Text style={styles.methodTitle}>{title}</Text>
          <Text style={styles.methodSubtitle}>{subtitle}</Text>
        </View>
        <View style={[styles.radio, isSelected && styles.radioSelected]}>
          {isSelected && <View style={styles.radioInner} />}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <Animated.View 
          style={[
            styles.sheet, 
            { transform: [{ translateY: slideAnim }] }
          ]}
        >
          <Pressable style={styles.content}>
            <View style={styles.dragHandle} />
            
            {step === 'selection' && (
              <>
                <View style={styles.header}>
                  <Text style={styles.sheetTitle}>Payment Method</Text>
                  <TouchableOpacity onPress={onClose}>
                    <Ionicons name="close" size={24} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.summaryContainer}>
                  <Text style={styles.summaryLabel}>Total Amount</Text>
                  <Text style={styles.summaryAmount}>₹{amount.toFixed(2)}</Text>
                  <Text style={styles.summaryDetail}>Booking at {facilityName}</Text>
                </View>

                <View style={styles.methodsContainer}>
                  {renderMethod('upi', 'UPI Pay', 'flash', 'Google Pay, PhonePe, Paytm')}
                  {renderMethod('card', 'Credit / Debit Card', 'card', 'Visa, Mastercard, RuPay')}
                  {renderMethod('wallet', 'ParkEasy Wallet', 'wallet', 'Balance: ₹450.00')}
                </View>

                <Button 
                  label={`Pay ₹${amount.toFixed(2)}`}
                  onPress={handlePayment}
                  style={styles.payButton}
                />
                
                <View style={styles.footer}>
                  <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                  <Text style={styles.footerText}>Secure 256-bit SSL Encrypted Payment</Text>
                </View>
              </>
            )}

            {step === 'processing' && (
              <View style={styles.statusContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={styles.statusTitle}>Processing Payment</Text>
                <Text style={styles.statusSubtitle}>Please do not close the app or go back</Text>
              </View>
            )}

            {step === 'success' && (
              <View style={styles.statusContainer}>
                <View style={styles.successIcon}>
                  <Ionicons name="checkmark" size={50} color={colors.surface} />
                </View>
                <Text style={styles.statusTitle}>Payment Successful!</Text>
                <Text style={styles.statusSubtitle}>Your parking spot has been reserved</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
    maxHeight: height * 0.8,
  },
  content: {
    padding: 24,
  },
  dragHandle: {
    width: 40,
    height: 4,
    backgroundColor: colors.border,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  sheetTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  summaryContainer: {
    backgroundColor: colors.primary + '08',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  summaryLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  summaryAmount: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.primary,
    marginBottom: 4,
  },
  summaryDetail: {
    fontSize: 14,
    color: colors.textMuted,
  },
  methodsContainer: {
    gap: 12,
    marginBottom: 32,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  methodItemSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + '05',
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconContainerSelected: {
    backgroundColor: colors.primary + '15',
  },
  methodInfo: {
    flex: 1,
  },
  methodTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  methodSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  payButton: {
    borderRadius: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 6,
  },
  footerText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  statusContainer: {
    paddingVertical: 60,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 20,
  },
  statusSubtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 8,
    textAlign: 'center',
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.success,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  }
});
