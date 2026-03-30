import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { get } from '../services/api';
import { useAuthStore } from '../store/authStore';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { colors } from '../constants/colors';

export function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const userName = user?.full_name || user?.name || 'User';
  const role = user?.role?.toUpperCase() || 'CUSTOMER';
  const isProvider = role === 'PROVIDER';

  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
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

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to log out?', [
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
        <View style={styles.statsRow}>
          <Text style={{ color: 'white', opacity: 0.6 }}>Loading stats...</Text>
        </View>
      );
    }

    if (isProvider) {
      return (
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>₹{(stats.revenue?.month || 0) / 1000}k</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.active_bookings || 0}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{stats.occupancy || 0}%</Text>
            <Text style={styles.statLabel}>Occupancy</Text>
          </View>
        </View>
      );
    }
    return (
      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.bookings || 0}</Text>
          <Text style={styles.statLabel}>Bookings</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>{stats.parked_hours || 0}h</Text>
          <Text style={styles.statLabel}>Parked</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statValue}>₹{stats.savings || 0}</Text>
          <Text style={styles.statLabel}>Saved</Text>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Premium Header */}
      <View style={styles.headerGradient}>
        <View style={styles.headerContent}>
          <View style={styles.headerTop}>
            <View style={styles.avatarWrapper}>
              <View style={styles.avatarInner}>
                <Text style={styles.avatarText}>{userName.charAt(0)}</Text>
              </View>
              <TouchableOpacity style={styles.editAvatarBtn}>
                <Ionicons name="camera" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.name}>{userName}</Text>
              <View style={styles.roleContainer}>
                <Text style={styles.roleText}>{role}</Text>
                <Ionicons name="shield-checkmark" size={14} color={colors.primary} />
              </View>
            </View>
          </View>
          {renderStats()}
        </View>
      </View>

      {/* Wallet / Earnings Card */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.walletCard} activeOpacity={0.9}>
          <View style={styles.walletInfo}>
            <Text style={styles.walletLabel}>{isProvider ? 'Earnings' : 'Wallet Balance'}</Text>
            <Text style={styles.walletBalance}>₹{isProvider ? '12,450' : '420.00'}</Text>
          </View>
          <TouchableOpacity style={styles.walletAction}>
            <Text style={styles.walletActionText}>{isProvider ? 'Withdraw' : 'Top Up'}</Text>
            <Ionicons name="arrow-forward" size={16} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Account Settings</Text>
        <View style={styles.glassMenu}>
          <MenuOption 
            icon="person-outline" 
            label="Personal Information" 
            onPress={() => router.push('/settings/personal-info')} 
          />
          <MenuOption 
            icon="car-outline" 
            label={isProvider ? "Managed Facilities" : "My Vehicles"} 
            onPress={() => router.push(isProvider ? '/(provider)/(tabs)' : '/vehicles')} 
          />
          <MenuOption 
            icon="card-outline" 
            label="Payment Methods" 
            onPress={() => router.push('/payments')} 
          />
          <MenuOption 
            icon="notifications-outline" 
            label="Notifications" 
            onPress={() => Alert.alert('Coming Soon', 'Notification settings will be available in the next update.')} 
          />
          <MenuOption 
            icon="lock-closed-outline" 
            label="Secure Access" 
            onPress={() => Alert.alert('Coming Soon', 'Advanced security settings are currently being finalized.')} 
            isLast 
          />
        </View>

        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.glassMenu}>
          <MenuOption 
            icon="moon-outline" 
            label="Dark Mode" 
            onPress={() => {}} 
            toggle 
          />
          <MenuOption 
            icon="language-outline" 
            label="Language" 
            onPress={() => {}} 
            value="English" 
            isLast 
          />
        </View>

        <Text style={styles.sectionTitle}>Support</Text>
        <View style={styles.glassMenu}>
          <MenuOption 
            icon="help-circle-outline" 
            label="Help Center" 
            onPress={() => router.push('/support/faq')} 
          />
          <MenuOption 
            icon="chatbubbles-outline" 
            label="Contact Support" 
            onPress={() => router.push('/support/contact')} 
          />
          <MenuOption 
            icon="document-text-outline" 
            label="Terms of Service" 
            onPress={() => Alert.alert('Legal', 'Standard ParkEasy terms apply. Document available on our website.')} 
            isLast 
          />
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={20} color={colors.error} />
          <Text style={styles.logoutText}>Sign Out from ParkEasy</Text>
        </TouchableOpacity>

        <Text style={styles.version}>ParkEasy Premium v2.4.0 (Production)</Text>
        <View style={{ height: 40 }} />
      </View>
    </ScrollView>
  );
}

function MenuOption({ icon, label, onPress, isLast, value, toggle }: any) {
  return (
    <TouchableOpacity 
      style={[styles.menuItem, !isLast && styles.menuItemBorder]} 
      onPress={onPress}
    >
      <View style={styles.menuItemLeft}>
        <View style={styles.menuIconBox}>
          <Ionicons name={icon} size={20} color={colors.primary} />
        </View>
        <Text style={styles.menuLabel}>{label}</Text>
      </View>
      <View style={styles.menuItemRight}>
        {value && <Text style={styles.menuValue}>{value}</Text>}
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  headerGradient: {
    backgroundColor: colors.primary,
    paddingTop: 60,
    paddingBottom: 30,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    ...colors.shadows.lg,
  },
  headerContent: {
    paddingHorizontal: 24,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarWrapper: {
    position: 'relative',
    marginRight: 20,
  },
  avatarInner: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
  },
  editAvatarBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.sm,
  },
  userInfo: {
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 6,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  content: {
    padding: 20,
  },
  walletCard: {
    marginTop: -20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 24,
    borderRadius: 24,
    marginBottom: 30,
    ...colors.shadows.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  walletInfo: {
    flex: 1,
  },
  walletLabel: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 4,
  },
  walletBalance: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  walletAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    gap: 6,
  },
  walletActionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
  },
  glassMenu: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  menuItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  menuValue: {
    fontSize: 14,
    color: colors.textMuted,
    fontWeight: '500',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.error + '40',
    backgroundColor: colors.error + '05',
    gap: 10,
    marginBottom: 24,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
});
