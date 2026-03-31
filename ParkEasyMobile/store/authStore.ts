import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';
import { disconnectSocket } from '../hooks/useSocket';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

/**
 * AUTH STORE — isInitialized lifecycle:
 * - Starts as false
 * - Set to true after loadFromStorage() completes (existing session restore)
 * - Set to true after login() completes (fresh login)
 * - Stays true after logout() (user is initialized, just unauthenticated)
 * AI TEST: isInitialized should ALWAYS become true within 2 seconds of app start.
 */
export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  isLoading: false,
  isInitialized: false,

  login: async (user, accessToken, refreshToken) => {
    set({ isLoading: true });
    try {
      await SecureStore.setItemAsync('user', JSON.stringify(user));
      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);
      set({ user, accessToken, isLoading: false, isInitialized: true });
    } catch (e) {
      console.error('Error storing auth info', e);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      disconnectSocket(); // Tear down socket before clearing auth
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({ user: null, accessToken: null, isLoading: false, isInitialized: true });
    } catch (e) {
      console.error('Error during logout', e);
      set({ isLoading: false });
    }
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      const storedUser = await SecureStore.getItemAsync('user');
      const token = await SecureStore.getItemAsync('accessToken');
      if (storedUser && token) {
        set({ user: JSON.parse(storedUser), accessToken: token });
      }
    } catch (e) {
      console.error('Error loading auth from storage', e);
    } finally {
      set({ isInitialized: true });
    }
  },
}));
