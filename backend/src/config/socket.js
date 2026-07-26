import { Server } from 'socket.io';

let ioInstance = null;

export const initSocket = (server) => {
  ioInstance = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE']
    }
  });

  ioInstance.on('connection', (socket) => {
    console.log(`[Socket.IO] Admin/Client connected: ${socket.id}`);

    socket.on('join:room', (room) => {
      socket.join(room);
      console.log(`[Socket.IO] Socket ${socket.id} joined room: ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return ioInstance;
};

export const getIO = () => {
  if (!ioInstance) {
    throw new Error('Socket.IO not initialized!');
  }
  return ioInstance;
};

export const emitEvent = (event, data) => {
  if (ioInstance) {
    ioInstance.emit(event, data);
  }
};
