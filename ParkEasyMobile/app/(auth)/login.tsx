import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Animated } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { post } from '../../services/api';
import { colors } from '../../constants/colors';

import { User } from '../../types';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  const { login } = useAuthStore();
  const router = useRouter();

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnimation, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in both fields.');
      triggerShake();
      return;
    }

    // SIMPLE AND SHORT BYPASS
    if (email === '1' && password === '1') {
      const mockUser: User = {
        id: 'mock-customer-id',
        name: 'Test Customer',
        email: 'customer@test.com',
        phone: '1234567890',
        role: 'customer'
      };
      await login(mockUser, 'mock-token', 'mock-refresh');
      router.replace('/(customer)');
      return;
    }

    if (email === '2' && password === '2') {
      const mockUser: User = {
        id: 'mock-provider-id',
        name: 'Test Provider',
        email: 'provider@test.com',
        phone: '0987654321',
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
          name: user.full_name,
          email: user.email,
          phone: user.phone_number || '',
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
      console.error('Login Error:', e);
      setError(e.response?.data?.message || 'Login failed. Please try again.');
      triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Animated.View style={[styles.formContainer, { transform: [{ translateX: shakeAnimation }] }]}>
          <View style={styles.devBanner}>
            <Ionicons name="construct" size={14} color={colors.warning} />
            <Text style={styles.devBannerText}>Developer Preview Alpha (Use 1/1 or 2/2)</Text>
          </View>
          
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Log in into ParkEasy to continue</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (error) setError('');
            }}
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Password"
              placeholderTextColor={colors.textMuted}
              secureTextEntry={!showPassword}
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (error) setError('');
              }}
            />
            <TouchableOpacity 
              style={styles.eyeButton} 
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons 
                name={showPassword ? "eye-off-outline" : "eye-outline"} 
                size={20} 
                color={colors.textSecondary} 
              />
            </TouchableOpacity>
          </View>
          
          {error ? <Text style={styles.errorText}>{error}</Text> : null}
          
          <TouchableOpacity 
            style={[styles.button, isSubmitting && styles.buttonDisabled]} 
            onPress={handleLogin}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            <Text style={[styles.buttonText, isSubmitting && styles.buttonTextDisabled]}>
              {isSubmitting ? 'Logging in...' : 'Login'}
            </Text>
          </TouchableOpacity>
          
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity activeOpacity={0.8}>
                <Text style={styles.signupLink}>Sign up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  formContainer: {
    backgroundColor: colors.surface,
    padding: 32,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 24,
    elevation: 3,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)',
  },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.warning + '15',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 20,
    gap: 6,
    borderWidth: 1,
    borderColor: colors.warning + '30',
  },
  devBannerText: {
    fontSize: 12,
    color: colors.warning,
    fontWeight: '700',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.textPrimary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 32,
  },
  input: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    padding: 16,
    fontSize: 16,
    color: colors.textPrimary,
  },
  eyeButton: {
    padding: 16,
  },
  errorText: {
    color: colors.danger,
    marginBottom: 16,
    fontSize: 14,
    fontWeight: '500',
  },
  button: {
    backgroundColor: colors.primary,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    backgroundColor: colors.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  buttonText: {
    color: colors.surface,
    fontSize: 16,
    fontWeight: '700',
  },
  buttonTextDisabled: {
    color: colors.textMuted,
  },
  signupContainer: {
    flexDirection: 'row',
    marginTop: 32,
    justifyContent: 'center',
  },
  signupText: {
    color: colors.textSecondary,
    fontSize: 15,
  },
  signupLink: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 15,
  },
});
