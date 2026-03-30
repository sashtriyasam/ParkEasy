import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export default function ContactSupportScreen() {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = () => {
    if (!subject || !message) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }
    setSending(true);
    // Simulate API call
    setTimeout(() => {
      setSending(false);
      Alert.alert('Message Sent', 'Our team will contact you within 2-4 hours.', [
        { text: 'OK', onPress: () => setMessage('') }
      ]);
    }, 1500);
  };

  const openChannel = (type: 'call' | 'wa' | 'mail') => {
    let url = '';
    if (type === 'call') url = 'tel:+919876543210';
    if (type === 'wa') url = 'https://wa.me/919876543210';
    if (type === 'mail') url = 'mailto:support@parkeasy.com';
    Linking.openURL(url);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Contact Us</Text>
        <Text style={styles.subtitle}>We're here to help you 24/7</Text>
      </View>

      <View style={styles.channelRow}>
        <TouchableOpacity style={styles.channelBox} onPress={() => openChannel('call')}>
          <View style={[styles.channelIcon, { backgroundColor: '#E3F2FD' }]}>
            <Ionicons name="call" size={24} color="#1976D2" />
          </View>
          <Text style={styles.channelLabel}>Call Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.channelBox} onPress={() => openChannel('wa')}>
          <View style={[styles.channelIcon, { backgroundColor: '#E8F5E9' }]}>
            <Ionicons name="logo-whatsapp" size={24} color="#2E7D32" />
          </View>
          <Text style={styles.channelLabel}>WhatsApp</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.channelBox} onPress={() => openChannel('mail')}>
          <View style={[styles.channelIcon, { backgroundColor: '#FFF3E0' }]}>
            <Ionicons name="mail" size={24} color="#EF6C00" />
          </View>
          <Text style={styles.channelLabel}>Email</Text>
        </TouchableOpacity>
      </View>

      <Card style={styles.formCard}>
        <Text style={styles.formTitle}>Send a Message</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Subject</Text>
          <TextInput 
            style={styles.input} 
            placeholder="e.g. Payment Issue, App Crash"
            value={subject}
            onChangeText={setSubject}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Message</Text>
          <TextInput 
            style={[styles.input, styles.textArea]} 
            placeholder="Describe your problem in detail..."
            multiline
            numberOfLines={5}
            value={message}
            onChangeText={setMessage}
          />
        </View>

        <Button 
          label="Send Message" 
          onPress={handleSend} 
          loading={sending}
          style={styles.sendBtn}
        />
      </Card>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Response time: ~2 hours</Text>
        <Text style={styles.footerTextSub}>Service available across all major cities in India.</Text>
      </View>
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
    marginBottom: 32,
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
  channelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  channelBox: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 20,
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  channelIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  channelLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  formCard: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    color: colors.textPrimary,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 15,
    color: colors.textPrimary,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  sendBtn: {
    marginTop: 10,
  },
  footer: {
    marginTop: 32,
    alignItems: 'center',
    paddingBottom: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.success,
  },
  footerTextSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 4,
  }
});
