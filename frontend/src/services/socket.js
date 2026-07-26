import { io } from 'socket.io-client';

let socket = null;

export const getSocket = () => {
  if (!socket) {
    socket = io(window.location.origin, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000
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
