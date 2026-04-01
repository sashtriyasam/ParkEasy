import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
  TouchableOpacity,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeInDown,
  FadeInUp,
  FadeInLeft,
  FadeInRight,
  ZoomIn
} from 'react-native-reanimated';
import { get, post } from '../../services/api';
import { colors } from '../../constants/colors';
import { LineChart } from 'react-native-chart-kit';
import { useRouter } from 'expo-router';
import { useToast } from '../../components/Toast';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';

const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalEarnings: 0,
    withdrawable: 0,
    pending: 0,
    thisMonth: 0,
  });
  const [trend, setTrend] = useState({
    labels: ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN'],
    data: [0, 0, 0, 0, 0, 0],
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  // Withdrawal Modal State
  const [showModal, setShowModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [payoutMethod, setPayoutMethod] = useState<'UPI' | 'BANK'>('UPI');
  const [payoutDetails, setPayoutDetails] = useState({
    upiId: '',
    accNo: '',
    ifsc: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const { showToast } = useToast();

  const resetForm = () => {
    setWithdrawAmount('');
    setPayoutMethod('UPI');
    setPayoutDetails({ upiId: '', accNo: '', ifsc: '' });
  };

  const closeWithdrawModal = () => {
    setShowModal(false);
    resetForm();
  };

  const fetchEarnings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    setFetchError(false);
    try {
      const res = await get('/provider/earnings');
      if (res.data?.data) {
        const d = res.data.data;
        setStats({
          totalEarnings: d.totalRevenue || 0,
          withdrawable: d.withdrawableBalance || 0,
          pending: d.pendingSettlements || 0,
          thisMonth: d.thisMonthRevenue || 0,
        });
        setHistory(d.history || []);
        if (d.trend) {
          const { labels, data } = d.trend;
          if (Array.isArray(labels) && Array.isArray(data) && labels.length > 0) {
            setTrend({
              labels: labels.map((l: string) => l.toUpperCase()),
              data: data.map((v: any) => parseFloat(v) || 0)
            });
          }
        }
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
      setFetchError(true);
      showToast("Financial synchronization failed. Protocol interrupted.", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings(false);
  };

  const handleWithdraw = () => {
    if (stats.withdrawable < 100) {
      showToast("Minimum withdrawal threshold is ₹100.", "error");
      return;
    }
    setWithdrawAmount(stats.withdrawable.toString());
    setShowModal(true);
  };

  const submitWithdrawal = async () => {
    const amountNum = parseFloat(withdrawAmount);
    if (!amountNum || amountNum <= 0 || amountNum > stats.withdrawable) {
      showToast("Invalid amount requested.", "error");
      return;
    }

    if (payoutMethod === 'UPI') {
      if (!payoutDetails.upiId || !/^[\w.-]+@[\w]+$/.test(payoutDetails.upiId)) {
        showToast("Invalid UPI ID provided.", "error");
        return;
      }
    } else if (payoutMethod === 'BANK') {
      if (!/^\d{9,18}$/.test(payoutDetails.accNo)) {
        showToast("Invalid bank account structure.", "error");
        return;
      }
      if (!/^[A-Z]{4}[0-9A-Z]{7}$/.test(payoutDetails.ifsc)) {
        showToast("Invalid IFSC protocol.", "error");
        return;
      }
    }

    setSubmitting(true);
    try {
      const res = await post('/provider/withdrawals', {
        amount: amountNum,
        payout_method: payoutMethod,
        payout_details: payoutMethod === 'UPI'
          ? { upi_id: payoutDetails.upiId }
          : { acc_no: payoutDetails.accNo, ifsc: payoutDetails.ifsc }
      });

      if (res.data?.success) {
        showToast("Withdrawal protocol initiated.", "success");
        closeWithdrawModal();
        await fetchEarnings();
      } else {
        showToast(res.data?.message || "Protocol rejection.", "error");
      }
    } catch (error: any) {
      showToast(error.response?.data?.message || "System synchronization error.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const chartConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: 'transparent',
    backgroundGradientTo: 'transparent',
    backgroundGradientFromOpacity: 0,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => colors.primary + `${Math.floor(opacity * 255).toString(16).padStart(2, '0')}`,
    labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity * 0.4})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    propsForDots: {
      r: '4',
      strokeWidth: '0',
      fill: colors.primary,
    },
    propsForBackgroundLines: {
      strokeDasharray: '0',
      stroke: 'rgba(255,255,255,0.05)',
    }
  };

  if (loading && !refreshing) {
    return (
      <View style={[styles.center, { backgroundColor: '#0A0F1E' }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (fetchError && !refreshing) {
    return (
      <View style={[styles.container, styles.center]}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />
        
        <Animated.View entering={FadeInDown} style={styles.errorContent}>
          <View style={styles.errorIconWrapper}>
            <Ionicons name="cloud-offline-outline" size={60} color={colors.primary} />
          </View>
          <Text style={styles.errorTitle}>SYNCHRONIZATION ERROR</Text>
          <Text style={styles.errorSubtitle}>
            Unable to establish a secure connection with the financial ledger. Please re-verify network status.
          </Text>
          
          <GlassButton 
            label="RE-INITIALIZE PROTOCOL" 
            onPress={() => fetchEarnings()}
            variant="primary"
            style={styles.retryBtn}
          />
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />

      <View style={styles.header}>
         <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
            <BlurView intensity={20} tint="dark" style={styles.navBlur}>
              <Ionicons name="chevron-back" size={24} color="#FFF" />
            </BlurView>
         </TouchableOpacity>
         <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>VALUATION LEDGER</Text>
            <Text style={styles.headerSubtitle}>PROTOCOL PHASE: FINANCIAL MGMT</Text>
         </View>
         <View style={styles.liveBadge}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>SYNCED</Text>
         </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Main Balance Card */}
        <Animated.View entering={FadeInDown.delay(100)}>
          <GlassCard style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>WITHDRAWABLE ASSETS</Text>
              <Text style={styles.heroValue}>₹{stats.withdrawable.toLocaleString()}</Text>
              
              <View style={styles.heroGlow}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              </View>

              <GlassButton 
                label="INITIATE WITHDRAWAL" 
                onPress={handleWithdraw} 
                variant="primary"
                style={styles.heroBtn}
              />

              <View style={styles.heroStats}>
                <View style={styles.heroStatItem}>
                  <Text style={styles.hsLabel}>PENDING SETTLEMENT</Text>
                  <Text style={styles.hsValue}>₹{stats.pending.toLocaleString()}</Text>
                </View>
                <View style={styles.hsDivider} />
                <View style={styles.heroStatItem}>
                  <Text style={styles.hsLabel}>PROTOCOL STATUS</Text>
                  <Text style={[styles.hsValue, { color: colors.success }]}>VALIDATED</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Chart Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>REVENUE TRAJECTORY</Text>
          <Animated.View entering={FadeInUp.delay(200)}>
            <GlassCard style={styles.chartCard}>
              <LineChart
                data={{
                  labels: trend.labels,
                  datasets: [{ data: trend.data }]
                }}
                width={width - 56}
                height={200}
                chartConfig={chartConfig}
                bezier
                transparent
                style={styles.chart}
                withInnerLines={true}
                withOuterLines={false}
                withVerticalLines={false}
                withHorizontalLines={true}
              />
            </GlassCard>
          </Animated.View>
        </View>

        {/* Mini Stats Grid */}
        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInLeft.delay(300)} style={styles.statsCol}>
            <GlassCard style={styles.miniCard}>
              <View style={[styles.miniIcon, { backgroundColor: colors.success + '10' }]}>
                <Ionicons name="calendar" size={20} color={colors.success} />
              </View>
              <Text style={styles.miniLabel}>MONTHLY YIELD</Text>
              <Text style={styles.miniValue}>₹{stats.thisMonth.toLocaleString()}</Text>
            </GlassCard>
          </Animated.View>
          <Animated.View entering={FadeInRight.delay(400)} style={styles.statsCol}>
            <GlassCard style={styles.miniCard}>
              <View style={[styles.miniIcon, { backgroundColor: colors.primary + '10' }]}>
                <Ionicons name="layers" size={20} color={colors.primary} />
              </View>
              <Text style={styles.miniLabel}>TOTAL ASSETS</Text>
              <Text style={styles.miniValue}>₹{stats.totalEarnings.toLocaleString()}</Text>
            </GlassCard>
          </Animated.View>
        </View>

        {/* History Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>TRANSACTION LOGS</Text>
          {history.length > 0 ? (
            history.map((item, idx) => {
              const status = (item.status || 'pending').toUpperCase();
              const isSuccess = status === 'SUCCESS';
              
              return (
                <Animated.View key={idx} entering={FadeInUp.delay(500 + idx * 50)}>
                  <GlassCard style={styles.txCard}>
                    <View style={styles.txIcon}>
                       <Ionicons 
                         name={isSuccess ? 'shield-checkmark' : 'timer-outline'} 
                         size={20} 
                         color={isSuccess ? colors.success : '#FACC15'} 
                       />
                    </View>
                    <View style={styles.txBody}>
                       <Text style={styles.txTitle}>{item.method === 'UPI' ? 'UPI PROTOCOL' : 'BANK WIRE'}</Text>
                       <Text style={styles.txDate}>{new Date(item.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</Text>
                    </View>
                    <View style={styles.txEnd}>
                       <Text style={[styles.txAmount, { color: isSuccess ? colors.success : '#FACC15' }]}>₹{item.amount}</Text>
                       <Text style={[styles.txStatus, { color: isSuccess ? colors.success + '80' : '#FACC1580' }]}>{status}</Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              );
            })
          ) : (
             <GlassCard style={styles.emptyCard}>
                <Ionicons name="file-tray-outline" size={40} color="rgba(255,255,255,0.1)" />
                <Text style={styles.emptyText}>NO DATA SIGNATURES DETECTED</Text>
             </GlassCard>
          )}
        </View>
      </ScrollView>

      {/* Withdrawal Modal */}
      <Modal visible={showModal} transparent animationType="fade" onRequestClose={closeWithdrawModal}>
        <BlurView intensity={80} tint="dark" style={styles.modalOverlay}>
           <Animated.View entering={ZoomIn.duration(400)} style={styles.modalContent}>
              <View style={styles.modalHeader}>
                 <View>
                    <Text style={styles.modalTitle}>VALUATION TRANSFER</Text>
                    <Text style={styles.modalSubtitle}>INITIALIZE ASSET RELOCATION</Text>
                 </View>
                 <TouchableOpacity onPress={closeWithdrawModal} style={styles.closeBtn}>
                    <Ionicons name="close" size={24} color="#FFF" />
                 </TouchableOpacity>
              </View>

              <View style={styles.modalBody}>
                 <Text style={styles.inputLabel}>REVENUE QUANTITY (₹)</Text>
                 <View style={styles.amountBox}>
                    <TextInput
                      style={styles.amountInput}
                      value={withdrawAmount}
                      onChangeText={setWithdrawAmount}
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="rgba(255,255,255,0.1)"
                    />
                    <Text style={styles.limitLabel}>MAX_AVAIL: ₹{stats.withdrawable}</Text>
                 </View>

                 <Text style={styles.inputLabel}>LOGISTICS PROTOCOL</Text>
                 <View style={styles.methodTabs}>
                    <TouchableOpacity 
                      style={[styles.methodTab, payoutMethod === 'UPI' && styles.methodTabActive]} 
                      onPress={() => setPayoutMethod('UPI')}
                    >
                       <Ionicons name="flash" size={16} color={payoutMethod === 'UPI' ? '#000' : '#FFF'} />
                       <Text style={[styles.methodTabText, payoutMethod === 'UPI' && styles.methodTabTextActive]}>UPI</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={[styles.methodTab, payoutMethod === 'BANK' && styles.methodTabActive]} 
                      onPress={() => setPayoutMethod('BANK')}
                    >
                       <Ionicons name="business" size={16} color={payoutMethod === 'BANK' ? '#000' : '#FFF'} />
                       <Text style={[styles.methodTabText, payoutMethod === 'BANK' && styles.methodTabTextActive]}>BANK</Text>
                    </TouchableOpacity>
                 </View>

                 {payoutMethod === 'UPI' ? (
                   <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>UPI ADDRESS</Text>
                      <TextInput
                        style={styles.glassInput}
                        value={payoutDetails.upiId}
                        onChangeText={(v) => setPayoutDetails({ ...payoutDetails, upiId: v })}
                        placeholder="ID@PROVIDER"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        autoCapitalize="none"
                      />
                   </View>
                 ) : (
                   <View style={styles.formGroup}>
                      <Text style={styles.inputLabel}>ACCOUNT IDENTIFIER</Text>
                      <TextInput
                        style={[styles.glassInput, { marginBottom: 16 }]}
                        value={payoutDetails.accNo}
                        onChangeText={(v) => setPayoutDetails({ ...payoutDetails, accNo: v })}
                        keyboardType="numeric"
                        placeholder="ACC_NUMBER"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                      />
                      <Text style={styles.inputLabel}>IFSC PROTOCOL</Text>
                      <TextInput
                        style={styles.glassInput}
                        value={payoutDetails.ifsc}
                        onChangeText={(v) => setPayoutDetails({ ...payoutDetails, ifsc: v.toUpperCase() })}
                        placeholder="SBIN00XXXX"
                        placeholderTextColor="rgba(255,255,255,0.2)"
                        autoCapitalize="characters"
                      />
                   </View>
                 )}

                 <View style={styles.modalFooter}>
                    <GlassButton 
                      label={submitting ? "PROCESSING..." : "CONFIRM PROTOCOL"} 
                      onPress={submitWithdrawal} 
                      variant="primary"
                      disabled={submitting}
                    />
                 </View>
              </View>
           </Animated.View>
        </BlurView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    marginLeft: 16,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2.5,
  },
  headerSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.success + '15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.success + '20',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowRadius: 5,
    shadowOpacity: 0.8,
  },
  liveText: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.success,
    letterSpacing: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  heroCard: {
    padding: 24,
    marginBottom: 32,
    minHeight: 280,
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 2,
    marginBottom: 12,
  },
  heroValue: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: -1,
    marginBottom: 32,
  },
  heroGlow: {
    position: 'absolute',
    width: 150,
    height: 150,
    backgroundColor: colors.primary,
    opacity: 0.1,
    borderRadius: 75,
    top: 40,
    overflow: 'hidden',
  },
  heroBtn: {
    width: '100%',
    marginBottom: 32,
  },
  heroStats: {
    flexDirection: 'row',
    width: '100%',
    paddingTop: 24,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    gap: 20,
  },
  heroStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  hsLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  hsValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFF',
  },
  hsDivider: {
    width: 1,
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 20,
    paddingLeft: 4,
  },
  chartCard: {
    padding: 20,
    paddingLeft: 0,
  },
  chart: {
    borderRadius: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statsCol: {
    flex: 1,
  },
  miniCard: {
    padding: 20,
  },
  miniIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  miniLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1,
    marginBottom: 6,
  },
  miniValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
  },
  txCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  txBody: {
    flex: 1,
    marginLeft: 16,
  },
  txTitle: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  txDate: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '600',
    marginTop: 4,
  },
  txEnd: {
    alignItems: 'flex-end',
  },
  txAmount: {
    fontSize: 15,
    fontWeight: '900',
  },
  txStatus: {
    fontSize: 8,
    fontWeight: '900',
    marginTop: 6,
    letterSpacing: 1,
  },
  emptyCard: {
    padding: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.2)',
    letterSpacing: 1,
    marginTop: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    backgroundColor: '#161B2E',
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  modalHeader: {
    padding: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
  },
  modalSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginTop: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBody: {
    padding: 24,
  },
  inputLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 12,
  },
  amountBox: {
    marginBottom: 32,
  },
  amountInput: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFF',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  limitLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.primary,
    marginTop: 8,
  },
  methodTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  methodTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  methodTabActive: {
    backgroundColor: '#FFF',
    borderColor: '#FFF',
  },
  methodTabText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
  },
  methodTabTextActive: {
    color: '#000',
  },
  formGroup: {
    marginBottom: 32,
  },
  glassInput: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 18,
    color: '#FFF',
    fontSize: 14,
    fontWeight: '700',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalFooter: {
    marginTop: 8,
  },
  errorContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  errorIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.03)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 12,
    textAlign: 'center',
  },
  errorSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  retryBtn: {
    width: '100%',
    maxWidth: 240,
  },
});
