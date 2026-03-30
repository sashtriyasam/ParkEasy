import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Alert, 
  Dimensions,
  ActivityIndicator,
  Vibration
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../../constants/colors';
import { post } from '../../../services/api';
import { router } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming,
  withSequence,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';

const { width, height } = Dimensions.get('window');
const scanAreaSize = width * 0.72;

export default function QRScannerScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ status: 'success' | 'warning' | 'error', message: string } | null>(null);
  
  const scanLineY = useSharedValue(0);
  const resetTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
    
    // Scan line animation
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(scanAreaSize, { duration: 2000, easing: Easing.inOut(Easing.quad) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.quad) })
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
  }));

  if (!permission || !permission.granted) {
    return (
      <View style={styles.center}>
        <Ionicons name="camera-outline" size={64} color={colors.textMuted} />
        <Text style={styles.text}>Camera access is required to scan tickets</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;
    setScanned(true);
    setLoading(true);
    Vibration.vibrate(50);

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
          message: `Check-out recorded, but PAYMENT IS PENDING (₹${ticketData.total_fee}). Please collect cash.`
        });
      } else {
        setResult({
          status: 'success',
          message: 'Check-out Successful! Slot is now FREE.'
        });
      }
    } catch (error: any) {
      setResult({
        status: 'error',
        message: error.response?.data?.message || 'Invalid QR code or booking not found.'
      });
    } finally {
      setLoading(false);
      // Auto-reset after 3.5 seconds
      resetTimer.current = setTimeout(() => {
        handleReset();
      }, 3500);
    }
  };

  const handleReset = () => {
    setScanned(false);
    setResult(null);
    setLoading(false);
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
      >
        <View style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Ionicons name="close" size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Gate Scanner</Text>
          </View>

          <View style={styles.scanWrapper}>
            <View style={styles.scanArea}>
              <View style={[styles.corner, styles.topLeft]} />
              <View style={[styles.corner, styles.topRight]} />
              <View style={[styles.corner, styles.bottomLeft]} />
              <View style={[styles.corner, styles.bottomRight]} />
              
              {!scanned && (
                <Animated.View style={[styles.scanLine, animatedLineStyle]} />
              )}

              {loading && (
                <View style={styles.loadingOverlay}>
                  <ActivityIndicator size="large" color="white" />
                </View>
              )}
            </View>
            
            {result ? (
              <Animated.View 
                entering={FadeIn.duration(300)} 
                exiting={FadeOut.duration(300)}
                style={[
                  styles.resultCard,
                  result.status === 'success' && styles.resultSuccess,
                  result.status === 'warning' && styles.resultWarning,
                  result.status === 'error' && styles.resultError
                ]}
              >
                <Ionicons 
                  name={result.status === 'success' ? 'checkmark-circle' : result.status === 'warning' ? 'alert-circle' : 'close-circle'} 
                  size={48} 
                  color="white" 
                />
                <Text style={styles.resultText}>{result.message}</Text>
                <Text style={styles.autoResetText}>Resetting in 3s...</Text>
              </Animated.View>
            ) : (
              <Text style={styles.hint}>Align QR pack inside the frame</Text>
            )}
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
              <Ionicons name="refresh" size={20} color="white" />
              <Text style={styles.resetText}>Manual Reset</Text>
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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: 24,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
    justifyContent: 'space-between',
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 44, // Balance backButton
  },
  scanWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanArea: {
    width: scanAreaSize,
    height: scanAreaSize,
    position: 'relative',
    borderRadius: 24,
    overflow: 'hidden',
  },
  scanLine: {
    width: '100%',
    height: 3,
    backgroundColor: colors.primary,
    position: 'absolute',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: 'white',
    borderWidth: 4,
    zIndex: 10,
  },
  topLeft: { top: 0, left: 0, borderBottomWidth: 0, borderRightWidth: 0, borderTopLeftRadius: 16 },
  topRight: { top: 0, right: 0, borderBottomWidth: 0, borderLeftWidth: 0, borderTopRightRadius: 16 },
  bottomLeft: { bottom: 0, left: 0, borderTopWidth: 0, borderRightWidth: 0, borderBottomLeftRadius: 16 },
  bottomRight: { bottom: 0, right: 0, borderTopWidth: 0, borderLeftWidth: 0, borderBottomRightRadius: 16 },
  
  resultCard: {
    position: 'absolute',
    bottom: 20,
    width: width - 40,
    padding: 24,
    borderRadius: 24,
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  resultSuccess: { backgroundColor: 'rgba(16, 185, 129, 0.9)' },
  resultWarning: { backgroundColor: 'rgba(245, 158, 11, 0.9)' },
  resultError: { backgroundColor: 'rgba(239, 68, 68, 0.9)' },
  
  resultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  autoResetText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 4,
  },
  hint: {
    color: 'white',
    marginTop: 40,
    fontSize: 16,
    fontWeight: '500',
    opacity: 0.8,
  },
  footer: {
    paddingBottom: 60,
    alignItems: 'center',
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 20,
    gap: 8,
  },
  resetText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: colors.textSecondary,
    fontSize: 16,
    textAlign: 'center',
    marginVertical: 20,
  },
  button: {
    backgroundColor: colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  }
});
