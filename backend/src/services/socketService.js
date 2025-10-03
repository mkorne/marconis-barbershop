const logger = require('../config/logger');

const socketHandler = (io) => {
  logger.info('Socket.IO server initialized');

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle chat messages
    socket.on('chat_message', (data) => {
      logger.info('Chat message received:', data);
      // Broadcast to all connected clients
      io.emit('chat_message', data);
    });

    // Handle booking updates
    socket.on('booking_update', (data) => {
      logger.info('Booking update:', data);
      // Emit to specific room or all clients
      io.emit('booking_update', data);
    });

    // Handle user joining a room
    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      logger.info(`Client ${socket.id} joined room: ${roomId}`);
    });

    // Handle user leaving a room
    socket.on('leave_room', (roomId) => {
      socket.leave(roomId);
      logger.info(`Client ${socket.id} left room: ${roomId}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;
