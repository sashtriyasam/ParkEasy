import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { post } from '../../services/api';
import { Button } from '../../components/ui/Button';
import { colors } from '../../constants/colors';

export default function AddFacility() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    latitude: '',
    longitude: '',
    total_slots: '10',
    description: '',
  });

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.latitude || !formData.longitude) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: formData.name,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        total_slots: parseInt(formData.total_slots, 10),
        description: formData.description,
      };

      await post('/provider/facilities', payload);
      Alert.alert('Success', 'Facility created successfully!');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create facility');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Add Facility</Text>
        
        <View style={styles.formGroup}>
          <Text style={styles.label}>Facility Name *</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
            placeholder="e.g. Downtown Metro Parking"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
            placeholder="Full physical address"
            multiline
            numberOfLines={3}
          />
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
          <Text style={styles.label}>Total Slots Expected *</Text>
          <TextInput
            style={styles.input}
            value={formData.total_slots}
            onChangeText={(text) => setFormData(prev => ({ ...prev, total_slots: text }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
            placeholder="Any special instructions or details"
            multiline
            numberOfLines={3}
          />
        </View>

        <View style={styles.actions}>
          <Button 
            label="Cancel" 
            variant="outline" 
            onPress={() => router.back()} 
            style={{ flex: 1, marginRight: 8 }} 
          />
          <Button 
            label="Create Facility" 
            onPress={handleSubmit} 
            loading={loading}
            style={{ flex: 2, marginLeft: 8 }} 
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
  scrollContent: {
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24,
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
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  actions: {
    flexDirection: 'row',
    marginTop: 24,
  },
});
