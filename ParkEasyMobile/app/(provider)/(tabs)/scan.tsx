import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  Vibration,
  Platform
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut,
  ZoomIn,
  SlideInUp
} from 'react-native-reanimated';
import { colors } from '../../../constants/colors';
import { post } from '../../../services/api';
import { GlassCard } from '../../../components/ui/GlassCard';
import { useToast } from '../../../components/Toast';

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.75;

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const { showToast } = useToast();
  const [result, setResult] = useState<{ status: 'success' | 'warning' | 'error', message: string, data?: any } | null>(null);
  
  const scanLineY = useSharedValue(0);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(scanAreaSize, { duration: 1500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );

    return () => {
      if (resetTimer.current) clearTimeout(resetTimer.current);
    };
  }, [permission]);

  const animatedLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: withTiming(scanned ? 0 : 1, { duration: 200 }),
  }));

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          style={styles.permissionIcon}
        >
          <Ionicons name="camera" size={40} color="white" />
        </LinearGradient>
        <Text style={styles.permissionTitle}>Camera Access Required</Text>
        <Text style={styles.permissionSub}>We need your permission to scan entry and exit QR codes at the gate.</Text>
        <TouchableOpacity style={styles.grantBtn} onPress={requestPermission}>
          <Text style={styles.grantBtnText}>Grant Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    Vibration.vibrate([0, 50, 10, 50]);

    try {
      let ticketId = data;
      try {
        const parsed = JSON.parse(data);
        ticketId = parsed.ticketId || data;
      } catch (e) {}

      const response = await post('/bookings/checkout', { ticket_id: ticketId });
      const ticketData = response.data?.data;

      if (ticketData?.payment_status === 'PENDING') {
        setResult({
          status: 'warning',
          message: `Check-out recorded, but PAYMENT PENDING. Collect ₹${ticketData.total_fee} cash.`,
          data: ticketData
        });
      } else {
        const successMsg = ticketData?.slot?.slot_number 
          ? `Exit Authorized! Gate opened for slot ${ticketData.slot.slot_number}`
          : 'Exit Authorized! Checkout complete.';
          
        setResult({
          status: 'success',
          message: successMsg,
          data: ticketData
        });
      }
    } catch (error: any) {
      setResult({
        status: 'error',
        message: error.response?.data?.message || 'Invalid or Expired QR Code.'
      });
      Vibration.vibrate(200);
    } finally {
      setLoading(false);
      resetTimer.current = setTimeout(() => {
        handleReset();
      }, 5000);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setResult(null);
    setLoading(false);
    if (resetTimer.current) clearTimeout(resetTimer.current);
  };

  const handleToggleFlashlight = () => {
    setTorchEnabled(prev => !prev);
  };

  const handleOpenManualEntry = () => {
    showToast('Manual Entry: Coming soon', 'info');
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        enableTorch={torchEnabled}
      >
        <View style={styles.overlay}>
          {/* Header Bar */}
          <BlurView intensity={20} tint="dark" style={styles.header}>
            <TouchableOpacity style={styles.closeBtn} onPress={() => router.back()}>
              <Ionicons name="close" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>GATE SCANNER</Text>
            <View style={{ width: 44 }} />
          </BlurView>

          <View style={styles.scanContent}>
            <View style={styles.finderWrapper}>
              <View style={[styles.finder, result ? styles.finderInactive : null]}>
                <View style={[styles.corner, styles.topLeft]} />
                <View style={[styles.corner, styles.topRight]} />
                <View style={[styles.corner, styles.bottomLeft]} />
                <View style={[styles.corner, styles.bottomRight]} />
                
                <Animated.View style={[styles.scanLine, animatedLineStyle]} />
                
                {loading && (
                  <View style={styles.loadingBox}>
                    <ActivityIndicator size="large" color="white" />
                    <Text style={styles.loadingText}>AUTHORIZING...</Text>
                  </View>
                )}
              </View>

              {result && (
                <Animated.View entering={ZoomIn.duration(400)} style={styles.resultContainer}>
                  <GlassCard 
                    style={[
                      styles.resultCard, 
                      result.status === 'success' ? styles.borderSuccess : 
                      result.status === 'warning' ? styles.borderWarning : styles.borderError
                    ]} 
                    intensity={40}
                  >
                    <View style={[
                      styles.statusIconBox, 
                      { backgroundColor: result.status === 'success' ? colors.success : 
                        result.status === 'warning' ? colors.warning : colors.danger }
                    ]}>
                      <Ionicons 
                        name={result.status === 'success' ? 'checkmark' : result.status === 'warning' ? 'alert' : 'close'} 
                        size={40} 
                        color="white" 
                      />
                    </View>
                    <Text style={styles.resultStatusTitle}>
                      {result.status === 'success' ? 'AUTHORIZED' : result.status === 'warning' ? 'ACTION REQ.' : 'DENIED'}
                    </Text>
                    <Text style={styles.resultMsg}>{result.message}</Text>
                    
                    <TouchableOpacity style={styles.resetDirect} onPress={handleReset}>
                      <Text style={styles.resetDirectText}>READY FOR NEXT</Text>
                    </TouchableOpacity>
                  </GlassCard>
                </Animated.View>
              )}
            </View>

            {!result && (
              <Animated.View entering={FadeIn.delay(500)} style={styles.hintBox}>
                <Ionicons name="scan-circle" size={20} color="white" />
                <Text style={styles.hintText}>Position QR code within frame</Text>
              </Animated.View>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity 
              style={styles.flashlightBtn} 
              activeOpacity={0.7}
              onPress={handleToggleFlashlight}
            >
              <BlurView intensity={30} tint="light" style={[styles.flashIconBox, torchEnabled && { backgroundColor: 'rgba(255,255,255,0.4)' }]}>
                <Ionicons name={torchEnabled ? "flashlight" : "flashlight-outline"} size={24} color="white" />
              </BlurView>
              <Text style={styles.footerLabel}>Flashlight</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.manualEntryBtn} 
              activeOpacity={0.7}
              onPress={handleOpenManualEntry}
            >
              <BlurView intensity={30} tint="light" style={styles.manualIconBox}>
                <Ionicons name="keypad" size={24} color="white" />
              </BlurView>
              <Text style={styles.footerLabel}>Enter ID</Text>
            </TouchableOpacity>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  closeBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 2,
  },
  scanContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finderWrapper: {
    width: scanAreaSize,
    height: scanAreaSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  finder: {
    width: '100%',
    height: '100%',
    position: 'relative',
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  finderInactive: {
    opacity: 0.2,
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
    borderWidth: 6,
    zIndex: 10,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 30 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 30 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 30 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 30 },
  
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primary,
    position: 'absolute',
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 15,
      },
      android: {
        elevation: 20,
      }
    }),
  },
  loadingBox: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  loadingText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 2,
  },
  resultContainer: {
    position: 'absolute',
    width: width * 0.85,
    zIndex: 100,
  },
  resultCard: {
    borderRadius: 32,
    padding: 32,
    alignItems: 'center',
    borderWidth: 2,
  },
  statusIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 10,
    shadowColor: 'black',
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  resultStatusTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: 3,
    marginBottom: 12,
  },
  resultMsg: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    opacity: 0.9,
    marginBottom: 24,
  },
  borderSuccess: { borderColor: colors.success },
  borderWarning: { borderColor: colors.warning },
  borderError: { borderColor: colors.danger },
  
  resetDirect: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  resetDirectText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  hintBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    marginTop: 40,
  },
  hintText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 40,
    paddingBottom: 80,
  },
  flashlightBtn: {
    alignItems: 'center',
    gap: 8,
  },
  manualEntryBtn: {
    alignItems: 'center',
    gap: 8,
  },
  flashIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  manualIconBox: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    overflow: 'hidden',
  },
  footerLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '800',
    opacity: 0.7,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 40,
  },
  permissionIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    elevation: 8,
  },
  permissionTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.textPrimary,
    marginBottom: 12,
    textAlign: 'center',
  },
  permissionSub: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  grantBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 20,
    width: '100%',
    alignItems: 'center',
    elevation: 4,
  },
  grantBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '900',
  }
});
