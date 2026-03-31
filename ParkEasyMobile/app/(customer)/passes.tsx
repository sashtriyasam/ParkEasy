import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  RefreshControl,
  Platform,
  Dimensions,
  Modal,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { colors } from '../../constants/colors';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/EmptyState';
import { Skeleton } from '../../components/ui/SkeletonLoader';
import { useQuery } from '@tanstack/react-query';
import { get } from '../../services/api';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

interface Pass {
  id: string;
  facility: {
    id: string;
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

function getDaysRemaining(endDate: string): number {
  const now = new Date();
  const end = new Date(endDate);
  const diff = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export default function PassesScreen() {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [selectedPass, setSelectedPass] = useState<Pass | null>(null);

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

  const handleShowPass = (pass: Pass) => {
    setSelectedPass(pass);
    setShowQR(true);
  };

  const handleRenew = (pass: Pass) => {
    // Navigate back to facility page to purchase a new pass
    if (pass.facility.id) {
      router.push(`/(customer)/facility/${pass.facility.id}`);
    } else {
      router.push('/(customer)');
    }
  };

  const renderPass = ({ item, index }: { item: Pass; index: number }) => {
    const isActive = item.status === 'ACTIVE';
    const daysLeft = getDaysRemaining(item.end_date);
    const isExpiringSoon = isActive && daysLeft <= 7;

    return (
      <Animated.View entering={FadeInDown.delay(index * 100).springify()}>
        <GlassCard style={[styles.passCard, !isActive && styles.passExpired]} intensity={10}>
          {isActive ? (
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              style={styles.passGradientTop}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.passTopContent}>
                <View>
                  <Text style={styles.facilityNameLight}>{item.facility.name}</Text>
                  <Text style={styles.facilityAddressLight}>{item.facility.address}</Text>
                </View>
                <View style={styles.activeBadge}>
                  <View style={styles.activeDot} />
                  <Text style={styles.activeBadgeText}>ACTIVE</Text>
                </View>
              </View>

              <View style={styles.passStatsRow}>
                <View style={styles.passStat}>
                  <Text style={styles.passStatVal}>{daysLeft}d</Text>
                  <Text style={styles.passStatLabel}>REMAINING</Text>
                </View>
                <View style={styles.passStatDiv} />
                <View style={styles.passStat}>
                  <Text style={styles.passStatVal}>{item.vehicle_type.toUpperCase()}</Text>
                  <Text style={styles.passStatLabel}>VEHICLE</Text>
                </View>
                <View style={styles.passStatDiv} />
                <View style={styles.passStat}>
                  <Text style={styles.passStatVal}>₹{item.price}</Text>
                  <Text style={styles.passStatLabel}>PAID</Text>
                </View>
              </View>
            </LinearGradient>
          ) : (
            <View style={styles.expiredTop}>
              <View style={styles.passTopContent}>
                <View>
                  <Text style={styles.facilityNameDark}>{item.facility.name}</Text>
                  <Text style={styles.facilityAddressDark}>{item.facility.address}</Text>
                </View>
                <View style={styles.expiredBadge}>
                  <Text style={styles.expiredBadgeText}>EXPIRED</Text>
                </View>
              </View>
            </View>
          )}

          <View style={styles.passActions}>
            <View style={styles.dateRange}>
              <Ionicons name="calendar-outline" size={14} color={colors.textMuted} />
              <Text style={styles.dateText}>
                {new Date(item.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} 
                {' → '}
                {new Date(item.end_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
              </Text>
            </View>
            {isActive && (
              <TouchableOpacity style={styles.qrBtn} onPress={() => handleShowPass(item)}>
                <Ionicons name="qr-code" size={16} color={colors.primary} />
                <Text style={styles.qrBtnText}>Show Pass</Text>
              </TouchableOpacity>
            )}
            {isExpiringSoon && (
              <TouchableOpacity style={styles.renewBtn} onPress={() => handleRenew(item)}>
                <Ionicons name="refresh-circle" size={16} color={colors.warning} />
                <Text style={styles.renewBtnText}>Renew</Text>
              </TouchableOpacity>
            )}
          </View>
        </GlassCard>
      </Animated.View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <View>
          <Text style={styles.headerLabel}>SUBSCRIPTIONS</Text>
          <Text style={styles.headerTitle}>Monthly Passes</Text>
        </View>
      </LinearGradient>

      {isLoading ? (
        <View style={styles.listContent}>
          {[1, 2, 3].map(i => (
            <Skeleton key={i} width="100%" height={200} borderRadius={28} style={{ marginBottom: 20 }} />
          ))}
        </View>
      ) : (
        <FlatList
          data={passes}
          keyExtractor={(item) => item.id}
          renderItem={renderPass}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="card-outline"
              title="No Passes Yet"
              subtitle="Subscribe to a monthly pass at your favourite facility and save every trip."
              actionLabel="Explore Facilities"
              onAction={() => router.push('/(customer)')}
            />
          }
        />
      )}

      {/* QR Code Modal for Show Pass */}
      <Modal
        visible={showQR}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQR(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowQR(false)}
        >
          <Animated.View entering={ZoomIn.duration(300)}>
            <GlassCard style={styles.qrModalCard} intensity={25}>
              <View style={styles.qrHeader}>
                <Text style={styles.qrTitle}>Facility Pass</Text>
                <TouchableOpacity onPress={() => setShowQR(false)}>
                  <Ionicons name="close" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
              </View>

              <View style={styles.qrContainer}>
                {selectedPass && (
                  <View style={styles.qrReferece}>
                    <QRCode
                      value={selectedPass.id}
                      size={200}
                      color="black"
                      backgroundColor="white"
                    />
                  </View>
                )}
              </View>

              <View style={styles.qrDetails}>
                <Text style={styles.qrFacilityName}>{selectedPass?.facility.name}</Text>
                <Text style={styles.qrVehicleInfo}>
                  {selectedPass?.vehicle_type.toUpperCase()} • Valid till {selectedPass && new Date(selectedPass.end_date).toLocaleDateString()}
                </Text>
                <View style={styles.qrIdContainer}>
                  <Text style={styles.qrIdLabel}>PASS ID: </Text>
                  <Text style={styles.qrIdValue}>{selectedPass?.id.substring(0, 12).toUpperCase()}</Text>
                </View>
              </View>

              <Button
                label="Done"
                onPress={() => setShowQR(false)}
                variant="glass"
                style={styles.qrCloseBtn}
              />
            </GlassCard>
          </Animated.View>
        </Pressable>
      </Modal>

      <Animated.View entering={FadeInUp.delay(400)} style={styles.fab}>
        <Button
          label="Buy New Pass"
          onPress={() => router.push('/(customer)')}
          icon="add"
          style={styles.fabBtn}
        />
      </Animated.View>
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
    paddingBottom: 40,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -0.5,
    marginTop: 2,
  },
  listContent: {
    padding: 24,
    paddingTop: 32,
    paddingBottom: 120,
  },
  passCard: {
    borderRadius: 28,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: 'hidden',
    padding: 0,
  },
  passExpired: {
    opacity: 0.65,
  },
  passGradientTop: {
    padding: 24,
  },
  expiredTop: {
    padding: 20,
    backgroundColor: colors.background,
  },
  passTopContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  facilityNameLight: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
    marginBottom: 4,
  },
  facilityAddressLight: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.7)',
    fontWeight: '600',
  },
  facilityNameDark: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  facilityAddressDark: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '600',
  },
  activeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#4ADE80',
  },
  activeBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: 'white',
    letterSpacing: 0.5,
  },
  expiredBadge: {
    backgroundColor: colors.error + '20',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  expiredBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.error,
    letterSpacing: 0.5,
  },
  passStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  passStat: {
    flex: 1,
    alignItems: 'center',
  },
  passStatVal: {
    fontSize: 20,
    fontWeight: '900',
    color: 'white',
  },
  passStatLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: 'rgba(255,255,255,0.6)',
    letterSpacing: 1,
    marginTop: 2,
  },
  passStatDiv: {
    width: 1,
    height: 24,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  passActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border + '40',
    gap: 12,
  },
  dateRange: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  dateText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  qrBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
  },
  qrBtnText: {
    color: colors.primary,
    fontWeight: '800',
    fontSize: 13,
  },
  renewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  renewBtnText: {
    color: colors.warning,
    fontWeight: '800',
    fontSize: 13,
  },
  fab: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
  },
  fabBtn: {
    borderRadius: 20,
    height: 60,
    ...colors.shadows.premium,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  qrModalCard: {
    width: width - 48,
    borderRadius: 32,
    padding: 24,
    alignItems: 'center',
  },
  qrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: 24,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  qrContainer: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 24,
    marginBottom: 24,
    ...colors.shadows.md,
  },
  qrReferece: {
    padding: 10,
  },
  qrDetails: {
    alignItems: 'center',
    marginBottom: 32,
  },
  qrFacilityName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  qrVehicleInfo: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '600',
    marginBottom: 12,
  },
  qrIdContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  qrIdLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.textMuted,
  },
  qrIdValue: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1,
  },
  qrCloseBtn: {
    width: '100%',
    height: 54,
    borderRadius: 18,
  },
});
