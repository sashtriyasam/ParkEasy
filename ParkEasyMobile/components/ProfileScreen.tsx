import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight, FadeIn, Layout } from 'react-native-reanimated';
import { get } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { GlassCard } from './ui/GlassCard';
import { Skeleton } from './ui/SkeletonLoader';
import { colors } from '../constants/colors';

const { width } = Dimensions.get('window');

export function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const userName = user?.full_name || 'User';
  const role = user?.role?.toUpperCase() || 'CUSTOMER';
  const isProvider = role === 'PROVIDER';

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const endpoint = isProvider ? '/provider/dashboard/stats' : '/customer/stats';
        const res = await get(endpoint);
        setStats(res.data.data);
      } catch (e) {
        console.error('Error fetching profile stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [isProvider]);

  const handleWalletAction = () => {
    if (isProvider) {
      router.push('/(provider)/earnings');
    } else {
      Alert.alert(
        "Wallet Feature",
        "Digital wallet top-ups are coming soon. You can currently pay for bookings directly via UPI/Card in the booking flow.",
        [{ text: "OK" }]
      );
    }
  };

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out of ParkEasy?', [
      { text: 'Cancel', style: 'cancel' },
      { 
        text: 'Logout', 
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        }
      }
    ]);
  };

  const renderStats = () => {
    if (loading || !stats) {
      return (
        <View style={styles.statsSkeleton}>
          <Skeleton width="100%" height={80} borderRadius={24} />
        </View>
      );
    }

    const statItems = isProvider ? [
      { label: 'Revenue', value: `₹${(stats.revenue?.month || 0) / 1000}k`, icon: 'cash-outline' },
      { label: 'Active', value: stats.active_bookings || 0, icon: 'flash-outline' },
      { label: 'Occupancy', value: `${stats.occupancy || 0}%`, icon: 'business-outline' },
    ] : [
      { label: 'Bookings', value: stats.bookings || 0, icon: 'ticket-outline' },
      { label: 'Parked', value: `${stats.parked_hours || 0}h`, icon: 'time-outline' },
      { label: 'Saved', value: `₹${stats.savings || 0}`, icon: 'wallet-outline' },
    ];

    return (
      <Animated.View entering={FadeInDown.delay(200).duration(600)} style={styles.statsRow}>
        {statItems.map((item, index) => (
          <React.Fragment key={item.label}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{item.value}</Text>
              <Text style={styles.statLabel}>{item.label}</Text>
            </View>
            {index < statItems.length - 1 && <View style={styles.statDivider} />}
          </React.Fragment>
        ))}
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Immersive Header */}
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.headerPlate}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.avatarContainer}>
              <Animated.View entering={FadeIn.duration(800)} style={styles.avatarGlow} />
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
              </View>
              <TouchableOpacity style={styles.editBadge} activeOpacity={0.8}>
                <Ionicons name="camera" size={14} color={colors.primary} />
              </TouchableOpacity>
            </View>
            
            <View style={styles.userTextContainer}>
              <Text style={styles.userName}>{userName}</Text>
              <View style={styles.roleTag}>
                <Ionicons name="shield-checkmark" size={12} color="white" />
                <Text style={styles.roleLabel}>{role}</Text>
              </View>
            </View>

            {renderStats()}
          </View>
        </LinearGradient>

        <View style={styles.mainContent}>
          {/* Action Cards */}
          <Animated.View entering={FadeInDown.delay(400).springify()}>
            <TouchableOpacity activeOpacity={0.9}>
              <GlassCard style={styles.walletCard} intensity={40}>
                <View style={styles.walletHeader}>
                  <View style={styles.walletIconBox}>
                    <Ionicons name="wallet" size={24} color={colors.primary} />
                  </View>
                  <View style={styles.walletTitleBox}>
                    <Text style={styles.walletLabel}>{isProvider ? 'TOTAL EARNINGS' : 'WALLET BALANCE'}</Text>
                    <Text style={styles.walletAmount}>₹{isProvider ? (stats?.revenue?.total || '12,450') : (stats?.wallet?.balance || '420.00')}</Text>
                  </View>
                  <Button 
                    label={isProvider ? "Withdraw" : "Add Funds"} 
                    onPress={handleWalletAction} 
                    size="sm" 
                    variant="primary"
                    style={styles.walletBtn}
                  />
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>

          <Section title="Account Settings">
            <MenuOption 
              icon="person" 
              label="Personal Information" 
              onPress={() => router.push('/settings/personal-info')} 
            />
            <MenuOption 
              icon={isProvider ? "business" : "car"} 
              label={isProvider ? "Managed Facilities" : "My Vehicles"} 
              onPress={() => router.push(isProvider ? '/(provider)/(tabs)' : '/vehicles')} 
            />
            <MenuOption 
              icon="card" 
              label="Payment Methods" 
              onPress={() => router.push('/payments')} 
            />
            <MenuOption 
              icon="notifications" 
              label="Notifications" 
              isLast
            />
          </Section>

          <Section title="Experiences">
            <MenuOption 
              icon="moon" 
              label="Dark Appearance" 
              value="System"
            />
            <MenuOption 
              icon="language" 
              label="Language" 
              value="English (IN)" 
              isLast
            />
          </Section>

          <Section title="Legal & Support">
            <MenuOption icon="help-circle" label="Help Center" onPress={() => router.push('/(customer)/support/faq')} />
            <MenuOption icon="chatbubble-ellipses" label="Contact Support" onPress={() => router.push('/(customer)/support/contact')} />
            <MenuOption icon="document-text" label="Terms of Service" isLast />
          </Section>

          <TouchableOpacity style={styles.logoutAction} onPress={handleLogout} activeOpacity={0.7}>
            <LinearGradient
              colors={[colors.danger + '10', colors.danger + '05']}
              style={styles.logoutGrad}
            >
              <Ionicons name="log-out" size={20} color={colors.danger} />
              <Text style={styles.logoutLabel}>Secure Sign Out</Text>
            </LinearGradient>
          </TouchableOpacity>

          <Text style={styles.versionTag}>ParkEasy Premium Edition v2.4.0</Text>
          <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </View>
  );
}

