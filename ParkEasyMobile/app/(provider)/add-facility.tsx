import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { post } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';
import { useToast } from '../../components/Toast';

export default function AddFacility() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    latitude: '',
    longitude: '',
    total_slots: '20',
    operating_hours: '24/7',
    description: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      showToast('Please fill in all required fields.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city || 'Pune', // Default for now
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        total_slots: parseInt(formData.total_slots, 10),
        operating_hours: formData.operating_hours,
        description: formData.description,
        is_active: true,
      };

      await post('/provider/facilities', payload);
      showToast('Facility created successfully!', 'success');
      router.back();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to create facility', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Register Facility</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Facility Name *</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={20} color={colors.textMuted} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
              placeholder="e.g. Downtown Metro Parking"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder="Full physical address"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              value={formData.city}
              onChangeText={(text) => setFormData(prev => ({ ...prev, city: text }))}
              placeholder="e.g. Pune"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Total Slots *</Text>
            <TextInput
              style={styles.input}
              value={formData.total_slots}
              onChangeText={(text) => setFormData(prev => ({ ...prev, total_slots: text }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>Latitude *</Text>
            <TextInput
              style={styles.input}
              value={formData.latitude}
              onChangeText={(text) => setFormData(prev => ({ ...prev, latitude: text }))}
              placeholder="e.g. 18.5204"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>Longitude *</Text>
            <TextInput
              style={styles.input}
              value={formData.longitude}
              onChangeText={(text) => setFormData(prev => ({ ...prev, longitude: text }))}
              placeholder="e.g. 73.8567"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Operating Hours</Text>
          <TextInput
            style={styles.input}
            value={formData.operating_hours}
            onChangeText={(text) => setFormData(prev => ({ ...prev, operating_hours: text }))}
            placeholder="e.g. 24/7 or 9AM - 9PM"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Any special instructions or details about safety, security, etc."
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.footer}>
          <Button 
            label="Register Facility" 
            onPress={handleSubmit} 
            loading={loading}
          />
          <Button 
            label="Cancel" 
            variant="outline" 
            onPress={() => router.back()} 
            style={{ marginTop: 12 }} 
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 24,
  },
  formGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
  },
  inputIcon: {
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    height: 80,
    textAlignVertical: 'top',
    padding: 12,
  },
  footer: {
    marginTop: 12,
    marginBottom: 40,
  },
});
