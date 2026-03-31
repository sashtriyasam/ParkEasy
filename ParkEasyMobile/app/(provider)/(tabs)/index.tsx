import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, FadeInRight, FadeInUp, Layout } from 'react-native-reanimated';
import { get } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { colors } from '../../../constants/colors';
import { EmptyState } from '../../../components/EmptyState';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import { useSocket } from '../../../hooks/useSocket';
import Svg, { Path, Circle, G, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

const OccupancyGauge = ({ value, total }: { value: number, total: number }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 85;
  const strokeWidth = 14;
  const center = 100;
  const circumference = 2 * Math.PI * radius;
  const halfCircumference = circumference / 2;
  const strokeDashoffset = halfCircumference - (percentage / 100) * halfCircumference;

  return (
    <View style={gaugeStyles.container}>
      <Svg width="220" height="130" viewBox="0 0 200 120">
        <Defs>
          <SvgGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor={colors.primaryDark} />
          </SvgGradient>
        </Defs>
        <G rotation="-180" origin="100, 100">
          <Path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            stroke={colors.border + '40'}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
          />
          <Path
            d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={`${halfCircumference} ${halfCircumference}`}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </G>
        <SvgText
          x="100"
          y="85"
          textAnchor="middle"
          fontSize="32"
          fontWeight="900"
          fill={colors.textPrimary}
        >
          {Math.round(percentage)}%
        </SvgText>
        <SvgText
          x="100"
          y="110"
          textAnchor="middle"
          fontSize="10"
          fontWeight="800"
          fill={colors.textMuted}
          letterSpacing="1"
        >
          CAPACITY USED
        </SvgText>
      </Svg>
    </View>
  );
};

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 10,
  }
});

