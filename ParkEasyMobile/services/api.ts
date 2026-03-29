import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://parkeasy-backend.up.railway.app/api/v1';

const apiClient = axios.create({
  baseURL: API_URL,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = await SecureStore.getItemAsync('refreshToken');
        if (refreshToken) {
          const res = await axios.post(`${API_URL}/auth/refresh`, { refreshToken });
          await SecureStore.setItemAsync('accessToken', res.data.accessToken);
          await SecureStore.setItemAsync('refreshToken', res.data.refreshToken);
          originalRequest.headers.Authorization = `Bearer ${res.data.accessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        await SecureStore.deleteItemAsync('accessToken');
        await SecureStore.deleteItemAsync('refreshToken');
        await SecureStore.deleteItemAsync('user');
        // Handle logout implicitly via store listener or event
      }
    }
    return Promise.reject(error);
  }
);

export const get = (url: string, config = {}) => apiClient.get(url, config);
export const post = (url: string, data?: any, config = {}) => apiClient.post(url, data, config);
export const put = (url: string, data?: any, config = {}) => apiClient.put(url, data, config);
export const patch = (url: string, data?: any, config = {}) => apiClient.patch(url, data, config);
export const del = (url: string, config = {}) => apiClient.delete(url, config);

export default apiClient;
