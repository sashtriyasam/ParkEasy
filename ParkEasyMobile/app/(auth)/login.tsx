import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Pressable,
  StatusBar,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { post } from '../../services/api';
import { colors } from '../../constants/colors';
import { useToast } from '../../components/Toast';
import { User } from '../../types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassInput } from '../../components/ui/GlassInput';
import { GlassButton } from '../../components/ui/GlassButton';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  const handleForgotSignature = () => {
    Alert.alert(
      "IDENTITY RECOVERY",
      "Signature reset protocol is currently offline. Please contact internal support for node access.",
      [{ text: "ACKNOWLEDGE", style: "default" }]
    );
  };

  const handleLogin = async () => {
    if (isSubmitting) return;

    if (!email || !password) {
      showToast('CREDENTIALS REQUIRED', 'info');
      return;
    }

    // BYPASS LOGIC
    if ((email === '1' && password === '1') || (email === 'customer' && password === 'admin')) {
      const mockUser: User = {
        id: 'mock-customer-id',
        full_name: 'Alex Rivera',
        email: 'alex@parkeasy.premium',
        phone_number: '9876543210',
        role: 'customer'
      };
      await login(mockUser, 'mock-token', 'mock-refresh');
      router.replace('/(customer)');
      return;
    }

    if ((email === '2' && password === '2') || (email === 'provider' && password === 'admin')) {
      const mockUser: User = {
        id: 'mock-provider-id',
        full_name: 'Sarah Chen',
        email: 'sarah@parkeasy.partner',
        phone_number: '9123456789',
        role: 'provider'
      };
      await login(mockUser, 'mock-token', 'mock-refresh');
      router.replace('/(provider)/(tabs)');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await post('/auth/login', { email, password });

      if (response.data?.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        const mappedUser: User = {
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          phone_number: user.phone_number || '',
          role: user.role
        };

        await login(mappedUser, accessToken, refreshToken);

        if (mappedUser.role === 'customer') {
          router.replace('/(customer)');
        } else if (mappedUser.role === 'provider') {
          router.replace('/(provider)/(tabs)');
        }
      }
    } catch (e: any) {
      let msg = 'SYNCHRONIZATION FAILURE';
      if (e.response) {
        msg = e.response.data?.message || 'INVALID SIGNATURE';
      }
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('GOOGLE_ID_SYNC_OFFLINE', 'info');
  };

  const handleAppleSignIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    showToast('APPLE_ID_SYNC_OFFLINE', 'info');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#0A0F1E', '#161B2E']} style={StyleSheet.absoluteFill} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={ZoomIn.delay(200).duration(800)} style={styles.header}>
            <View style={styles.logoGlass}>
              <View style={styles.logoGlow}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              </View>
              <BlurView intensity={40} tint="dark" style={styles.logoBlur}>
                <Text style={styles.logoText}>P</Text>
              </BlurView>
            </View>
            <Text style={styles.title}>RESTORE SESSION</Text>
            <Text style={styles.subtitle}>PROTOCOL PHASE: IDENTITY VERIFICATION</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(1000)}>
            <GlassCard style={styles.card}>
              <View style={styles.formLabel}>
                <Ionicons name="finger-print-outline" size={14} color={colors.primary} />
                <Text style={styles.formLabelText}>NODE ACCESS COORDINATES</Text>
              </View>

              <GlassInput
                label="IDENTITY (EMAIL)"
                placeholder="USER_ID@PROTOCOL"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <GlassInput
                label="SECURE SIGNATURE (PASSWORD)"
                placeholder="••••••••"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <Pressable style={styles.forgotPass} onPress={handleForgotSignature}>
                <Text style={styles.forgotPassText}>FORGOT SIGNATURE?</Text>
              </Pressable>

              <GlassButton
                label={isSubmitting ? "INITIALIZING..." : "VERIFY IDENTITY"}
                onPress={handleLogin}
                variant="primary"
                disabled={isSubmitting}
                style={styles.loginBtn}
              />

              <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>EXTERNAL NODES</Text>
                <View style={styles.line} />
              </View>

              <View style={styles.socialRow}>
                <TouchableOpacity style={styles.socialBtn} onPress={handleGoogleSignIn}>
                  <BlurView intensity={10} tint="dark" style={styles.socialBlur}>
                    <Ionicons name="logo-google" size={20} color="#FFF" />
                    <Text style={styles.socialText}>GOOGLE</Text>
                  </BlurView>
                </TouchableOpacity>
                <TouchableOpacity style={styles.socialBtn} onPress={handleAppleSignIn}>
                  <BlurView intensity={10} tint="dark" style={styles.socialBlur}>
                    <Ionicons name="logo-apple" size={20} color="#FFF" />
                    <Text style={styles.socialText}>APPLE</Text>
                  </BlurView>
                </TouchableOpacity>
              </View>
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(600).duration(1000)} style={styles.footer}>
            <Text style={styles.footerText}>NEW TO THE GRID? </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={styles.signUpLink}>INITIALIZE ACCOUNT</Text>
              </Pressable>
            </Link>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0F1E',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: height * 0.1,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  logoGlass: {
    width: 80,
    height: 80,
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 24,
    position: 'relative',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  logoBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: -1,
  },
  logoGlow: {
    position: 'absolute',
    top: 10,
    left: 10,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    opacity: 0.2,
  },
  title: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '900',
    letterSpacing: 4,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: 10,
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 1,
  },
  card: {
    padding: 24,
  },
  formLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    opacity: 0.8,
  },
  formLabelText: {
    color: '#FFF',
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 2,
  },
  forgotPass: {
    alignSelf: 'flex-end',
    marginBottom: 32,
  },
  forgotPassText: {
    color: colors.primary,
    fontWeight: '900',
    fontSize: 10,
    letterSpacing: 1,
  },
  loginBtn: {
    marginBottom: 32,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  dividerText: {
    color: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 16,
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 2,
  },
  socialRow: {
    flexDirection: 'row',
    gap: 12,
  },
  socialBtn: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  socialBlur: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  socialText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 4,
  },
  footerText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  signUpLink: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
  }
});