export default function ProviderDashboard() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({
    activeFacilities: 0,
    activeBookings: 0,
    todayRevenue: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const fetchDashboardData = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const [statsRes, facilitiesRes] = await Promise.all([
        get('/provider/dashboard/stats'),
        get('/provider/facilities')
      ]);

      if (statsRes.data?.data) {
        const d = statsRes.data.data;
        setStats({
          activeFacilities: facilitiesRes.data?.data?.length || 0,
          activeBookings: d.active_bookings || 0,
          todayRevenue: d.revenue?.today || 0,
          totalRevenue: d.revenue?.month || 0,
        });
        setLastUpdate(new Date());
      } else {
        setStats({
          activeFacilities: facilitiesRes.data?.data?.length || 0,
          activeBookings: 0,
          todayRevenue: 0,
          totalRevenue: 0,
        });
        setLastUpdate(new Date());
      }
      
      if (facilitiesRes.data?.data) {
        setFacilities(facilitiesRes.data.data);
      }

      const recentRes = await get('/provider/bookings?limit=5');
      if (recentRes.data?.data) {
        setRecentBookings(recentRes.data.data);
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const { socket, isConnected, joinFacility } = useSocket();

  useEffect(() => {
    if (!socket || facilities.length === 0) return;
    facilities.forEach(f => joinFacility(f.id));

    const handleSlotUpdate = (payload: { status: string, facilityId: string }) => {
      setStats(prev => {
        let newActiveBookings = prev.activeBookings;
        if (payload.status === 'OCCUPIED') {
          newActiveBookings += 1;
        } else if (payload.status === 'FREE') {
          newActiveBookings = Math.max(0, newActiveBookings - 1);
        }
        return { ...prev, activeBookings: newActiveBookings };
      });
      setLastUpdate(new Date());
    };

    socket.on('slot_updated', handleSlotUpdate);
    return () => {
      socket.off('slot_updated', handleSlotUpdate);
    };
  }, [socket, facilities, joinFacility]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const formatTime = (dateStr: string) => {
    if (!dateStr) return '--:--';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '--:--' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalSlots = facilities.reduce((acc, f) => acc + (f.total_slots || 0), 0) || 1;

  return (
    <View style={styles.mainContainer}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Dynamic Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerTop}>
            <Animated.View entering={FadeInDown.duration(800)}>
              <Text style={styles.greeting}>{getGreeting()},</Text>
              <Text style={styles.userName}>{user?.full_name?.split(' ')[0] || 'Partner'}</Text>
            </Animated.View>
            <TouchableOpacity 
              onPress={() => router.push('/(provider)/scan')}
              style={styles.scanBtn}
            >
              <BlurView intensity={30} tint="light" style={styles.scanIconBox}>
                <Ionicons name="qr-code-outline" size={24} color="white" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <GlassCard style={styles.mainGaugeCard} intensity={25}>
            <OccupancyGauge value={stats.activeBookings} total={totalSlots} />
            <View style={styles.gaugeMetrics}>
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{stats.activeBookings}</Text>
                <Text style={styles.metricLabel}>ACTIVE</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <Text style={styles.metricValue}>{Math.max(0, totalSlots - stats.activeBookings)}</Text>
                <Text style={styles.metricLabel}>FREE</Text>
              </View>
              <View style={styles.metricDivider} />
              <View style={styles.metricItem}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.textMuted }]} />
                <Text style={styles.metricLabel}>{isConnected ? 'LIVE' : 'IDLE'}</Text>
              </View>
            </View>
          </GlassCard>
        </LinearGradient>

        <View style={styles.content}>
          <View style={styles.statsRow}>
            <Animated.View entering={FadeInRight.delay(200)} style={styles.halfStat}>
              <GlassCard style={styles.statBox} intensity={10}>
                <View style={[styles.statIconBox, { backgroundColor: colors.info + '15' }]}>
                  <Ionicons name="business" size={24} color={colors.info} />
                </View>
                <Text style={styles.statMainValue}>{stats.activeFacilities}</Text>
                <Text style={styles.statSubLabel}>FACILITIES</Text>
              </GlassCard>
            </Animated.View>

            <Animated.View entering={FadeInRight.delay(400)} style={styles.halfStat}>
              <GlassCard style={styles.statBox} intensity={10}>
                <View style={[styles.statIconBox, { backgroundColor: colors.success + '15' }]}>
                  <Ionicons name="cash" size={24} color={colors.success} />
                </View>
                <Text style={styles.statMainValue}>₹{stats.todayRevenue}</Text>
                <Text style={styles.statSubLabel}>REVENUE TODAY</Text>
              </GlassCard>
            </Animated.View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Command Center</Text>
            <View style={styles.actionsGrid}>
              <ActionButton 
                icon="add-circle" 
                label="New Facility" 
                bg="#FF6B6B"
                onPress={() => router.push('/(provider)/add-facility')} 
              />
              <ActionButton 
                icon="list" 
                label="Facilities" 
                bg="#4D96FF"
                onPress={() => router.push('/(provider)/facilities')} 
              />
              <ActionButton 
                icon="wallet" 
                label="Payouts" 
                bg="#6BCB77"
                onPress={() => router.push('/(provider)/earnings')} 
              />
              <ActionButton 
                icon="analytics" 
                label="Insights" 
                bg="#FFD93D"
                onPress={() => router.push('/(provider)/bookings')} 
              />
            </View>
          </View>

          <View style={[styles.section, { marginBottom: 40 }]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Real-time Activity</Text>
              <TouchableOpacity onPress={() => router.push('/(provider)/bookings')}>
                <Text style={styles.viewMore}>View All</Text>
              </TouchableOpacity>
            </View>
            
            {recentBookings.length > 0 ? (
              recentBookings.map((booking, index) => (
                <Animated.View key={booking.id} entering={FadeInUp.delay(index * 100)}>
                  <GlassCard style={styles.activityCard} intensity={5}>
                    <View style={styles.activityInfo}>
                      <View style={styles.customerAvatar}>
                        <Text style={styles.avatarText}>{booking.customer?.full_name?.charAt(0) || 'G'}</Text>
                      </View>
                      <View style={styles.activityDetails}>
                        <Text style={styles.custName}>{booking.customer?.full_name || 'Guest'}</Text>
                        <Text style={styles.activityFac}>
                          {(booking.facility?.name || 'Facility')} • {booking.slot?.slot_number || 'Spot —'}
                        </Text>
                      </View>
                      <View style={styles.activityPricing}>
                        <Text style={styles.activityAmount}>+₹{booking.total_fee || booking.base_fee || 0}</Text>
                        <Text style={styles.activityTime}>
                          {formatTime(booking.entry_time)}
                        </Text>
                      </View>
                    </View>
                  </GlassCard>
                </Animated.View>
              ))
            ) : (
              <EmptyState
                icon="flash-outline"
                title="Silence in the Hub"
                subtitle="Live bookings will appear here instantly."
              />
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function ActionButton({ icon, label, onPress, bg }: any) {
  return (
    <TouchableOpacity style={styles.actionBtn} onPress={onPress} activeOpacity={0.8}>
      <View style={[styles.actionIconOuter, { backgroundColor: bg + '15' }]}>
        <Ionicons name={icon} size={28} color={bg} />
      </View>
      <Text style={styles.actionText}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingHorizontal: 24,
    paddingBottom: 60,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  userName: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  scanBtn: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  scanIconBox: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  mainGaugeCard: {
    padding: 24,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  gaugeMetrics: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    gap: 20,
  },
  metricItem: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '900',
    color: 'white',
  },
  metricLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
  },
  metricDivider: {
    width: 1,
    height: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  content: {
    paddingHorizontal: 24,
    marginTop: -40,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  halfStat: {
    flex: 1,
  },
  statBox: {
    padding: 20,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconBox: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statMainValue: {
    fontSize: 22,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  statSubLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginTop: 2,
  },
  section: {
    marginBottom: 32,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  viewMore: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 12,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  actionBtn: {
    flex: 1,
    minWidth: (width / 2) - 40,
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 28,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    ...colors.shadows.sm,
  },
  actionIconOuter: {
    width: 60,
    height: 60,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activityCard: {
    padding: 16,
    borderRadius: 24,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  activityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
  },
  activityDetails: {
    flex: 1,
  },
  custName: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  activityFac: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
    fontWeight: '600',
  },
  activityPricing: {
    alignItems: 'flex-end',
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.success,
  },
  activityTime: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 4,
  },
});
