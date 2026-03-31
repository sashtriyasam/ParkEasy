import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/colors';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../store/authStore';

export default function PersonalInfoScreen() {
  const { user } = useAuthStore();
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone_number || '',
  });
  const [loading, setLoading] = useState(false);

  const handleUpdate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      Alert.alert('Profile Updated', 'Your information has been saved successfully.');
    }, 1200);
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Personal Profile</Text>
          <Text style={styles.subtitle}>Update your contact information</Text>
        </View>

        <View style={styles.avatarSection}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>{formData.name.charAt(0)}</Text>
          </View>
          <TouchableOpacity style={styles.changeBtn}>
            <Text style={styles.changeBtnText}>Change Photo</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Full Name</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="person-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={styles.input} 
                value={formData.name}
                onChangeText={(t) => setFormData({...formData, name: t})}
                placeholder="Ex: John Doe"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={[styles.input, styles.disabledInput]} 
                value={formData.email}
                editable={false}
              />
            </View>
            <Text style={styles.hint}>Email cannot be changed for security reasons.</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Phone Number</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="phone-portrait-outline" size={20} color={colors.textMuted} />
              <TextInput 
                style={styles.input} 
                value={formData.phone}
                onChangeText={(t) => setFormData({...formData, phone: t})}
                placeholder="+91 98765 43210"
                keyboardType="phone-pad"
              />
            </View>
          </View>

          <Button 
            label="Save Changes" 
            onPress={handleUpdate} 
            loading={loading}
            style={styles.saveBtn}
          />

          <TouchableOpacity style={styles.deleteBtn}>
            <Text style={styles.deleteBtnText}>Request Account Deletion</Text>
          </TouchableOpacity>
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
  content: {
    padding: 24,
    paddingTop: 80,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginTop: 4,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 40,
  },
  avatarBox: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...colors.shadows.md,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: 'white',
  },
  changeBtn: {
    marginTop: 12,
  },
  changeBtnText: {
    color: colors.primary,
    fontWeight: 'bold',
    fontSize: 14,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    fontSize: 16,
    color: colors.textPrimary,
  },
  disabledInput: {
    color: colors.textMuted,
  },
  hint: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
  },
  saveBtn: {
    marginTop: 12,
    borderRadius: 20,
  },
  deleteBtn: {
    alignItems: 'center',
    marginTop: 20,
  },
  deleteBtnText: {
    color: colors.error,
    fontSize: 13,
    fontWeight: '600',
  }
});
