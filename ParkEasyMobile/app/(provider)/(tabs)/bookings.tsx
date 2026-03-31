import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { get } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { colors } from '../../../constants/colors';
import { EmptyState } from '../../../components/EmptyState';
import { Skeleton } from '../../../components/ui/SkeletonLoader';

export default function ProviderBookings() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchBookings = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await get('/provider/bookings');
      if (res.data?.data) {
        setBookings(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching provider bookings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return colors.success;
      case 'COMPLETED': return colors.info;
      case 'CANCELLED': return colors.danger;
      default: return colors.textMuted;
    }
  };

  const renderBooking = ({ item, index }: { item: any; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 50).springify()}
      layout={Layout.springify()}
    >
      <GlassCard style={styles.bookingCard} intensity={10}>
        <View style={styles.cardHeader}>
          <View style={styles.idGroup}>
            <Text style={styles.idLabel}>BOOKING ID</Text>
            <Text style={styles.bookingId}>#{item?.id ? item.id.substring(0, 8).toUpperCase() : 'UNKNOWN'}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '15' }]}>
            <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{item.status}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <View style={styles.infoBox}>
              <Ionicons name="car-outline" size={18} color={colors.primary} />
              <View>
                <Text style={styles.infoLabel}>VEHICLE</Text>
                <Text style={styles.infoValue}>{item.vehicle_number || 'N/A'}</Text>
              </View>
            </View>
            <View style={styles.infoBox}>
              <Ionicons name="grid-outline" size={18} color={colors.primary} />
              <View>
                <Text style={styles.infoLabel}>SLOT</Text>
                <Text style={styles.infoValue}>{item.slot?.slot_number || 'TBD'}</Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.timeRow}>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>ENTRY</Text>
              <Text style={styles.timeValue}>
                {item.entry_time ? new Date(item.entry_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </Text>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>DATE</Text>
              <Text style={styles.timeValue}>
                {item.entry_time ? new Date(item.entry_time).toLocaleDateString([], { month: 'short', day: 'numeric' }) : '-- --'}
              </Text>
            </View>
            <View style={styles.timeColumn}>
              <Text style={styles.timeLabel}>REVENUE</Text>
              <Text style={[styles.timeValue, { color: colors.success }]}>₹{item.total_fee || item.base_fee || 0}</Text>
            </View>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <Text style={styles.headerLabel}>LOGS</Text>
        <Text style={styles.title}>Operation Bookings</Text>
      </LinearGradient>

      {loading ? (
        <View style={styles.listContent}>
          {[1,2,3,4].map(i => (
            <Skeleton key={i} width="100%" height={160} borderRadius={24} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="journal-outline"
              title="Silent Records"
              subtitle="All transactions and entries will be documented here."
            />
          }
        />
      )}
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
    paddingHorizontal: 24,
    paddingBottom: 40,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.7)',
    letterSpacing: 2,
    marginBottom: 4,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  listContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  bookingCard: {
    marginBottom: 16,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  idGroup: {
    gap: 2,
  },
  idLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  bookingId: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cardBody: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 24,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border + '40',
  },
  timeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  timeColumn: {
    gap: 4,
  },
  timeLabel: {
    fontSize: 8,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textPrimary,
  },
});