function Section({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <GlassCard style={styles.sectionCard} intensity={20}>
        {children}
      </GlassCard>
    </View>
  );
}

function MenuOption({ icon, label, onPress, isLast, value }: any) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, !isLast && styles.menuBorder]} 
      onPress={onPress}
      activeOpacity={0.6}
    >
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconContainer, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name={icon as any} size={18} color={colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  headerPlate: {
    paddingTop: Platform.OS === 'ios' ? 80 : 60,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    overflow: 'hidden',
  },
  headerOverlay: {
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  avatarContainer: {
    marginBottom: 20,
    position: 'relative',
  },
  avatarGlow: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarInner: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(255,255,255,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
  },
  avatarText: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    padding: 8,
    borderRadius: 15,
    ...colors.shadows.sm,
  },
  userTextContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  userName: {
    fontSize: 28,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
  },
  roleTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    gap: 4,
  },
  roleLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: 'white',
    letterSpacing: 1,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 24,
    padding: 20,
    width: '100%',
  },
  statsSkeleton: {
    width: '100%',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
  },
  statLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.7)',
    textTransform: 'uppercase',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  mainContent: {
    padding: 24,
  },
  walletCard: {
    marginTop: -45,
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'white',
    ...colors.shadows.md,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  walletIconBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  walletTitleBox: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  walletAmount: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  walletBtn: {
    minWidth: 100,
  },
  section: {
    marginTop: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
    marginLeft: 8,
  },
  sectionCard: {
    borderRadius: 30,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  menuBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  logoutAction: {
    marginTop: 40,
    borderRadius: 24,
    overflow: 'hidden',
  },
  logoutGrad: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 12,
  },
  logoutLabel: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.danger,
  },
  versionTag: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: colors.textMuted,
    marginTop: 32,
  },
});
