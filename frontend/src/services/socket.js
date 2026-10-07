import { io } from 'socket.io-client';

let socket = null;

const DEFAULT_BACKEND_URL = 'https://employee-tracking-backend-xzii.onrender.com';

export const getSocket = () => {
  if (!socket) {
    const backendUrl = import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || (import.meta.env.PROD ? DEFAULT_BACKEND_URL : window.location.origin);

    socket = io(backendUrl, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[Socket.IO Frontend] Connected to real-time telemetry stream:', socket.id);
    });

    socket.on('disconnect', () => {
      console.log('[Socket.IO Frontend] Disconnected from server');
    });
  }
  return socket;
};
