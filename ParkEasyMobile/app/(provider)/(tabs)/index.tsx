import React, { useState, useEffect, useCallback, ComponentProps } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
  StatusBar
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeInUp,
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming
} from 'react-native-reanimated';
import { get } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { colors } from '../../../constants/colors';
import { EmptyState } from '../../../components/EmptyState';
import { useAuthStore } from '../../../store/authStore';
import { useRouter } from 'expo-router';
import { useSocket } from '../../../hooks/useSocket';
import Svg, { Circle, Text as SvgText, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

const { width } = Dimensions.get('window');

interface Facility {
  id: string;
  name: string;
  address?: string;
  total_slots?: number;
  [key: string]: any;
}

interface Booking {
  id: string;
  customer?: {
    full_name: string;
  };
  facility?: {
    name: string;
  };
  slot?: {
    slot_number: string | number;
  };
  total_fee?: number;
  entry_time: string;
  [key: string]: any;
}

const Glow = ({
  width = 60,
  height = 60,
  borderRadius = 30,
  backgroundColor = colors.primary,
  opacity = 0.1,
  style = {}
}: {
  width?: number;
  height?: number;
  borderRadius?: number;
  backgroundColor?: string;
  opacity?: number;
  style?: any;
}) => (
  <View style={[{
    width,
    height,
    borderRadius,
    backgroundColor,
    opacity,
    position: 'absolute',
    overflow: 'hidden'
  }, style]}>
    <BlurView intensity={30} tint="dark" style={StyleSheet.absoluteFill} />
  </View>
);

const OccupancyGauge = ({ value, total }: { value: number, total: number }) => {
  const percentage = total > 0 ? (value / total) * 100 : 0;
  const radius = 65;
  const strokeWidth = 12;
  const center = 80;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <View style={gaugeStyles.container}>
      <Svg width="160" height="160" viewBox="0 0 160 160">
        <Defs>
          <SvgGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <Stop offset="0%" stopColor={colors.primary} />
            <Stop offset="100%" stopColor="#3B82F6" />
          </SvgGradient>
        </Defs>
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="rgba(255,255,255,0.03)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={center}
          cy={center}
          r={radius}
          stroke="url(#gaugeGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${center} ${center})`}
        />
        <SvgText
          x="80"
          y="75"
          textAnchor="middle"
          fontSize="32"
          fontWeight="900"
          fill="white"
        >
          {Math.round(percentage)}%
        </SvgText>
        <SvgText
          x="80"
          y="100"
          textAnchor="middle"
          fontSize="10"
          fontWeight="900"
          fill="rgba(255,255,255,0.3)"
          letterSpacing={2}
        >
          LOAD
        </SvgText>
      </Svg>
      <Glow width={80} height={80} borderRadius={40} backgroundColor={colors.primary} />
    </View>
  );
};

const gaugeStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
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
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);

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

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const totalSlots = facilities.reduce((acc, f) => acc + (f.total_slots || 0), 0) || 1;

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'MORNING CMD';
    if (hour < 17) return 'AFTERNOON CMD';
    return 'EVENING CMD';
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Premium Header */}
      <View style={styles.header}>
        <View style={styles.profileSection}>
          <Glow width={44} height={44} borderRadius={22} backgroundColor={colors.primary} opacity={0.15} />
          <View style={styles.profileText}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.full_name?.toUpperCase() || 'OPERATOR'}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.scanBtn}
          onPress={() => router.push('/(provider)/scan')}
        >
          <BlurView intensity={30} tint="dark" style={styles.scanBlur}>
            <Ionicons name="qr-code" size={20} color="#FFF" />
          </BlurView>
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
        }
      >
        {/* Main Live Insights */}
        <Animated.View entering={FadeInUp.duration(800)}>
          <GlassCard style={styles.mainInsightCard}>
            <View style={styles.insightHeader}>
              <Text style={styles.insightTitle}>SYSTEM OVERVIEW</Text>
              <View style={styles.statusBadge}>
                <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.danger }]} />
                <Text style={styles.statusText}>{isConnected ? 'SYNCED' : 'OFFLINE'}</Text>
              </View>
            </View>

            <View style={styles.insightGrid}>
              <OccupancyGauge value={stats.activeBookings} total={totalSlots} />
              
              <View style={styles.gaugeStats}>
                <View style={styles.gaugeStatItem}>
                  <Text style={styles.gaugeStatVal}>{stats.activeBookings}</Text>
                  <Text style={styles.gaugeStatLabel}>ENGAGED</Text>
                </View>
                <View style={styles.gaugeStatDivider} />
                <View style={styles.gaugeStatItem}>
                  <Text style={styles.gaugeStatVal}>{Math.max(0, totalSlots - stats.activeBookings)}</Text>
                  <Text style={styles.gaugeStatLabel}>AVAILABLE</Text>
                </View>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Global Stats */}
        <View style={styles.statsGrid}>
          <Animated.View entering={FadeInDown.delay(200)} style={styles.statCol}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statLabel}>CYCLE REVENUE</Text>
              <View style={styles.valRow}>
                <Text style={styles.statVal}>₹{stats.todayRevenue}</Text>
                <Glow width={40} height={20} borderRadius={10} backgroundColor={colors.primary} opacity={0.1} />
              </View>
            </GlassCard>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(300)} style={styles.statCol}>
            <GlassCard style={styles.statCard}>
              <Text style={styles.statLabel}>ACTIVE NODES</Text>
              <View style={styles.valRow}>
                <Text style={styles.statVal}>{stats.activeFacilities}</Text>
              </View>
            </GlassCard>
          </Animated.View>
        </View>

        {/* Management Nodes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>MANAGEMENT INTERFACE</Text>
          <View style={styles.actionGrid}>
            <ActionNode
              icon="add-circle"
              label="NEW NODE"
              onPress={() => router.push('/(provider)/add-facility')}
              delay={400}
            />
            <ActionNode
              icon="business"
              label="NODES"
              onPress={() => router.push('/(provider)/facilities')}
              delay={500}
            />
            <ActionNode
              icon="wallet"
              label="EARNINGS"
              onPress={() => router.push('/(provider)/earnings')}
              delay={600}
            />
            <ActionNode
              icon="stats-chart"
              label="ANALYTICS"
              onPress={() => router.push('/(provider)/analytics')}
              delay={700}
            />
          </View>
        </View>

        {/* Recent Feed */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>SYSTEM FEED</Text>
            <View style={styles.liveBadge}>
              <View style={styles.liveDot} />
              <Text style={styles.liveLabel}>REAL-TIME</Text>
            </View>
          </View>

          {recentBookings.length > 0 ? (
            recentBookings.map((booking, index) => {
              const nodeName = booking.facility?.name || 'UNKNOWN NODE';
              const displayNodeName = nodeName.length > 15 ? nodeName.substring(0, 15) + '...' : nodeName;
              
              return (
                <Animated.View key={booking.id} entering={FadeInRight.delay(index * 100 + 800)}>
                  <GlassCard style={styles.feedCard}>
                    <View style={styles.feedIcon}>
                      <Ionicons name="car" size={20} color={colors.primary} />
                    </View>
                    <View style={styles.feedInfo}>
                      <Text style={styles.feedUser}>{booking.customer?.full_name?.toUpperCase() || 'EXTERNAL USER'}</Text>
                      <Text style={styles.feedMeta}>
                        NODE: {displayNodeName} • SLOT {booking.slot?.slot_number}
                      </Text>
                    </View>
                    <View style={styles.feedEnd}>
                      <Text style={styles.feedVal}>+₹{booking.total_fee || 0}</Text>
                      <Text style={styles.feedTime}>
                        {new Date(booking.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </Text>
                    </View>
                  </GlassCard>
                </Animated.View>
              );
            })
          ) : (
            <EmptyState
              icon="radio-outline"
              title="NO FEED DETECTED"
              subtitle="System activity will propagate here as events occur."
            />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const ActionNode = ({ icon, label, onPress, delay }: { icon: ComponentProps<typeof Ionicons>['name'], label: string, onPress: () => void, delay: number }) => (
  <Animated.View entering={FadeIn.delay(delay)} style={styles.actionNodeWrapper}>
    <TouchableOpacity onPress={onPress}>
      <GlassCard style={styles.actionNode}>
        <View style={styles.actionIcon}>
          <Ionicons name={icon} size={24} color={colors.primary} />
        </View>
        <Text style={styles.actionLabel}>{label}</Text>
      </GlassCard>
    </TouchableOpacity>
  </Animated.View>
);


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1E',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  profileText: {
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '900',
    letterSpacing: 2,
  },
  userName: {
    fontSize: 18,
    color: '#FFF',
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  scanBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  scanBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 100,
  },
  mainInsightCard: {
    borderRadius: 32,
    padding: 24,
    marginBottom: 20,
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  insightTitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.03)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
  },
  insightGrid: {
    alignItems: 'center',
  },
  gaugeStats: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
    marginTop: 10,
    gap: 32,
  },
  gaugeStatItem: {
    alignItems: 'center',
  },
  gaugeStatVal: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
  },
  gaugeStatLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    letterSpacing: 1.5,
    marginTop: 4,
  },
  gaugeStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.06)',
    alignSelf: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  statCol: {
    flex: 1,
  },
  statCard: {
    padding: 20,
    borderRadius: 24,
  },
  statLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    letterSpacing: 2,
    marginBottom: 8,
  },
  valRow: {
    position: 'relative',
  },
  statVal: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFF',
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    marginBottom: 16,
    letterSpacing: 3,
  },
  actionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionNodeWrapper: {
    width: (width - 60) / 2,
  },
  actionNode: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  actionLabel: {
    fontSize: 11,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  liveLabel: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: '900',
    letterSpacing: 1,
  },
  feedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 12,
  },
  feedIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.02)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedInfo: {
    flex: 1,
    marginLeft: 12,
  },
  feedUser: {
    fontSize: 13,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  feedMeta: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '600',
    marginTop: 3,
  },
  feedEnd: {
    alignItems: 'flex-end',
  },
  feedVal: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.success,
  },
  feedTime: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.2)',
    fontWeight: '800',
    marginTop: 2,
  },
});
