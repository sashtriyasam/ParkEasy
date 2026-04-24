import axios from 'axios';
import type { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30s default; booking flow (payment + QR + DB tx) needs headroom on cold starts
});

const isAuthPage = () => {
    const path = window.location.pathname;
    return path === '/login' || path === '/welcome' || path === '/signup' || path === '/';
};

const normalizeApiError = (error: any) => {
    return {
        message: error?.response?.data?.message || error?.message || 'An error occurred',
        statusCode: error?.response?.status || 500,
    };
};

// Request interceptor - Add auth token
apiClient.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor - Handle errors
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Handle 401 Unauthorized and Token Expiry
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                try {
                    const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken, refreshToken: newRefreshToken } = response.data.data;

                    localStorage.setItem('accessToken', accessToken);
                    localStorage.setItem('refreshToken', newRefreshToken);

                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return axios(originalRequest);
                } catch (refreshError) {
                    // Refresh token failed, logout
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('user');
                    
                    if (!isAuthPage()) {
                        window.location.href = '/login';
                    }
                    return Promise.reject(normalizeApiError(refreshError));
                }
            } else {
                // No refresh token, logout
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
                
                if (!isAuthPage()) {
                    window.location.href = '/login';
                }
                return Promise.reject(normalizeApiError(error));
            }
        }

        return Promise.reject(normalizeApiError(error));
    }
);

export default apiClient;
