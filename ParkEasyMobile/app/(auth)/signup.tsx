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

const { width, height } = Dimensions.get('window');

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const router = useRouter();
  
  const handleTerms = () => {
    Alert.alert(
      "PARKEASY CORE NEURAL LAWS",
      "System level Operating Directives are currently locked. Please contact your regional node administrator for physical hard-copy access.",
      [{ text: "ACKNOWLEDGE", style: "default" }]
    );
  };

  const handlePrivacy = () => {
    Alert.alert(
      "DATA SOVEREIGNTY PROTOCOLS",
      "Your biometric and identity signatures are hashed and stored in a decentralized cold-storage vault. For manual log extraction, initiate Request Level 4.",
      [{ text: "ACKNOWLEDGE", style: "default" }]
    );
  };

  const handleSignup = async () => {
    if (isSubmitting) return;
    if (!name || !email || !password || !phone) {
      showToast('ALL COORDINATES MANDATORY', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast('INVALID IDENTITY FORMAT', 'error');
      return;
    }

    if (password.length < 6) {
      showToast('SIGNATURE TOO BRIEF (MIN 6)', 'error');
      return;
    }

    const sanitizedPhone = phone.replace(/\D/g, '');
    if (sanitizedPhone.length < 10) {
      showToast('INVALID CONTACT (MIN 10 DIGITS)', 'error');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await post('/auth/register', {
        full_name: name,
        email,
        phone_number: sanitizedPhone,
        password
      });

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
        showToast('IDENTITY INITIALIZED', 'success');
        router.replace('/(customer)');
      }
    } catch (e: any) {
      const msg = e.response?.data?.message || 'INITIALIZATION FAILURE';
      showToast(msg, 'error');
    } finally {
      setIsSubmitting(false);
    }
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
              <BlurView intensity={20} tint="dark" style={styles.logoBlur}>
                <Text style={styles.logoText}>P</Text>
              </BlurView>
              <View style={styles.logoGlow}>
                <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
              </View>
            </View>
            <Text style={styles.title}>INITIALIZE IDENTITY</Text>
            <Text style={styles.subtitle}>PROTOCOL PHASE: NEW NODE ENTRY</Text>
          </Animated.View>

          <Animated.View entering={FadeInUp.delay(400).duration(1000)}>
            <GlassCard style={styles.card}>
              <View style={styles.formLabel}>
                <Ionicons name="sparkles-outline" size={14} color={colors.primary} />
                <Text style={styles.formLabelText}>ESTABLISH COORDINATES</Text>
              </View>

              <GlassInput
                label="FULL LEGAL NAME"
                placeholder="OPERATOR_NAME"
                icon="person-outline"
                value={name}
                onChangeText={setName}
              />

              <GlassInput
                label="IDENTITY (EMAIL)"
                placeholder="ID@PROTOCOL.HOST"
                icon="mail-outline"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />

              <GlassInput
                label="KINETIC CONTACT (PHONE)"
                placeholder="+91 00000 00000"
                icon="call-outline"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
              
              <GlassInput
                label="SECURE SIGNATURE (PASSWORD)"
                placeholder="••••••••"
                icon="lock-closed-outline"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              <GlassButton 
                label={isSubmitting ? "PROCESSING..." : "CONFIRM INITIALIZATION"} 
                onPress={handleSignup} 
                variant="primary"
                disabled={isSubmitting}
                style={styles.actionBtn}
              />

              <View style={styles.switchBox}>
                <Text style={styles.switchText}>EXISTING SIGNATURE? </Text>
                <Link href="/(auth)/login" asChild>
                  <Pressable>
                    <Text style={styles.switchLink}>RESTORE SESSION</Text>
                  </Pressable>
                </Link>
              </View>
            </GlassCard>
          </Animated.View>

          <View style={styles.policyHost}>
             <Ionicons name="information-circle-outline" size={12} color="rgba(255,255,255,0.2)" />
             <Text style={styles.policyText}>
               BY INITIALIZING, YOU CONFORM TO THE {' '}
               <Text 
                 style={styles.link} 
                 onPress={handleTerms}
                 accessibilityRole="link"
               >PARKEASY CORE NEURAL LAWS</Text>
               {' '} AND {' '}
               <Text 
                 style={styles.link} 
                 onPress={handlePrivacy}
                 accessibilityRole="link"
               >DATA SOVEREIGNTY PROTOCOLS</Text>.
             </Text>
          </View>
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
    paddingTop: height * 0.06,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  logoGlass: {
    width: 64,
    height: 64,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    marginBottom: 20,
    position: 'relative',
    backgroundColor: colors.primary + '10',
  },
  logoBlur: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    color: '#FFF',
    fontSize: 32,
    fontWeight: '900',
  },
  logoGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    backgroundColor: colors.primaryGlow,
    borderRadius: 30,
    overflow: 'hidden',
    alignSelf: 'center',
    top: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: '#FFF',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.3)',
    fontWeight: '800',
    marginTop: 8,
    letterSpacing: 2,
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
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1,
  },
  actionBtn: {
    marginTop: 12,
    marginBottom: 24,
  },
  switchBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
  },
  switchText: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  switchLink: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  policyHost: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 40,
    paddingHorizontal: 20,
  },
  policyText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    lineHeight: 18,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  link: {
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});
