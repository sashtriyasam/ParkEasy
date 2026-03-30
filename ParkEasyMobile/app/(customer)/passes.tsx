import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  RefreshControl
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { AppHeader } from '../../components/AppHeader';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/EmptyState';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../services/api';

interface Pass {
  id: string;
  facility: {
    name: string;
    address: string;
    image_url: string;
  };
  vehicle_type: string;
  start_date: string;
  end_date: string;
  price: number;
  status: 'ACTIVE' | 'EXPIRED';
}

export default function PassesScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: passes, isLoading, refetch } = useQuery({
    queryKey: ['myPasses'],
    queryFn: async () => {
      const res = await get('/passes/me');
      return res.data.data as Pass[];
    }
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderPass = ({ item }: { item: Pass }) => {
    const isExpired = item.status === 'EXPIRED';
    
    return (
      <View style={[styles.passCard, isExpired && styles.passCardExpired]}>
        <View style={[styles.passGradientContainer, !isExpired && { backgroundColor: colors.primaryDark }]}>
          <View style={styles.passHeader}>
            <View style={styles.facilityInfo}>
              <Text style={[styles.facilityName, !isExpired && { color: 'white' }]}>{item.facility.name}</Text>
              <Text style={[styles.facilityAddress, !isExpired && { color: 'rgba(255,255,255,0.7)' }]}>{item.facility.address}</Text>
            </View>
            <View style={[styles.statusBadge, isExpired ? styles.statusBadgeExpired : styles.statusBadgeActive]}>
              <Text style={[styles.statusText, isExpired ? styles.statusTextExpired : styles.statusTextActive]}>
                {item.status}
              </Text>
            </View>
          </View>
          
          <View style={[styles.divider, !isExpired && { backgroundColor: 'rgba(255,255,255,0.2)' }]} />

          <View style={styles.passDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="car-outline" size={16} color={isExpired ? colors.textSecondary : 'white'} />
              <Text style={[styles.detailText, !isExpired && { color: 'white' }]}>{item.vehicle_type.toUpperCase()}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="calendar-outline" size={16} color={isExpired ? colors.textSecondary : 'white'} />
              <Text style={[styles.detailText, !isExpired && { color: 'white' }]}>
                {new Date(item.start_date).toLocaleDateString()} - {new Date(item.end_date).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>

        {!isExpired && (
          <TouchableOpacity style={styles.qrButton}>
            <Ionicons name="qr-code-outline" size={20} color={colors.surface} />
            <Text style={styles.qrButtonText}>Access Pass</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <AppHeader title="Monthly Passes" showBack={false} />
      
      <FlatList
        data={passes}
        keyExtractor={(item) => item.id}
        renderItem={renderPass}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[colors.primary]} />
        }
        ListEmptyComponent={
          !isLoading ? (
            <EmptyState
              icon="card-outline"
              title="No Monthly Passes Found"
              subtitle="Get a monthly pass for your favorite parking facility to save more!"
              actionLabel="Find Facilities"
              onAction={() => {}}
            />
          ) : null
        }
      />

      <View style={styles.fabContainer}>
        <Button 
          label="Buy New Pass" 
          onPress={() => {}} 
          icon={<Ionicons name="add" size={24} color="white" />}
          style={styles.fab}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContent: {
    padding: 20,
    paddingBottom: 100,
  },
  passCard: {
    backgroundColor: colors.surface,
    borderRadius: 24,
    marginBottom: 20,
    overflow: 'hidden',
    ...colors.shadows.md,
  },
  passCardExpired: {
    opacity: 0.6,
  },
  passGradientContainer: {
    padding: 20,
    backgroundColor: colors.background,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  facilityInfo: {
    flex: 1,
  },
  facilityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  facilityAddress: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusBadgeActive: {
    backgroundColor: colors.success + '15',
  },
  statusBadgeExpired: {
    backgroundColor: colors.error + '15',
  },
  statusText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  statusTextActive: {
    color: colors.success,
  },
  statusTextExpired: {
    color: colors.error,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 12,
  },
  passDetails: {
    gap: 8,
    marginBottom: 16,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  qrButton: {
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  qrButtonText: {
    color: colors.surface,
    fontWeight: '600',
    fontSize: 15,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
  },
  fab: {
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  }
});
