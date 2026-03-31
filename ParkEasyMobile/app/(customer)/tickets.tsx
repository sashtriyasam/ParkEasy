import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Platform, Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { get } from '../../services/api';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { colors } from '../../constants/colors';
import { Booking } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

const ParkingTimer = ({ entryTime }: { entryTime: string }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(entryTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      if (diff < 0) return setElapsed('00:00:00');
      
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      setElapsed(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [entryTime]);

  return (
    <View style={styles.timerContainer}>
      <Ionicons name="time" size={16} color={colors.primary} />
      <Text style={styles.timerText}>{elapsed}</Text>
    </View>
  );
};

export default function TicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    else setRefreshing(true);
    
    try {
      const res = await get('/customer/tickets');
      setTickets(res.data.data || []);
    } catch (e) {
      console.error('Error fetching tickets', e);
    } finally {
      if (showLoading) setLoading(false);
      else setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const poll = setInterval(() => fetchTickets(false), 30000);
    return () => clearInterval(poll);
  }, []);

  const activeTickets = tickets.filter(t => t.status.toLowerCase() === 'active');
  const historyTickets = tickets.filter(t => t.status.toLowerCase() !== 'active');
  
  const displayTickets = activeTab === 'ACTIVE' ? activeTickets : historyTickets;

  const renderTicket = ({ item, index }: { item: Booking, index: number }) => {
    const isActive = item.status.toUpperCase() === 'ACTIVE' || item.status.toLowerCase() === 'active';
    const facilityName = item.slot?.floor?.facility?.name || item.facility?.name || `Facility #${item.facility_id}`;

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100).duration(600).springify()}
        layout={Layout.springify()}
      >
        <GlassCard style={[styles.card, isActive && styles.cardActive]} intensity={isActive ? 80 : 40}>
          <View style={styles.cardHeader}>
            <View style={styles.facilityInfo}>
              <Text style={styles.facilityName} numberOfLines={1}>{facilityName}</Text>
              <Text style={styles.ticketId}>#{item.id.substring(0, 8).toUpperCase()}</Text>
            </View>
            <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
              <Text style={[styles.badgeText, { color: isActive ? colors.success : colors.textMuted }]}>
                {item.status.toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailBox}>
              <Text style={styles.label}>VEHICLE</Text>
              <Text style={styles.value}>{item.vehicle_number}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.label}>SPOT</Text>
              <Text style={styles.value}>{item.slot?.slot_number || item.slot_id}</Text>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.label}>FEE</Text>
              <Text style={styles.value}>₹{item.total_fee || item.base_fee || 0}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.cardFooter}>
            {isActive ? (
              <ParkingTimer entryTime={item.entry_time} />
            ) : (
              <View style={styles.timeInfo}>
                <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
                <Text style={styles.timeText}>{new Date(item.entry_time).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</Text>
              </View>
            )}
            
            {isActive && (
              <Button 
                label="Quick Access" 
                onPress={() => {
                  setSelectedTicket(item);
                  setQrModalVisible(true);
                }}
                size="sm"
                variant="primary"
                style={styles.qrBtn}
              />
            )}
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Tickets</Text>
        <View style={styles.tabContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'ACTIVE' && styles.activeTab]}
            onPress={() => setActiveTab('ACTIVE')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.activeTabText]}>Active</Text>
            {activeTickets.length > 0 && <View style={styles.countBadge}><Text style={styles.countText}>{activeTickets.length}</Text></View>}
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]}
            onPress={() => setActiveTab('HISTORY')}
            activeOpacity={0.8}
          >
            <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={styles.listContent}>
           {[1,2,3].map(i => <Skeleton key={i} width="100%" height={180} borderRadius={24} style={{marginBottom: 16}} />)}
        </View>
      ) : (
        <FlatList
          data={displayTickets}
          keyExtractor={item => item.id}
          renderItem={renderTicket}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshing={refreshing}
          onRefresh={() => fetchTickets(false)}
          ListEmptyComponent={
            <EmptyState
              icon="ticket-outline"
              title={`No ${activeTab.toLowerCase()} tickets`}
              subtitle={activeTab === 'ACTIVE' ? "You don't have any active bookings right now." : "Your past parking history will appear here."}
              actionLabel={activeTab === 'ACTIVE' ? "Find Parking" : undefined}
              onAction={activeTab === 'ACTIVE' ? () => router.push('/(customer)/search') : undefined}
            />
          }
        />
      )}

      <Modal
        visible={qrModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <BlurView intensity={30} tint="dark" style={styles.modalOverlay}>
          <Animated.View entering={FadeInDown.springify()} style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setQrModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <View style={styles.modalHeader}>
              <View style={[styles.modalIcon, { backgroundColor: colors.primary + '15' }]}>
                <Ionicons name="qr-code" size={30} color={colors.primary} />
              </View>
              <Text style={styles.modalTitle}>Facility Access</Text>
              <Text style={styles.modalSub}>Scan this at the entrance or exit terminal</Text>
            </View>
            
            <GlassCard style={styles.qrCard} intensity={40}>
              {selectedTicket?.qr_code || selectedTicket?.id ? (
                <QRCode value={selectedTicket?.qr_code || selectedTicket?.id || ''} size={220} />
              ) : (
                <Text style={{ color: colors.textSecondary }}>Access code generating...</Text>
              )}
            </GlassCard>
            
            <View style={styles.modalFooter}>
              <Text style={styles.modalTicketId}>
                TICKET ID: #{(selectedTicket?.id || '').substring(0, 12).toUpperCase()}
              </Text>
              <Text style={styles.modalFacility}>{selectedTicket?.facility?.name || 'Authorized Facility'}</Text>
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
    backgroundColor: colors.background,
  },
  header: {
    paddingTop: 60,
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingBottom: 24,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    ...colors.shadows.sm,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 20,
    letterSpacing: -1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.primaryLight,
    padding: 6,
    borderRadius: 16,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    gap: 8,
  },
  activeTab: {
    backgroundColor: 'white',
    ...colors.shadows.sm,
  },
  tabText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '700',
  },
  activeTabText: {
    color: colors.primary,
  },
  countBadge: {
    backgroundColor: colors.primary,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '900',
  },
  listContent: {
    padding: 24,
    paddingBottom: 120,
  },
  card: {
    padding: 24,
    marginBottom: 16,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.primary + '30',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  facilityInfo: {
    flex: 1,
    marginRight: 12,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  ticketId: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  badgeActive: {
    backgroundColor: colors.success + '15',
  },
  badgeInactive: {
    backgroundColor: colors.border,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  detailBox: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginBottom: 20,
    opacity: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timerText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.primary,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  timeText: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  qrBtn: {
    minWidth: 120,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 40,
    padding: 32,
    alignItems: 'center',
    ...colors.shadows.lg,
  },
  closeBtn: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalHeader: {
    alignItems: 'center',
    marginBottom: 32,
  },
  modalIcon: {
    width: 70,
    height: 70,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  modalSub: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    marginTop: 4,
    paddingHorizontal: 20,
  },
  qrCard: {
    padding: 20,
    borderRadius: 32,
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 32,
  },
  modalFooter: {
    alignItems: 'center',
  },
  modalTicketId: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: 4,
  },
  modalFacility: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

