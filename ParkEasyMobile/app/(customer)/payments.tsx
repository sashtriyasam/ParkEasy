import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export default function PaymentsScreen() {
  const [paymentMethods, setPaymentMethods] = useState([
    { id: '1', type: 'upi', label: 'Google Pay', value: 'shivam@okaxis', isDefault: true },
    { id: '2', type: 'card', label: 'HDFC Credit Card', value: '**** 4242', expiry: '12/28' },
  ]);

  const handleDelete = (id: string) => {
    Alert.alert('Remove Method', 'Are you sure you want to remove this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => {
        setPaymentMethods(prev => prev.filter(m => m.id !== id));
      }}
    ]);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Payment Methods</Text>
        <Text style={styles.subtitle}>Secured by Razorpay Encryption</Text>
      </View>

      <Text style={styles.sectionTitle}>Saved Methods</Text>
      
      {paymentMethods.map((method) => (
        <Card key={method.id} style={styles.methodCard}>
          <View style={styles.methodIcon}>
            <Ionicons 
              name={method.type === 'upi' ? 'logo-google' : 'card-outline'} 
              size={24} 
              color={colors.primary} 
            />
          </View>
          <View style={styles.methodDetails}>
            <View style={styles.methodLabelRow}>
              <Text style={styles.methodLabel}>{method.label}</Text>
              {method.isDefault && (
                <View style={styles.defaultBadge}>
                  <Text style={styles.defaultText}>DEFAULT</Text>
                </View>
              )}
            </View>
            <Text style={styles.methodValue}>{method.value}</Text>
          </View>
          <TouchableOpacity onPress={() => handleDelete(method.id)}>
            <Ionicons name="close-circle-outline" size={22} color={colors.textMuted} />
          </TouchableOpacity>
        </Card>
      ))}

      <TouchableOpacity style={styles.addBtn} activeOpacity={0.7}>
        <View style={styles.addIcon}>
          <Ionicons name="add" size={24} color={colors.primary} />
        </View>
        <Text style={styles.addText}>Add New Payment Method</Text>
      </TouchableOpacity>

      <View style={styles.securityInfo}>
        <Ionicons name="shield-checkmark" size={20} color={colors.success} />
        <Text style={styles.securityText}>Your data is end-to-end encrypted and PCI-DSS compliant.</Text>
      </View>

      <Button 
        label="Set Default Method" 
        variant="outline" 
        style={styles.actionBtn}
        onPress={() => Alert.alert('Selection Mode', 'Tap on a method to set it as default.')}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 14,
    color: colors.success,
    fontWeight: '600',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 20,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    marginBottom: 16,
    borderRadius: 24,
    backgroundColor: colors.surface,
  },
  methodIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  methodDetails: {
    flex: 1,
  },
  methodLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  methodLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  defaultBadge: {
    backgroundColor: colors.primary + '15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  defaultText: {
    fontSize: 9,
    fontWeight: '800',
    color: colors.primary,
  },
  methodValue: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primary + '40',
    borderStyle: 'dashed',
    marginTop: 10,
  },
  addIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.primary + '10',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  addText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.primary,
  },
  securityInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '10',
    padding: 16,
    borderRadius: 16,
    marginTop: 40,
    gap: 12,
  },
  securityText: {
    flex: 1,
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  actionBtn: {
    marginTop: 24,
    borderRadius: 20,
  }
});
