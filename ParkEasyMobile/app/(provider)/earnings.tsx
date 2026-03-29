import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Dimensions, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { get } from '../../services/api';
import { Card } from '../../components/ui/Card';
import { colors } from '../../constants/colors';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

export default function EarningsScreen() {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    withdrawable: 0,
    pending: 0,
    thisMonth: 0,
  });
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchEarnings = async () => {
    try {
      const res = await get('/provider/earnings');
      if (res.data?.data) {
        setStats({
          totalEarnings: res.data.data.totalRevenue || 0,
          withdrawable: res.data.data.withdrawableBalance || 0,
          pending: res.data.data.pendingSettlements || 0,
          thisMonth: res.data.data.thisMonthRevenue || 0,
        });
        setHistory(res.data.data.history || []);
      }
    } catch (error) {
      console.error('Error fetching earnings:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchEarnings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchEarnings();
  };

  const chartData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        data: [20, 45, 28, 80, 99, 43], // Mocking some growth data for premium feel
        color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
        strokeWidth: 3
      }
    ],
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Earnings</Text>
        <Text style={styles.subtitle}>Track your revenue and settlements</Text>
      </View>

      <View style={styles.mainCardContainer}>
        <Card style={styles.mainCard}>
          <Text style={styles.mainLabel}>Withdrawable Balance</Text>
          <Text style={styles.mainValue}>₹{stats.withdrawable.toLocaleString()}</Text>
          <TouchableOpacity style={styles.withdrawButton}>
            <Text style={styles.withdrawButtonText}>Withdraw to Bank</Text>
          </TouchableOpacity>
        </Card>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>Total Life Earnings</Text>
          <Text style={styles.statValue}>₹{stats.totalEarnings.toLocaleString()}</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statLabel}>This Month</Text>
          <Text style={styles.statValue}>₹{stats.thisMonth.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.chartSection}>
        <Text style={styles.sectionTitle}>Revenue Growth</Text>
        <LineChart
          data={chartData}
          width={width - 32}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(79, 70, 229, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: colors.primary
            }
          }}
          bezier
          style={styles.chart}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Settlements</Text>
      </View>
      
      <View style={styles.historyList}>
        {history.length > 0 ? (
          history.map((item, idx) => (
            <View key={idx} style={styles.historyItem}>
              <View style={styles.historyIcon}>
                <Ionicons 
                  name={item.status === 'SUCCESS' ? 'checkmark-circle' : 'time'} 
                  size={24} 
                  color={item.status === 'SUCCESS' ? colors.success : colors.warning} 
                />
              </View>
              <View style={styles.historyInfo}>
                <Text style={styles.historyTitle}>{item.method || 'Bank Transfer'}</Text>
                <Text style={styles.historyDate}>{new Date(item.created_at).toLocaleDateString()}</Text>
              </View>
              <Text style={[styles.historyAmount, { color: item.status === 'SUCCESS' ? colors.textPrimary : colors.textSecondary }]}>
                + ₹{item.amount}
              </Text>
            </View>
          ))
        ) : (
          <Text style={styles.emptyText}>No recent settlements found.</Text>
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
  header: {
    padding: 24,
    paddingTop: 48,
    backgroundColor: colors.surface,
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
  mainCardContainer: {
    padding: 16,
    marginTop: -20,
  },
  mainCard: {
    padding: 24,
    backgroundColor: colors.primary,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  mainLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
    marginBottom: 8,
  },
  mainValue: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  withdrawButton: {
    backgroundColor: 'white',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  withdrawButtonText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 16,
    gap: 16,
  },
  statBox: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statLabel: {
    fontSize: 12,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  chartSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 16,
  },
  chart: {
    borderRadius: 16,
    marginVertical: 8,
  },
  sectionHeader: {
    paddingHorizontal: 16,
    marginTop: 16,
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  historyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  historyInfo: {
    flex: 1,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  historyDate: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  historyAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textMuted,
    marginTop: 20,
    fontStyle: 'italic',
  },
});
