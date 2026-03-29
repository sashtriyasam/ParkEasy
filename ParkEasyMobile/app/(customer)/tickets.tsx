import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { Booking } from '../../types';
import { EmptyState } from '../../components/EmptyState';
import { useRouter } from 'expo-router';

export default function TicketsScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'HISTORY'>('ACTIVE');
  const [tickets, setTickets] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Booking | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await get('/customer/tickets');
      setTickets(res.data.data);
    } catch (e) {
      console.error('Error fetching tickets', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const activeTickets = tickets.filter(t => t.status === 'active');
  const historyTickets = tickets.filter(t => t.status !== 'active');
  
  const displayTickets = activeTab === 'ACTIVE' ? activeTickets : historyTickets;

  const renderTicket = ({ item }: { item: Booking }) => (
    <Card style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.facilityName}>Facility ID: {item.facilityId}</Text>
        <View style={[styles.badge, item.status === 'active' ? styles.badgeActive : styles.badgeInactive]}>
          <Text style={styles.badgeText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.detailsRow}>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Slot</Text>
          <Text style={styles.value}>{item.slotId}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Vehicle</Text>
          <Text style={styles.value}>{item.vehicleNumber}</Text>
        </View>
        <View style={styles.detailItem}>
          <Text style={styles.label}>Entry</Text>
          <Text style={styles.value}>{new Date(item.entryTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</Text>
        </View>
      </View>
      {item.status === 'active' && (
        <Button 
          label="View QR" 
          variant="secondary"
          style={styles.qrButton}
          onPress={() => {
            setSelectedTicket(item);
            setQrModalVisible(true);
          }} 
        />
      )}
    </Card>
  );

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
              {selectedTicket?.qrCode ? (
                <QRCode value={selectedTicket.qrCode} size={200} />
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
    paddingTop: 16,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: colors.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  facilityName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeActive: {
    backgroundColor: colors.success,
  },
  badgeInactive: {
    backgroundColor: colors.textMuted,
  },
  badgeText: {
    color: colors.surface,
    fontSize: 10,
    fontWeight: 'bold',
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  detailItem: {
    alignItems: 'flex-start',
  },
  label: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  qrButton: {
    marginTop: 8,
  },
  emptyContainer: {
    padding: 48,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
  },
  closeBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
  },
  modalSub: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 24,
  },
  qrContainer: {
    padding: 24,
    backgroundColor: colors.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ticketId: {
    marginTop: 24,
    fontSize: 14,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
});
