import React, { useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Share, 
  Alert, 
  TouchableOpacity, 
  Platform, 
  Dimensions,
  ScrollView,
  StatusBar
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import { BlurView } from 'expo-blur';
import * as MediaLibrary from 'expo-media-library';
import { captureRef } from 'react-native-view-shot';
import { useBookingFlowStore } from '../../../store/bookingFlowStore';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { colors } from '../../../constants/colors';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  withSpring,
  FadeInDown,
  FadeInUp
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');
const FOOTER_SPACER_HEIGHT = 160;

export default function BookingSuccessScreen() {
  const router = useRouter();
  const { created_ticket_id, facility_name, vehicle_number, resetBookingFlow } = useBookingFlowStore();
  const qrRef = useRef<View>(null);

  const [status, requestPermission] = MediaLibrary.usePermissions();

  const glow = useSharedValue(0);
  const iconScale = useSharedValue(0);

  useEffect(() => {
    if (status === null) {
      requestPermission();
    }
    
    glow.value = withRepeat(withTiming(1, { duration: 1500 }), -1, true);
    iconScale.value = withSpring(1, { damping: 12, stiffness: 100 });
  }, []);

  const animatedGlowStyle = useAnimatedStyle(() => ({
    opacity: 0.3 + (glow.value * 0.4),
    transform: [{ scale: 1 + (glow.value * 0.05) }]
  }));

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }],
  }));

  if (!created_ticket_id) {
    return (
      <View style={styles.centerError}>
        <Ionicons name="alert-circle" size={64} color={colors.danger} />
        <Text style={styles.errorText}>SESSION EXPIRED. NO TICKET DATA FOUND.</Text>
        <GlassButton label="RETURN TO MATRIX" onPress={() => router.replace('/(customer)/')} style={{marginTop: 32}} />
      </View>
    );
  }

  const handleDone = () => {
    resetBookingFlow();
    router.replace('/(customer)/tickets');
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `PROTOCOL SECURED: My ParkEasy ticket for ${facility_name}\nVehicle: ${vehicle_number}\nRef: ${created_ticket_id}`,
      });
    } catch (error: any) {
      Alert.alert('LINK FAILURE', error.message);
    }
  };

  const handleSave = async () => {
    if (status?.status !== 'granted') {
      const { status: newStatus } = await requestPermission();
      if (newStatus !== 'granted') {
        Alert.alert('ACCESS DENIED', 'Storage permission required for ticket archival.');
        return;
      }
    }

    try {
      const localUri = await captureRef(qrRef, {
        format: 'png',
        quality: 1,
      });

      await MediaLibrary.saveToLibraryAsync(localUri);
      Alert.alert('PROTOCOL SAVED', 'Digital pass archived to local storage.');
    } catch (error) {
      console.error(error);
      Alert.alert('SAVE FAILURE', 'Could not archive the digital pass.');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Completion Header */}
      <View style={styles.header}>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: '100%' }]} />
        </View>
        <Text style={styles.progressLabel}>PROTOCOL STATE: SECURED</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.topSection}>
           <View style={styles.iconWrapper}>
              <Animated.View style={[styles.glowRing, animatedGlowStyle]}>
                <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
              </Animated.View>
              <Animated.View style={[styles.successIcon, animatedIconStyle]}>
                 <Ionicons name="checkmark-circle" size={80} color={colors.success} />
              </Animated.View>
           </View>
           <Animated.Text entering={FadeInDown.delay(300)} style={styles.title}>SUCCESSFULLY SECURED</Animated.Text>
           <Animated.Text entering={FadeInDown.delay(400)} style={styles.subtitle}>Your parking node at {facility_name} is now encrypted and reserved.</Animated.Text>
        </View>

        <Animated.View entering={FadeInUp.delay(600).springify()} style={styles.ticketContainer}>
          <View ref={qrRef} collapsable={false} style={styles.ticketRef}>
            <GlassCard style={styles.glassTicket}>
              <View style={styles.ticketHeader}>
                 <View>
                    <Text style={styles.passLabel}>DIGITAL PASS</Text>
                    <Text style={styles.passValue}>PREMIUM ACCESS</Text>
                 </View>
                 <View style={styles.statusBadge}>
                    <View style={styles.statusDot} />
                    <Text style={styles.statusText}>ACTIVE</Text>
                 </View>
              </View>

              <View style={styles.qrContainer}>
                <BlurView intensity={20} tint="light" style={styles.qrBlur}>
                  <QRCode
                    value={created_ticket_id}
                    size={180}
                    color="#FFF"
                    backgroundColor="transparent"
                  />
                </BlurView>
                <View style={styles.qrCornerGlow}>
                  <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
                </View>
              </View>

              <View style={styles.ticketDivider}>
                 <View style={styles.cutoutLeft} />
                 <View style={styles.dashLine} />
                 <View style={styles.cutoutRight} />
              </View>

              <View style={styles.ticketFooter}>
                 <View style={styles.footerGrid}>
                    <View style={styles.footerItem}>
                       <Text style={styles.fLabel}>VEHICLE PLATE</Text>
                       <Text style={styles.fValue}>{vehicle_number}</Text>
                    </View>
                    <View style={styles.footerItem}>
                       <Text style={styles.fLabel}>REF CODE</Text>
                       <Text style={styles.fValue}>{created_ticket_id.substring(0, 8).toUpperCase()}</Text>
                    </View>
                 </View>
                 <Text style={styles.instruction}>SCAN AT NODE GATE TO INITIALIZE ENTRY</Text>
              </View>
            </GlassCard>
          </View>
        </Animated.View>

        <View style={styles.actionRow}>
           <GlassCard style={styles.actionCard} onPress={handleSave}>
              <Ionicons name="download" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>ARCHIVE</Text>
           </GlassCard>
           <GlassCard style={styles.actionCard} onPress={handleShare}>
              <Ionicons name="share-social" size={24} color={colors.primary} />
              <Text style={styles.actionLabel}>UPLINK</Text>
           </GlassCard>
        </View>

        <View style={{ height: FOOTER_SPACER_HEIGHT }} />
      </ScrollView>

      <View style={styles.footer}>
        <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
        <GlassButton 
          label="VIEW ACTIVE TICKETS" 
          onPress={handleDone} 
          variant="primary"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  progressTrack: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.success,
    shadowColor: colors.success,
    shadowRadius: 10,
    shadowOpacity: 0.5,
  },
  progressLabel: {
    fontSize: 9,
    color: colors.success,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scrollContent: {
    paddingVertical: 20,
  },
  topSection: {
    alignItems: 'center',
    paddingHorizontal: 32,
    marginBottom: 40,
  },
  iconWrapper: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  glowRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.success,
    opacity: 0.2,
    overflow: 'hidden',
  },
  successIcon: {
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
  },
  ticketContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  ticketRef: {
    borderRadius: 32,
    overflow: 'hidden',
  },
  glassTicket: {
    padding: 0,
    borderRadius: 32,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.02)',
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  passLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 2,
  },
  passValue: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success + '20',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    color: colors.success,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  qrContainer: {
    alignItems: 'center',
    padding: 40,
    position: 'relative',
  },
  qrBlur: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  qrCornerGlow: {
    position: 'absolute',
    width: 100,
    height: 100,
    backgroundColor: colors.primary,
    opacity: 0.05,
    overflow: 'hidden',
  },
  ticketDivider: {
    height: 40,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cutoutLeft: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A0F1E',
    position: 'absolute',
    left: -20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  cutoutRight: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0A0F1E',
    position: 'absolute',
    right: -20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  dashLine: {
    flex: 1,
    marginHorizontal: 30,
    height: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderStyle: Platform.OS === 'ios' ? 'dashed' : 'solid',
  },
  ticketFooter: {
    padding: 24,
  },
  footerGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  footerItem: {
    gap: 4,
  },
  fLabel: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
  fValue: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '900',
  },
  instruction: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: 1,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 24,
  },
  actionCard: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 24,
    gap: 10,
  },
  actionLabel: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    paddingHorizontal: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    justifyContent: 'center',
    overflow: 'hidden',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
  },
  centerError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0A0F1E',
    padding: 40,
  },
  errorText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 20,
    letterSpacing: 1,
  }
});
