import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions,
  ActivityIndicator,
  Vibration,
  Platform,
  StatusBar
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useNetInfo } from '@react-native-community/netinfo';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  ZoomIn,
  FadeOut
} from 'react-native-reanimated';
import { post } from '../../../services/api';
import { useToast } from '../../../components/Toast';
import { colors } from '../../../constants/colors';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

const { width } = Dimensions.get('window');
const scanAreaSize = width * 0.75;

export default function QRScannerScreen() {
  const router = useRouter();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [torchEnabled, setTorchEnabled] = useState(false);
  const { showToast } = useToast();
  const [result, setResult] = useState<{ status: 'success' | 'warning' | 'error', message: string, data?: any } | null>(null);
  
  const netInfo = useNetInfo();
  const isConnected = netInfo.isConnected ?? false;
  
  const scanLineY = useSharedValue(0);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(scanAreaSize, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.quad) })
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
      <View style={styles.permissionContainer}>
        <StatusBar barStyle="light-content" />
        <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />
        
        <Animated.View entering={ZoomIn.duration(600)} style={styles.permissionCard}>
          <View style={styles.permIconWrapper}>
            <Ionicons name="camera" size={48} color={colors.primary} />
            <View style={styles.permGlow} />
          </View>
          <Text style={styles.permTitle}>OPTICAL ACCESS REQUIRED</Text>
          <Text style={styles.permSubtitle}>
            System needs to initialize camera protocols to verify digital parking passes at the nodes.
          </Text>
          <GlassButton label="GRANT ACCESS" onPress={requestPermission} variant="primary" />
        </Animated.View>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    Vibration.vibrate([0, 50, 20, 50]);

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
          message: `PROTOCOL WARNING: PENDING VALUATION DETECTED.`,
          data: ticketData
        });
      } else {
        setResult({
          status: 'success',
          message: `PROTOCOL SECURED: NODE ${ticketData?.slot?.slot_number} VERIFIED FOR EXIT.`,
          data: ticketData
        });
      }
    } catch (error: any) {
      setResult({
        status: 'error',
        message: error.response?.data?.message || 'INVALID SIGNATURE DETECTED.'
      });
      Vibration.vibrate(200);
    } finally {
      setLoading(false);
      resetTimer.current = setTimeout(() => {
        handleReset();
      }, 15000);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setResult(null);
    setLoading(false);
    if (resetTimer.current) clearTimeout(resetTimer.current);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
        enableTorch={torchEnabled}
      >
        <LinearGradient 
          colors={['rgba(10, 15, 30, 0.7)', 'transparent', 'rgba(10, 15, 30, 0.7)']} 
          style={StyleSheet.absoluteFill} 
        />
        
        {/* Procedural Overlay UI */}
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.navBtn} onPress={() => router.back()}>
              <BlurView intensity={30} tint="dark" style={styles.navBlur}>
                <Ionicons name="chevron-back" size={24} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
            
            <View style={styles.headerInfo}>
              <Text style={styles.headerTitle}>SECURE SCANNER</Text>
              <Text style={styles.headerSubtitle}>PROTOCOL PHASE: VERIFICATION</Text>
            </View>

            <TouchableOpacity 
              style={[styles.navBtn, torchEnabled && styles.torchActive]} 
              onPress={() => setTorchEnabled(!torchEnabled)}
            >
              <BlurView intensity={30} tint="dark" style={styles.navBlur}>
                <Ionicons name={torchEnabled ? "flashlight" : "flashlight-outline"} size={22} color="#FFF" />
              </BlurView>
            </TouchableOpacity>
          </View>

          <View style={styles.scanViewport}>
            <View style={styles.targetFrame}>
              {/* Corners */}
              <View style={[styles.corner, styles.tl]} />
              <View style={[styles.corner, styles.tr]} />
              <View style={[styles.corner, styles.bl]} />
              <View style={[styles.corner, styles.br]} />

              {!scanned && (
                <Animated.View style={[styles.scanLine, animatedLineStyle]}>
                  <LinearGradient
                    colors={['transparent', colors.primary, 'transparent']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={StyleSheet.absoluteFill}
                  />
                  <View style={styles.lineGlow} />
                </Animated.View>
              )}

              {loading && (
                <View style={styles.processingMask}>
                  <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.processingText}>ANALYZING SIGNATURE...</Text>
                </View>
              )}

              {result && (
                <Animated.View entering={ZoomIn.duration(400)} style={styles.resultMask}>
                  <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
                  <View style={styles.resultContent}>
                    <View style={[
                      styles.resultIconWrapper, 
                      { backgroundColor: result.status === 'success' ? colors.success + '20' : result.status === 'warning' ? '#FACC1520' : colors.danger + '20' }
                    ]}>
                      <Ionicons 
                        name={result.status === 'success' ? 'shield-checkmark' : result.status === 'warning' ? 'alert-circle' : 'close-circle'} 
                        size={48} 
                        color={result.status === 'success' ? colors.success : result.status === 'warning' ? '#FACC15' : colors.danger} 
                      />
                      <View style={[styles.iconRipple, { borderColor: result.status === 'success' ? colors.success : colors.danger }]} />
                    </View>
                    <Text style={[
                      styles.resultStatus,
                      { color: result.status === 'success' ? colors.success : result.status === 'warning' ? '#FACC15' : colors.danger }
                    ]}>
                      {result.status === 'success' ? 'ACCESS GRANTED' : result.status === 'warning' ? 'VALUATION REQUIRED' : 'ACCESS DENIED'}
                    </Text>
                    <Text style={styles.resultDetails}>{result.message}</Text>
                    
                    <TouchableOpacity style={styles.resetPill} onPress={handleReset}>
                      <Text style={styles.resetPillText}>INITIALIZE NEXT SCAN</Text>
                    </TouchableOpacity>
                  </View>
                </Animated.View>
              )}
            </View>
          </View>

          <View style={styles.footer}>
            {!result && !loading && (
              <Animated.View entering={FadeIn.delay(500)} style={styles.hintBox}>
                <BlurView intensity={20} tint="dark" style={styles.hintBlur}>
                   <Text style={styles.hintText}>ALIGN PASS SIGNATURE WITHIN FRAME</Text>
                </BlurView>
              </Animated.View>
            )}
            <View style={styles.statusIndicator}>
               <View style={[styles.statusDot, { backgroundColor: isConnected ? colors.success : colors.danger }]} />
               <Text style={styles.statusLabel}>{isConnected ? 'SECURE UPLINK ACTIVE' : 'NODE DISCONNECTED'}</Text>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

