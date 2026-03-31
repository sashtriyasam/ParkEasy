import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  ScrollView, 
  Animated as RNAnimated, 
  Dimensions,
  ActivityIndicator
} from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, ZoomIn } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { post } from '../../services/api';
import { colors } from '../../constants/colors';
import { useToast } from '../../components/Toast';
import { GlassCard } from '../../components/ui/GlassCard';
import { User } from '../../types';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const shakeAnimation = useRef(new RNAnimated.Value(0)).current;

  const { login } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();

  const triggerShake = () => {
    RNAnimated.sequence([
      RNAnimated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      RNAnimated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast('Credentials required to proceed.', 'info');
      triggerShake();
      return;
    }

    // BYPASS LOGIC
    if (email === '1' && password === '1') {
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

    if (email === '2' && password === '2') {
      const mockUser: User = {
        id: 'mock-provider-id',
        full_name: 'Sarah Chen',
        email: 'sarah@parkeasy.partner',
        phone_number: '9123456789',
        role: 'provider'
      };
      await login(mockUser, 'mock-token', 'mock-refresh');
      router.replace('/(provider)');
      return;
    }
    
    setError('');
    setIsSubmitting(true);
    
    try {
      const response = await post('/auth/login', { email, password });
      
      if (response.data && response.data.data) {
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
          router.replace('/(provider)');
        }
      }
    } catch (e: any) {
      if (__DEV__) {
        console.error('[LoginScreen] Auth failure details:', e.response?.data || e.message || e);
      }
      
      let msg = 'Unable to connect. Please check your network and try again.';
      const status = e.response?.status;

      if (e.response) {
        if (status === 401 || status === 403) {
          msg = e.response.data?.message || 'Invalid credentials. Please try again.';
        } else if (status >= 400 && status < 500) {
          msg = e.response.data?.message || 'Please check your information and try again.';
        } else if (status >= 500) {
          msg = 'Server error. Our team has been notified. Please try again later.';
        }
      }
        
      setError(msg);
      showToast(msg, 'error');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Immersive Background */}
      <View style={styles.bgWrapper}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark, '#000']}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bgCircle1} />
        <View style={styles.bgCircle2} />
      </View>

      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled" 
          showsVerticalScrollIndicator={false}
        >
          <Animated.View entering={FadeInUp.duration(1000).springify()} style={styles.brandContainer}>
            <View style={styles.logoBox}>
              <Ionicons name="navigate" size={40} color="white" />
            </View>
            <Text style={styles.brandTitle}>ParkEasy</Text>
            <Text style={styles.brandTagline}>Smarter Parking for Modern Cities</Text>
          </Animated.View>

          <RNAnimated.View style={[styles.formWrapper, { transform: [{ translateX: shakeAnimation }] }]}>
            <Animated.View entering={FadeInDown.delay(200).duration(800).springify()}>
              <GlassCard style={styles.loginCard} intensity={25}>
                <Text style={styles.cardTitle}>Sign In</Text>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.5)" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={(text) => {
                        setEmail(text);
                        if (error) setError('');
                      }}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>SECURE PASSWORD</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.5)" />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={(text) => {
                        setPassword(text);
                        if (error) setError('');
                      }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="white" 
                        style={{ opacity: 0.6 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {error ? (
                  <Animated.View entering={ZoomIn} style={styles.errorContainer}>
                    <Ionicons name="alert-circle" size={16} color={colors.danger} />
                    <Text style={styles.errorText}>{error}</Text>
                  </Animated.View>
                ) : null}

                <TouchableOpacity 
                  style={styles.forgotBtn}
                  onPress={() => showToast('Feature coming soon', 'info')}
                >
                  <Text style={styles.forgotText}>Forgot Password?</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.loginBtn, isSubmitting && styles.btnLoading]} 
                  onPress={handleLogin}
                  disabled={isSubmitting}
                  activeOpacity={0.9}
                >
                  <LinearGradient
                    colors={[colors.primary, colors.primaryDark]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.btnGradient}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="white" />
                    ) : (
                      <>
                        <Text style={styles.loginBtnText}>Proceed to Dashboard</Text>
                        <Ionicons name="arrow-forward" size={18} color="white" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          </RNAnimated.View>

          <Animated.View entering={FadeInUp.delay(600)} style={styles.footer}>
            <Text style={styles.footerText}>New to ParkEasy?</Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Create Account</Text>
              </TouchableOpacity>
            </Link>
          </Animated.View>
          
          <Animated.View entering={FadeInUp.delay(800)} style={styles.devTag}>
            <View style={styles.devPill}>
              <Text style={styles.devTagText}>V2.4 STABLE RELEASE</Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  bgWrapper: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  bgCircle1: {
    position: 'absolute',
    top: -50,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.15,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -150,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: colors.primaryDark,
    opacity: 0.1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: height * 0.1,
    marginBottom: 40,
  },
  logoBox: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  brandTitle: {
    fontSize: 40,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1.5,
  },
  brandTagline: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 4,
    letterSpacing: 0.5,
  },
  formWrapper: {
    width: '100%',
  },
  loginCard: {
    borderRadius: 32,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: 'white',
    marginBottom: 32,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.5)',
    letterSpacing: 1.5,
    marginBottom: 10,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 12,
  },
  eyeBtn: {
    padding: 8,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: colors.primaryLight,
    fontSize: 13,
    fontWeight: '700',
  },
  loginBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 60,
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.4,
        shadowRadius: 15,
      },
      android: {
        elevation: 8,
      }
    }),
  },
  btnLoading: {
    opacity: 0.8,
  },
  btnGradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loginBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger + '20',
    padding: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
    borderWidth: 1,
    borderColor: colors.danger + '40',
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    gap: 8,
  },
  footerText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 14,
    fontWeight: '600',
  },
  signupLink: {
    color: 'white',
    fontSize: 14,
    fontWeight: '800',
    textDecorationLine: 'underline',
  },
  devTag: {
    alignItems: 'center',
    marginTop: 32,
  },
  devPill: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  devTagText: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.3)',
    letterSpacing: 1.5,
  },
});
