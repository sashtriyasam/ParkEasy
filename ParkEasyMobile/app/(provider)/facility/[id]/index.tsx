import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, FlatList, ActivityIndicator, Alert, Switch, Animated } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { get, post, put } from '../../../../services/api';
import { colors } from '../../../../constants/colors';
import { Card } from '../../../../components/ui/Card';
import { SlotGrid } from '../../../../components/SlotGrid';
import { ParkingFacility, ParkingSlot, Booking } from '../../../../types';
import { useLiveSlots } from '../../../../hooks/useLiveSlots';
import { useSocket } from '../../../../hooks/useSocket';

type TabType = 'overview' | 'slots' | 'bookings' | 'pricing';

export default function FacilityManagement() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [facility, setFacility] = useState<ParkingFacility | null>(null);
  const [initialSlots, setInitialSlots] = useState<ParkingSlot[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  
  const { slots: liveSlots, isConnected, highlightedSlotId } = useLiveSlots(id || '', initialSlots);
  const { socket } = useSocket();

  // Booking notification state
  const [notification, setNotification] = useState<string | null>(null);
  const slideAnim = useRef(new Animated.Value(-100)).current;

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await get(`/provider/facilities/${id}`);
      if (res.data?.data) {
        setFacility(res.data.data.facility);
        setInitialSlots(res.data.data.slots || []);
        setBookings(res.data.data.activeBookings || []);
      }
    } catch (error) {
      console.error('Error fetching facility details:', error);
      Alert.alert('Error', 'Failed to load facility details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (!socket || !id) return;

    const onSlotUpdated = (payload: { slotId: string, status: string, facilityId: string }) => {
      if (payload.facilityId === id && payload.status === 'OCCUPIED') {
        const slot = liveSlots.find(s => s.id === payload.slotId);
        if (slot) {
          showNotification(`Slot ${slot.slotNumber} just got booked!`);
          // Refresh bookings list to show the new one
          fetchBookings();
        }
      }
    };

    socket.on('slot_updated', onSlotUpdated);
    return () => {
      socket.off('slot_updated', onSlotUpdated);
    };
  }, [socket, id, liveSlots]);

  const fetchBookings = async () => {
    try {
      const res = await get(`/provider/facilities/${id}`);
      if (res.data?.data) {
        setBookings(res.data.data.activeBookings || []);
      }
    } catch (e) {
      console.error('Error refreshing bookings', e);
    }
  };

  const showNotification = (message: string) => {
    setNotification(message);
    Animated.sequence([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.delay(4000),
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => setNotification(null));
  };

  const handleToggleStatus = async () => {
    if (!facility) return;
    try {
      const newStatus = !facility.is_active;
      await put(`/provider/facilities/${id}`, { is_active: newStatus });
      setFacility({ ...facility, is_active: newStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

  const handleMarkExit = async (bookingId: string) => {
    Alert.alert(
      'Confirm Exit',
      'Are you sure you want to mark this vehicle as exited?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Confirm', 
          onPress: async () => {
            setActionLoading(true);
            try {
              await post(`/provider/bookings/${bookingId}/exit`);
              Alert.alert('Success', 'Vehicle marked as exited');
              fetchData(); // Refresh data
            } catch (error) {
              Alert.alert('Error', 'Failed to process exit');
            } finally {
              setActionLoading(false);
            }
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!facility) return null;

  const renderOverview = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Status</Text>
          <View style={styles.statusRow}>
            <Text style={[styles.statusText, { color: facility.is_active ? colors.success : colors.danger }]}>
              {facility.is_active ? 'Active' : 'Inactive'}
            </Text>
            <Switch
              value={facility.is_active}
              onValueChange={handleToggleStatus}
              trackColor={{ false: colors.border, true: colors.primaryLight }}
              thumbColor={facility.is_active ? colors.primary : colors.textMuted}
            />
          </View>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Address</Text>
          <Text style={styles.infoValue}>{facility.address}, {facility.city}</Text>
        </View>
        <View style={styles.divider} />
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Operating Hours</Text>
          <Text style={styles.infoValue}>{facility.operating_hours}</Text>
        </View>
      </Card>

      <Card style={styles.descriptionCard}>
        <Text style={styles.sectionTitle}>Description</Text>
        <Text style={styles.descriptionText}>{facility.description || 'No description provided.'}</Text>
      </Card>

      <TouchableOpacity 
        style={styles.editButton}
        onPress={() => router.push(`/(provider)/facility/${id}/edit`)}
      >
        <Ionicons name="create-outline" size={20} color={colors.surface} />
        <Text style={styles.editButtonText}>Edit Facility Details</Text>
      </TouchableOpacity>
    </ScrollView>
  );

  const renderSlots = () => {
    const freeSlots = liveSlots.filter(s => s.status === 'free').length;
    return (
      <View style={styles.tabContent}>
        <View style={styles.slotStats}>
          <View style={styles.slotStatItem}>
            <Text style={styles.slotStatValue}>{liveSlots.length}</Text>
            <Text style={styles.slotStatLabel}>Total</Text>
          </View>
          <View style={styles.slotStatItem}>
            <Text style={[styles.slotStatValue, { color: colors.success }]}>{freeSlots}</Text>
            <Text style={styles.slotStatLabel}>Available</Text>
          </View>
          <View style={styles.slotStatItem}>
            <Text style={[styles.slotStatValue, { color: colors.danger }]}>{liveSlots.length - freeSlots}</Text>
            <Text style={styles.slotStatLabel}>Occupied</Text>
          </View>
        </View>
        <SlotGrid 
          slots={liveSlots} 
          onSlotPress={(slot: ParkingSlot) => Alert.alert('Slot Details', `Slot ${slot.slotNumber}\nType: ${slot.vehicleType.toUpperCase()}\nStatus: ${slot.status.toUpperCase()}`)}
          selectedSlotId={null}
          highlightedSlotId={highlightedSlotId}
        />
      </View>
    );
  };

  const renderBookings = () => (
    <FlatList
      data={bookings}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.bookingList}
      renderItem={({ item }) => (
        <Card style={styles.bookingCard}>
          <View style={styles.bookingHeader}>
            <View>
              <Text style={styles.vehicleNumber}>{item.vehicleNumber}</Text>
              <Text style={styles.slotInfo}>Slot: {item.slotId} • {item.vehicleType.toUpperCase()}</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusBadgeText}>{item.status}</Text>
            </View>
          </View>
          <View style={styles.divider} />
          <View style={styles.bookingFooter}>
            <View>
              <Text style={styles.timeLabel}>Entry Time</Text>
              <Text style={styles.timeValue}>{new Date(item.entryTime).toLocaleTimeString()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.exitButton}
              onPress={() => handleMarkExit(item.id)}
              disabled={actionLoading}
            >
              <Text style={styles.exitButtonText}>Mark Exit</Text>
            </TouchableOpacity>
          </View>
        </Card>
      )}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Ionicons name="list-outline" size={48} color={colors.textMuted} />
          <Text style={styles.emptyText}>No active bookings at the moment</Text>
        </View>
      }
    />
  );

  const renderPricing = () => (
    <ScrollView style={styles.tabContent}>
      <Card style={styles.pricingCard}>
        <View style={styles.pricingHeader}>
          <Text style={styles.pricingHeaderCell}>Vehicle</Text>
          <Text style={styles.pricingHeaderCell}>Hourly</Text>
          <Text style={styles.pricingHeaderCell}>Daily Max</Text>
        </View>
        <View style={styles.divider} />
        {/* Mocking pricing data as it's often a separate relation */}
        {['bike', 'scooter', 'car', 'truck'].map((type) => (
          <View key={type} style={styles.pricingRow}>
            <Text style={styles.pricingCell}>{type.toUpperCase()}</Text>
            <Text style={styles.pricingCell}>₹{type === 'car' ? 50 : 20}</Text>
            <Text style={styles.pricingCell}>₹{type === 'car' ? 500 : 200}</Text>
          </View>
        ))}
      </Card>
      <Text style={styles.helperText}>* Monthly pass prices are managed via provider portal currently.</Text>
    </ScrollView>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.facilityName} numberOfLines={1}>{facility.name}</Text>
      </View>

      <View style={styles.tabsBar}>
        {(['overview', 'slots', 'bookings', 'pricing'] as TabType[]).map((tab) => (
          <TouchableOpacity 
            key={tab}
            style={[styles.tabItem, activeTab === tab && styles.activeTabItem]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'slots' && renderSlots()}
        {activeTab === 'bookings' && renderBookings()}
        {activeTab === 'pricing' && renderPricing()}
      </View>

      {notification && (
        <Animated.View style={[styles.notification, { transform: [{ translateY: slideAnim }] }]}>
          <View style={styles.notificationContent}>
            <Ionicons name="notifications" size={20} color={colors.surface} />
            <Text style={styles.notificationText}>{notification}</Text>
          </View>
        </Animated.View>
      )}

      <TouchableOpacity 
        style={styles.scanButton}
        onPress={() => router.push(`/(provider)/(tabs)/scan?facilityId=${id}`)}
      >
        <Ionicons name="qr-code-outline" size={24} color={colors.surface} />
        <Text style={styles.scanButtonText}>Scan & Checkout</Text>
      </TouchableOpacity>

      <View style={[styles.statusBadgeGlobal, { backgroundColor: isConnected ? colors.success : colors.textMuted }]}>
        <Text style={styles.statusBadgeTextGlobal}>{isConnected ? 'LIVE' : 'OFFLINE'}</Text>
      </View>
    </View>
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
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 48,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    marginRight: 16,
  },
  facilityName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    flex: 1,
  },
  tabsBar: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTabItem: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: '700',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  infoCard: {
    padding: 16,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  infoLabel: {
    color: colors.textSecondary,
    fontSize: 14,
  },
  infoValue: {
    color: colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
    maxWidth: '60%',
    textAlign: 'right',
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusText: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 4,
  },
  descriptionCard: {
    padding: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  editButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
  },
  editButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  slotStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotStatItem: {
    alignItems: 'center',
    flex: 1,
  },
  slotStatValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  slotStatLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  bookingList: {
    padding: 16,
  },
  bookingCard: {
    padding: 16,
    marginBottom: 12,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  vehicleNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  slotInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: 'bold',
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  timeLabel: {
    fontSize: 10,
    color: colors.textMuted,
  },
  timeValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  exitButton: {
    backgroundColor: colors.danger,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  exitButtonText: {
    color: colors.surface,
    fontSize: 14,
    fontWeight: '700',
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 16,
    color: colors.textMuted,
    textAlign: 'center',
  },
  pricingCard: {
    padding: 16,
  },
  pricingHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  pricingHeaderCell: {
    flex: 1,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  pricingRow: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pricingCell: {
    flex: 1,
    color: colors.textSecondary,
  },
  helperText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 12,
    fontStyle: 'italic',
  },
  notification: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  notificationContent: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 12,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  notificationText: {
    color: colors.surface,
    fontWeight: 'bold',
    fontSize: 14,
    flex: 1,
  },
  statusBadgeGlobal: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  statusBadgeTextGlobal: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  scanButton: {
    position: 'absolute',
    bottom: 80,
    left: 24,
    right: 24,
    backgroundColor: colors.info,
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  scanButtonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: 'bold',
  },
});
