import React, { useRef, useEffect } from 'react';
import { View, Text, StyleSheet, Share, Alert, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { colors } from '../../../constants/colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
  interpolateColor
} from 'react-native-reanimated';

export default function BookingSuccessScreen() {
  const router = useRouter();
  const { created_ticket_id, facility_name, vehicle_number, resetBookingFlow } = useBookingFlowStore();
  const qrRef = useRef<View>(null);

  const [status, requestPermission] = MediaLibrary.usePermissions();

  // Premium Animations
  const glow = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (status === null) {
      requestPermission();
    }
    
    // Start animations
    glow.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, [status]);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(glow.value, [0, 1], [colors.border, colors.primary]),
    shadowOpacity: glow.value * 0.5,
    shadowRadius: glow.value * 15,
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!created_ticket_id) {
    return (
      <View style={styles.center}>
        <Text>No ticket found. Return to home.</Text>
        <Button label="Go Home" onPress={() => router.replace('/(customer)/')} style={{marginTop: 16}} />
      </View>
    );
  }

  const handleDone = () => {
    resetBookingFlow();
    router.replace('/(customer)/tickets');
  };

  const handleShare = async () => {
    try {
      const result = await Share.share({
        message: `My parking ticket for ${facility_name} (Vehicle: ${vehicle_number}). Ticket ID: ${created_ticket_id}`,
      });
    } catch (error: any) {
      Alert.alert('Share Failed', error.message);
    }
  };

  const handleSave = async () => {
    if (status?.status !== 'granted') {
      const { status: newStatus } = await requestPermission();
      if (newStatus !== 'granted') {
        Alert.alert('Permission Denied', 'Need storage permission to save ticket.');
        return;
      }
    }

    try {
      const localUri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('Success', 'Ticket saved to your gallery!');
    } catch (error) {
      console.error(error);
      Alert.alert('Save Failed', 'Could not save the image.');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: '100%' }]} />
        <Text style={styles.progressText}>Step 3 of 3</Text>
      </View>

      <View style={styles.content}>
        <Animated.View style={[styles.successIconContainer, animatedIconStyle]}>
          <Ionicons name="checkmark-circle" size={80} color={colors.success} />
        </Animated.View>
        <Text style={styles.title}>Booking Confirmed!</Text>
        <Text style={styles.subtitle}>Your parking slot has been reserved successfully.</Text>

        <View ref={qrRef}collapsable={false} style={styles.ticketCardWrapper}>
          <Animated.View style={[styles.glowContainer, animatedGlowStyle]}>
            <Card style={styles.ticketCard}>
              <Text style={styles.ticketFacility}>{facility_name}</Text>
              <View style={styles.qrContainer}>
                <QRCode
                  value={created_ticket_id}
                  size={160}
                  color={colors.textPrimary}
                  backgroundColor="white"
                />
              </View>
              <Text style={styles.ticketId}>ID: {created_ticket_id}</Text>
              <Text style={styles.ticketVehicle}>{vehicle_number}</Text>
            </Card>
          </Animated.View>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={handleSave}>
            <Ionicons name="download-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Save Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={24} color={colors.primary} />
            <Text style={styles.actionText}>Share Ticket</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.footer}>
        <Button label="View My Tickets" onPress={handleDone} />
      </View>
    </View>
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
    padding: 24,
  },
  progressContainer: {
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 24,
    position: 'relative',
  },
  progressBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.success,
  },
  progressText: {
    fontSize: 12,
    color: 'white',
    fontWeight: 'bold',
    zIndex: 1,
  },
  content: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  successIconContainer: {
    marginTop: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
  },
  ticketCardWrapper: {
    width: '100%',
    alignItems: 'center',
    paddingVertical: 20,
  },
  glowContainer: {
    width: '85%',
    borderRadius: 24,
    borderWidth: 2,
    backgroundColor: 'white',
    padding: 2,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  ticketCard: {
    padding: 24,
    alignItems: 'center',
    borderRadius: 22,
    backgroundColor: 'white',
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  ticketFacility: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 24,
    textAlign: 'center',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
  },
  ticketId: {
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: colors.textSecondary,
    marginBottom: 8,
  },
  ticketVehicle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 32,
  },
  actionButton: {
    alignItems: 'center',
    gap: 8,
  },
  actionText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
