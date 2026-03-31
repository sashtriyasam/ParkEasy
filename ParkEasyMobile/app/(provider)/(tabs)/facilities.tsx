import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { get } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { colors } from '../../../constants/colors';
import { ParkingFacility } from '../../../types';
import { EmptyState } from '../../../components/EmptyState';
import { Skeleton } from '../../../components/ui/SkeletonLoader';

const { width } = Dimensions.get('window');

export default function ProviderFacilities() {
  const router = useRouter();
  const [facilities, setFacilities] = useState<ParkingFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchFacilities = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await get('/provider/facilities');
      if (res.data?.data) {
        setFacilities(res.data.data);
      }
    } catch (error) {
      console.error('Error fetching facilities:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFacilities();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchFacilities(false);
  };

  const renderFacility = ({ item, index }: { item: ParkingFacility; index: number }) => (
    <Animated.View 
      entering={FadeInDown.delay(index * 100).springify()}
      layout={Layout.springify()}
    >
      <GlassCard style={styles.facilityCard} intensity={10}>
        <View style={styles.cardHeader}>
          <View style={styles.titleRow}>
            <Text style={styles.facilityName}>{item.name}</Text>
            <View style={[styles.statusBadge, { backgroundColor: item.verified ? colors.success + '15' : colors.warning + '15' }]}>
              <View style={[styles.statusDot, { backgroundColor: item.verified ? colors.success : colors.warning }]} />
              <Text style={[styles.statusText, { color: item.verified ? colors.success : colors.warning }]}>
                {item.verified ? 'Verified' : 'Pending'}
              </Text>
            </View>
          </View>
          <View style={styles.addressRow}>
            <Ionicons name="location-sharp" size={14} color={colors.textMuted} />
            <Text style={styles.facilityAddress} numberOfLines={1}>{item.address}</Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="car" size={18} color={colors.primary} />
            </View>
            <View>
              <Text style={styles.metricVal}>{item.total_slots || 0}</Text>
              <Text style={styles.metricLab}>TOTAL SLOTS</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.metricItem}>
            <View style={[styles.metricIcon, { backgroundColor: colors.success + '15' }]}>
              <Ionicons name="cash" size={18} color={colors.success} />
            </View>
            <View>
              <Text style={styles.metricVal}>₹{item.base_price || 0}/hr</Text>
              <Text style={styles.metricLab}>BASE RATE</Text>
            </View>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <TouchableOpacity 
            style={styles.actionBtn} 
            onPress={() => router.push(`/(provider)/facility/${item.id}`)}
          >
            <Ionicons name="settings-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Configure</Text>
          </TouchableOpacity>
          <View style={styles.footerDivider} />
          <TouchableOpacity 
            style={[styles.actionBtn]} 
            onPress={() => router.push(`/(provider)/bookings?facilityId=${item.id}`)}
          >
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.actionText}>Bookings</Text>
          </TouchableOpacity>
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
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerLabel}>MANAGEMENT</Text>
            <Text style={styles.title}>My Facilities</Text>
          </View>
          <TouchableOpacity 
            style={styles.addButton} 
            onPress={() => router.push('/(provider)/add-facility')}
            activeOpacity={0.8}
          >
            <BlurView intensity={30} tint="light" style={styles.addIconBox}>
              <Ionicons name="add" size={28} color="white" />
            </BlurView>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {loading ? (
        <View style={styles.listContent}>
          {[1,2,3].map(i => (
            <Skeleton key={i} width="100%" height={180} borderRadius={32} style={{ marginBottom: 16 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={facilities}
          keyExtractor={(item) => item.id}
          renderItem={renderFacility}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="business-outline"
              title="Estate is Empty"
              subtitle="Initialize your first facility to begin operations."
              actionLabel="Add Facility"
              onAction={() => router.push('/(provider)/add-facility')}
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  addButton: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  addIconBox: {
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  listContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 100,
  },
  facilityCard: {
    marginBottom: 20,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 0,
    overflow: 'hidden',
  },
  cardHeader: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border + '40',
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  facilityName: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  facilityAddress: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: '600',
  },
  cardBody: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  metricIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricVal: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.textPrimary,
  },
  metricLab: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
  },
  divider: {
    width: 1,
    height: 30,
    backgroundColor: colors.border + '60',
    marginHorizontal: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
  },
  footerDivider: {
    width: 1,
    backgroundColor: colors.border + '40',
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 8,
  },
  actionText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 14,
  },
});
