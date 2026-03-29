import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import * as SecureStore from 'expo-secure-store';
import { router } from 'expo-router';

const SOCKET_URL = 'https://parkeasy-backend.up.railway.app';

let socket: Socket | null = null;

export const getIO = () => {
  if (!socket) {
    const accessToken = useAuthStore.getState().accessToken;
    
    socket = io(SOCKET_URL, {
      auth: {
        token: accessToken
      },
      transports: ['websocket'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        // the disconnection was initiated by the server, you need to reconnect manually
        // This often happens if the token is invalid/expired
        handleAuthFailure();
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      if (error.message === 'xhr poll error' || error.message === 'Authentication error') {
        // Handle potential auth errors
      }
    });
  }
  return socket;
};

const handleAuthFailure = async () => {
  const { logout } = useAuthStore.getState();
  await logout();
  router.replace('/(auth)/login');
};

export const useSocket = () => {
  const isConnected = socket?.connected || false;

  const joinFacility = (facilityId: string) => {
    const io = getIO();
    io.emit('join_facility', facilityId);
  };

  const leaveFacility = (facilityId: string) => {
    if (socket) {
      socket.emit('leave_facility', facilityId);
    }
  };

  return {
    socket: getIO(),
    isConnected,
    joinFacility,
    leaveFacility,
  };
};
