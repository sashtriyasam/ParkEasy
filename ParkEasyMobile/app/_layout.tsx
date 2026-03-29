import React, { useEffect } from 'react';
import { Redirect, Slot, useSegments, useRouter } from 'expo-router';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { useAuthStore } from '../store/authStore';
import { ToastContainer } from '../components/Toast';
import { useOTAUpdate } from '../hooks/useOTAUpdate';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function InitialLayout() {
  const { isInitialized, user } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!isInitialized) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login');
    } else if (user) {
      if (inAuthGroup || !segments[0]) {
        if (user.role === 'customer') {
          router.replace('/(customer)');
        } else if (user.role === 'provider') {
          router.replace('/(provider)');
        }
      }
    }
  }, [user, isInitialized, segments]);

  return <Slot />;
}

export default function RootLayout() {
  const { loadFromStorage, isInitialized } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, []);

  useEffect(() => {
    if (isInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isInitialized]);

  if (!isInitialized) return null;

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <InitialLayout />
        <ToastContainer />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
