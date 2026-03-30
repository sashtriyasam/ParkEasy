import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal, Platform } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { Booking } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useRouter } from 'expo-router';

const ParkingTimer = ({ entryTime }: { entryTime: string }) => {
  const [elapsed, setElapsed] = useState('');

  useEffect(() => {
    const updateTimer = () => {
      const start = new Date(entryTime).getTime();
      const now = new Date().getTime();
      const diff = now - start;
      
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
      <Ionicons name="time-outline" size={14} color={colors.primary} />
      <Text style={styles.timerText}>Parked for: {elapsed}</Text>
    </View>
  );
};

export default function TicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const res = await get('/customer/tickets');
      setTickets(res.data.data);
    } catch (e) {
      console.error('Error fetching tickets', e);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    const poll = setInterval(() => fetchTickets(false), 30000); // Poll every 30s
    return () => clearInterval(poll);
  }, []);

  const activeTickets = tickets.filter(t => t.status.toLowerCase() === 'active');
  const historyTickets = tickets.filter(t => t.status.toLowerCase() !== 'active');
  
  const displayTickets = activeTab === 'ACTIVE' ? activeTickets : historyTickets;

  const renderTicket = ({ item }: { item: Booking }) => {
    const isActive = item.status.toUpperCase() === 'ACTIVE' || item.status.toLowerCase() === 'active';
    const facilityName = item.slot?.floor?.facility?.name || item.facility?.name || `Facility #${item.facility_id}`;

    return (
      <Card style={[styles.card, isActive && styles.cardActive]}>
        <View style={styles.cardHeader}>
          <View style={styles.facilityInfo}>
            <Text style={styles.facilityName}>{facilityName}</Text>
            <Text style={styles.ticketId}>#{item.id.substring(0, 8).toUpperCase()}</Text>
          </View>
          <View style={[styles.badge, isActive ? styles.badgeActive : styles.badgeInactive]}>
            <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
          </View>
        </View>

        {isActive && <ParkingTimer entryTime={item.entry_time} />}

        <View style={styles.detailsRow}>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Vehicle</Text>
            <Text style={styles.value}>{item.vehicle_number}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Slot</Text>
            <Text style={styles.value}>{item.slot?.slot_number || item.slot_id}</Text>
          </View>
          <View style={styles.detailItem}>
            <Text style={styles.label}>Total Fee</Text>
            <Text style={styles.value}>₹{item.total_fee || item.base_fee || 0}</Text>
          </View>
        </View>

        <View style={styles.cardFooter}>
          <View style={styles.timeInfo}>
            <Ionicons name="enter-outline" size={14} color={colors.textMuted} />
            <Text style={styles.timeText}>{new Date(item.entry_time).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</Text>
          </View>
          {isActive && (
            <TouchableOpacity 
              style={styles.qrAction}
              onPress={() => {
                setSelectedTicket(item);
                setQrModalVisible(true);
              }}
            >
              <Ionicons name="qr-code-outline" size={18} color={colors.primary} />
              <Text style={styles.qrActionText}>View Access QR</Text>
            </TouchableOpacity>
          )}
        </View>
      </Card>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabsRow}>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'ACTIVE' && styles.activeTab]}
          onPress={() => setActiveTab('ACTIVE')}
        >
          <Text style={[styles.tabText, activeTab === 'ACTIVE' && styles.activeTabText]}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.tab, activeTab === 'HISTORY' && styles.activeTab]}
          onPress={() => setActiveTab('HISTORY')}
        >
          <Text style={[styles.tabText, activeTab === 'HISTORY' && styles.activeTabText]}>History</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={displayTickets}
        keyExtractor={item => item.id}
        renderItem={renderTicket}
        contentContainerStyle={styles.listContent}
        refreshing={loading}
        onRefresh={fetchTickets}
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

      <Modal
        visible={qrModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setQrModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity 
              style={styles.closeBtn}
              onPress={() => setQrModalVisible(false)}
            >
              <Ionicons name="close" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>Facility Access</Text>
            <Text style={styles.modalSub}>Scan this at the entrance/exit</Text>
            
            <View style={styles.qrContainer}>
              {selectedTicket?.qr_code ? (
                <QRCode value={selectedTicket.qr_code} size={200} />
              ) : (
                <Text style={{ color: colors.textSecondary }}>QR not available</Text>
              )}
            </View>
            
            <Text style={styles.ticketId}>Ticket #{selectedTicket?.id.substring(0,8)}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingTop: 50,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 15,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  activeTabText: {
    color: colors.primary,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    padding: 16,
    marginBottom: 16,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardActive: {
    borderColor: colors.primary + '40',
    backgroundColor: colors.primary + '05',
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facilityInfo: {
    flex: 1,
    marginRight: 10,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  ticketId: {
    fontSize: 12,
    color: colors.textMuted,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeActive: {
    backgroundColor: colors.success + '20',
  },
  badgeInactive: {
    backgroundColor: colors.textMuted + '20',
  },
  badgeText: {
    color: colors.textPrimary,
    fontSize: 11,
    fontWeight: 'bold',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary + '15',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 16,
    gap: 6,
  },
  timerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  detailItem: {
    flex: 1,
  },
  label: {
    fontSize: 11,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontSize: 12,
    color: colors.textMuted,
  },
  qrAction: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  qrActionText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 10,
  },
  modalSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 30,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 20,
  },
});
