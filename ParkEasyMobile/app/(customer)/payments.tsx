import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { useRouter } from 'expo-router';
import { useToast } from '../../components/Toast';

interface PaymentMethod {
  id: string;
  type: 'upi' | 'card' | 'wallet';
  label: string;
  value: string;
  expiry?: string;
  isDefault: boolean;
  icon: any;
  accent: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: '1', type: 'upi', label: 'Google Pay', value: 'shivam@okaxis', isDefault: true, icon: 'logo-google', accent: '#4285F4' },
  { id: '2', type: 'card', label: 'HDFC Credit Card', value: '**** **** **** 4242', expiry: '12/28', isDefault: false, icon: 'card', accent: '#E30B5C' },
];

export default function PaymentsScreen() {
  const router = useRouter();
  const { showToast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>(PAYMENT_METHODS);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Method', 'Remove this payment method from your wallet?', [
      { text: 'Keep It', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
      }}
    ]);
  };

  const handleSetDefault = (id: string) => {
    setPaymentMethods(prev => prev.map(m => ({ ...m, isDefault: m.id === id })));
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>SECURITY</Text>
          <Text style={styles.headerTitle}>Payments & Wallet</Text>
        </View>
        <View style={styles.secureTag}>
          <Ionicons name="shield-checkmark" size={14} color={colors.success} />
          <Text style={styles.secureText}>PCI-DSS</Text>
        </View>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Animated.View entering={FadeInDown.delay(100).springify()}>
          <GlassCard style={styles.walletCard} intensity={15}>
            <View style={styles.walletHeader}>
              <View>
                <Text style={styles.walletLabel}>PARKEASY WALLET</Text>
                <Text style={styles.walletBalance}>₹0.00</Text>
              </View>
              <View style={styles.walletIcon}>
                <Ionicons name="wallet" size={28} color={colors.primary} />
              </View>
            </View>
            <TouchableOpacity style={styles.addMoneyBtn}>
              <Ionicons name="add" size={16} color={colors.primary} />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        <Text style={styles.sectionTitle}>SAVED METHODS</Text>

        {paymentMethods.map((method, index) => (
          <Animated.View key={method.id} entering={FadeInDown.delay(index * 100 + 200).springify()}>
            <GlassCard style={styles.methodCard} intensity={10}>
              <View style={[styles.methodAccent, { backgroundColor: method.accent }]}>
                <Ionicons name={method.icon} size={22} color="white" />
              </View>

              <View style={styles.methodInfo}>
                <View style={styles.methodTitleRow}>
                  <Text style={styles.methodName}>{method.label}</Text>
                  {method.isDefault && (
                    <View style={styles.defaultChip}>
                      <Text style={styles.defaultChipText}>DEFAULT</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.methodValue}>{method.value}</Text>
                {method.expiry && (
                  <Text style={styles.methodExpiry}>Expires {method.expiry}</Text>
                )}
              </View>

              <View style={styles.methodActions}>
                {!method.isDefault && (
                  <TouchableOpacity
                    style={styles.setDefaultBtn}
                    onPress={() => handleSetDefault(method.id)}
                  >
                    <Ionicons name="star-outline" size={20} color={colors.primary} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleDelete(method.id)}
                >
                  <Ionicons name="trash-outline" size={20} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.delay(400).springify()}>
          <TouchableOpacity 
            style={styles.addNewCard} 
            activeOpacity={0.7}
            onPress={() => showToast('Feature coming soon', 'info')}
          >
            <View style={styles.addNewIcon}>
              <Ionicons name="add" size={28} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.addNewTitle}>Add New Method</Text>
              <Text style={styles.addNewSub}>UPI, Cards, or Net Banking</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.textMuted} style={{ marginLeft: 'auto' }} />
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(500).springify()} style={styles.securityBanner}>
          <View style={styles.secureIconBox}>
            <Ionicons name="lock-closed" size={24} color={colors.success} />
          </View>
          <View style={styles.secureContent}>
            <Text style={styles.secureBannerTitle}>End-to-End Encrypted</Text>
            <Text style={styles.secureBannerSub}>Your financial data is secured by bank-grade 256-bit TLS encryption and is PCI-DSS Level 1 compliant.</Text>
          </View>
        </Animated.View>
      </ScrollView>
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
    paddingBottom: 40,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  secureTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
    marginLeft: 'auto',
  },
  secureText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.success,
    letterSpacing: 1,
  },
  content: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 60,
  },
  walletCard: {
    padding: 24,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  walletHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  walletLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  walletBalance: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -1,
  },
  walletIcon: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addMoneyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.primary + '20',
  },
  addMoneyText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 2,
    marginBottom: 16,
    marginLeft: 4,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  methodAccent: {
    width: 52,
    height: 52,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  methodInfo: {
    flex: 1,
  },
  methodTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  methodName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  defaultChip: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  defaultChipText: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  methodValue: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  methodExpiry: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  methodActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 12,
  },
  setDefaultBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.danger + '10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderWidth: 2,
    borderColor: colors.primary + '30',
    borderStyle: 'dashed',
    borderRadius: 28,
    padding: 20,
    marginBottom: 32,
  },
  addNewIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.primary,
  },
  addNewSub: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  securityBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.success + '08',
    borderWidth: 1,
    borderColor: colors.success + '20',
    padding: 20,
    borderRadius: 24,
    gap: 16,
  },
  secureIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.success + '15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secureContent: {
    flex: 1,
  },
  secureBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.success,
    marginBottom: 6,
  },
  secureBannerSub: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
    fontWeight: '500',
  },
});
