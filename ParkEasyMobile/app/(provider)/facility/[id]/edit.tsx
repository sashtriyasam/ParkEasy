import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { get, put } from '../../../../services/api';
import { Button } from '../../../../components/ui/Button';
import { colors } from '../../../../constants/colors';

export default function EditFacility() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    description: '',
    total_slots: '',
    operating_hours: '',
  });

  useEffect(() => {
    const fetchFacility = async () => {
      try {
        const res = await get(`/provider/facilities/${id}`);
        if (res.data?.data) {
          const f = res.data.data.facility;
          setFormData({
            name: f.name || '',
            address: f.address || '',
            description: f.description || '',
            total_slots: String(f.total_slots || ''),
            operating_hours: f.operating_hours || '',
          });
        }
      } catch (error) {
        console.error('Error fetching facility:', error);
        Alert.alert('Error', 'Failed to load facility data');
      } finally {
        setLoading(false);
      }
    };
    fetchFacility();
  }, [id]);

  const handleSave = async () => {
    if (!formData.name || !formData.address) {
      Alert.alert('Error', 'Name and Address are required');
      return;
    }

    setSaving(true);
    try {
      await put(`/provider/facilities/${id}`, {
        ...formData,
        total_slots: parseInt(formData.total_slots, 10),
      });
      Alert.alert('Success', 'Facility updated successfully');
      router.back();
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to update facility');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Edit Facility</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Facility Name</Text>
          <TextInput
            style={styles.input}
            value={formData.name}
            onChangeText={(text) => setFormData(p => ({ ...p, name: text }))}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.address}
            onChangeText={(text) => setFormData(p => ({ ...p, address: text }))}
            multiline
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Operating Hours</Text>
          <TextInput
            style={styles.input}
            value={formData.operating_hours}
            onChangeText={(text) => setFormData(p => ({ ...p, operating_hours: text }))}
            placeholder="e.g. 24/7 or 9AM - 9PM"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Total Slots</Text>
          <TextInput
            style={styles.input}
            value={formData.total_slots}
            onChangeText={(text) => setFormData(p => ({ ...p, total_slots: text }))}
            keyboardType="numeric"
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.description}
            onChangeText={(text) => setFormData(p => ({ ...p, description: text }))}
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.footer}>
          <Button label="Save Changes" onPress={handleSave} loading={saving} />
          <Button label="Cancel" variant="outline" onPress={() => router.back()} style={{ marginTop: 12 }} />
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    marginTop: 20,
    marginBottom: 40,
  },
});
