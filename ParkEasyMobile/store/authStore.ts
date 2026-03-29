import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isInitialized: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

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
      set({ user, accessToken, isLoading: false });
    } catch (e) {
      console.error('Error storing auth info', e);
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await SecureStore.deleteItemAsync('user');
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
      set({ user: null, accessToken: null, isLoading: false });
    } catch (e) {
      console.error('Error during logout', e);
      set({ isLoading: false });
    }
  },

  loadFromStorage: async () => {
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
