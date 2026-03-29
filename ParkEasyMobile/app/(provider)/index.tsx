import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';

export default function ProviderDashboard() {
  const [stats, setStats] = useState({
    activeFacilities: 0,
    activeBookings: 0,
    todayRevenue: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const res = await get('/provider/dashboard');
      if (res.data?.data) {
        setStats({
          activeFacilities: res.data.data.stats.totalFacilities,
          activeBookings: res.data.data.stats.activeBookings,
          todayRevenue: res.data.data.stats.todayRevenue,
          totalRevenue: res.data.data.stats.totalRevenue,
        });
        setRecentBookings(res.data.data.recentBookings || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboardData();
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Overview of your parking facilities</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.primaryLight }]}>
            <Ionicons name="business-outline" size={24} color={colors.primary} />
          </View>
          <Text style={styles.statValue}>{stats.activeFacilities}</Text>
          <Text style={styles.statLabel}>Active Facilities</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.success + '20' }]}>
            <Ionicons name="cash-outline" size={24} color={colors.success} />
          </View>
          <Text style={styles.statValue}>₹{stats.todayRevenue}</Text>
          <Text style={styles.statLabel}>Today's Revenue</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.warning + '20' }]}>
            <Ionicons name="calendar-outline" size={24} color={colors.warning} />
          </View>
          <Text style={styles.statValue}>{stats.activeBookings}</Text>
          <Text style={styles.statLabel}>Active Bookings</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={[styles.iconContainer, { backgroundColor: colors.info + '20' }]}>
            <Ionicons name="bar-chart-outline" size={24} color={colors.info} />
          </View>
          <Text style={styles.statValue}>₹{stats.totalRevenue}</Text>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </Card>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
      </View>
      <View style={styles.recentList}>
        {recentBookings.length > 0 ? (
          recentBookings.map((booking) => (
            <Card key={booking.id} style={styles.recentCard}>
              <View style={styles.bookingInfo}>
                <View>
                  <Text style={styles.customerName}>{booking.customer?.full_name || 'Guest User'}</Text>
                  <Text style={styles.facilityName}>{booking.facility?.name} • {booking.slot?.slot_number}</Text>
                  <Text style={styles.bookingTime}>
                    {new Date(booking.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
                <View style={styles.amountContainer}>
                  <Text style={styles.amountText}>₹{booking.total_fee || booking.base_fee || 0}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: booking.status === 'ACTIVE' ? colors.success + '20' : colors.textMuted + '20' }]}>
                    <Text style={[styles.statusText, { color: booking.status === 'ACTIVE' ? colors.success : colors.textSecondary }]}>
                      {booking.status}
                    </Text>
                  </View>
                </View>
              </View>
            </Card>
          ))
        ) : (
          <Card style={styles.emptyCard}>
            <View style={styles.emptyActivity}>
              <Ionicons name="time-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyText}>No recent activity found</Text>
            </View>
          </Card>
        )}
      </View>
    </ScrollView>
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
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  statCard: {
    flex: 1,
    minWidth: '40%',
    padding: 16,
    alignItems: 'center',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  recentList: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  recentCard: {
    padding: 16,
    marginBottom: 8,
  },
  bookingInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  customerName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  facilityName: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingTime: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  emptyCard: {
    padding: 32,
    alignItems: 'center',
  },
  emptyActivity: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 14,
  },
});