// Fallback removed for genuine connectivity check in QRScannerScreen

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  overlay: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  navBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  navBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  torchActive: {
    backgroundColor: colors.primary + '30',
    borderColor: colors.primary,
  },
  headerInfo: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 3,
  },
  headerSubtitle: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.4)',
    fontWeight: '800',
    marginTop: 4,
    letterSpacing: 1,
  },
  scanViewport: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetFrame: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
    borderRadius: 32,
    overflow: 'hidden',
  },
  corner: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderColor: colors.primary,
    borderWidth: 4,
  },
  tl: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 32 },
  tr: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 32 },
  bl: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 32 },
  br: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 32 },
  scanLine: {
    width: '100%',
    height: 4,
    position: 'absolute',
    zIndex: 10,
  },
  lineGlow: {
    position: 'absolute',
    width: '100%',
    height: 20,
    top: -8,
    backgroundColor: colors.primary,
    borderRadius: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 15,
    elevation: 8,
    opacity: 0.3,
  },
  processingMask: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  processingText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '900',
    marginTop: 20,
    letterSpacing: 2,
  },
  resultMask: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 100,
  },
  resultContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  resultIconWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  iconRipple: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1,
    opacity: 0.2,
  },
  resultStatus: {
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
    letterSpacing: 1.5,
  },
  resultDetails: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 40,
  },
  resetPill: {
    backgroundColor: '#FFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 20,
    shadowColor: '#FFF',
    shadowRadius: 20,
    shadowOpacity: 0.3,
  },
  resetPillText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#000',
    letterSpacing: 1,
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  hintBox: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
  },
  hintBlur: {
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  hintText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusLabel: {
    fontSize: 9,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '900',
    letterSpacing: 1,
  },
  permissionContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  permissionCard: {
    width: '100%',
    padding: 32,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  permIconWrapper: {
    width: 90,
    height: 90,
    borderRadius: 30,
    backgroundColor: colors.primary + '10',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    position: 'relative',
  },
  permGlow: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: colors.primary,
    borderRadius: 40,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
    opacity: 0.2,
  },
  permTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  permSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    lineHeight: 22,
    fontWeight: '600',
    marginBottom: 40,
  },
});
