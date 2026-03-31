import React, { useState, useRef } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp, Layout } from 'react-native-reanimated';
import { useAuthStore } from '../../store/authStore';
import { post } from '../../services/api';
import { colors } from '../../constants/colors';
import { useToast } from '../../components/Toast';
import { GlassCard } from '../../components/ui/GlassCard';
const { width } = Dimensions.get('window');

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const handleSignup = async () => {
    if (!name || !email || !password || !phone) {
      showToast('All fields are mandatory.', 'info');
      triggerShake();
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('Please enter a valid email address.', 'error');
      triggerShake();
      return;
    }

    if (password.length < 6) {
      showToast('Password is too short (min 6 chars).', 'error');
      triggerShake();
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await post('/auth/register', {
        full_name: name,
        email,
        phone_number: phone,
        password
      });

      if (response.data && response.data.data) {
        const { user, accessToken, refreshToken } = response.data.data;
        await login(
          { id: user.id, full_name: user.full_name, email: user.email, phone_number: user.phone_number, role: user.role },
          accessToken,
          refreshToken
        );

        showToast('Welcome to ParkEasy!', 'success');
        router.replace('/(customer)');
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || 'Registration failed. Try again.';
      showToast(msg, 'error');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
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
          <Animated.View entering={FadeInUp.duration(800).springify()} style={styles.header}>
            <Text style={styles.title}>Join the Network</Text>
            <Text style={styles.subtitle}>Smarter parking, easier life.</Text>
          </Animated.View>

          <RNAnimated.View style={[styles.formWrapper, { transform: [{ translateX: shakeAnimation }] }]}>
            <Animated.View entering={FadeInDown.delay(100).springify()}>
              <GlassCard style={styles.signupCard} intensity={20}>
                
                <View style={styles.inputGroup}>
                  <Text style={styles.label}>FULL NAME</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="person-outline" size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      placeholder="e.g. John Doe"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      value={name}
                      onChangeText={setName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>EMAIL ADDRESS</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="mail-outline" size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      placeholder="john@example.com"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      value={email}
                      onChangeText={setEmail}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>PHONE NUMBER</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="call-outline" size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      placeholder="+1 (555) 000-0000"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      keyboardType="phone-pad"
                      value={phone}
                      onChangeText={setPhone}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.label}>CREATE PASSWORD</Text>
                  <View style={styles.inputBox}>
                    <Ionicons name="lock-closed-outline" size={20} color="rgba(255,255,255,0.4)" />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••••"
                      placeholderTextColor="rgba(255,255,255,0.2)"
                      secureTextEntry={!showPassword}
                      value={password}
                      onChangeText={setPassword}
                    />
                    <TouchableOpacity 
                      onPress={() => setShowPassword(!showPassword)}
                      accessible={true}
                      accessibilityRole="button"
                      accessibilityLabel={showPassword ? "Hide password" : "Show password"}
                      accessibilityHint="Toggles visibility of the password field"
                    >
                      <Ionicons 
                        name={showPassword ? "eye-off" : "eye"} 
                        size={20} 
                        color="white" 
                        style={{ opacity: 0.5 }} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity 
                  style={[styles.signupBtn, isSubmitting && styles.btnDisabled]} 
                  onPress={handleSignup}
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
                      <Text style={styles.signupBtnText}>Create My Account</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <View style={styles.loginHint}>
                  <Text style={styles.loginHintText}>Already a member?</Text>
                  <Link href="/(auth)/login" asChild>
                    <TouchableOpacity>
                      <Text style={styles.loginLinkText}>Sign In</Text>
                    </TouchableOpacity>
                  </Link>
                </View>
              </GlassCard>
            </Animated.View>
          </RNAnimated.View>

          <Text style={styles.termsText}>
            By signing up, you agree to our Terms of Service and Privacy Policy.
          </Text>
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
    top: -100,
    left: -50,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: colors.primary,
    opacity: 0.1,
  },
  bgCircle2: {
    position: 'absolute',
    bottom: -100,
    right: -50,
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
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: '900',
    color: 'white',
    letterSpacing: -1,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    fontWeight: '600',
    marginTop: 4,
  },
  formWrapper: {
    width: '100%',
  },
  signupCard: {
    borderRadius: 32,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 9,
    fontWeight: '900',
    color: 'rgba(255,255,255,0.4)',
    letterSpacing: 1.5,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 16,
    paddingHorizontal: 16,
    height: 52,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginLeft: 12,
  },
  signupBtn: {
    borderRadius: 20,
    overflow: 'hidden',
    height: 60,
    marginTop: 16,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  btnGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  signupBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '900',
  },
  loginHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
    gap: 6,
  },
  loginHintText: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: 13,
    fontWeight: '600',
  },
  loginLinkText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '900',
    textDecorationLine: 'underline',
  },
  termsText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
    textAlign: 'center',
    marginTop: 32,
    lineHeight: 18,
    paddingHorizontal: 20,
  },
});
