const logger = require('../config/logger');

const socketHandler = (io) => {
  logger.info('Socket.IO server initialized');

  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Handle admin dashboard room joining
    socket.on('join_admin_dashboard', () => {
      socket.join('admin_dashboard');
      logger.info(`Client ${socket.id} joined admin dashboard room`);
    });

    // Handle leaving admin dashboard room
    socket.on('leave_admin_dashboard', () => {
      socket.leave('admin_dashboard');
      logger.info(`Client ${socket.id} left admin dashboard room`);
    });

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

// Helper functions to emit dashboard events
const emitDashboardUpdate = (io, eventType, data) => {
  logger.info(`Emitting dashboard update: ${eventType}`, data);
  io.to('admin_dashboard').emit('dashboard_update', {
    type: eventType,
    data: data,
    timestamp: new Date().toISOString()
  });
};

const emitNewBooking = (io, booking) => {
  emitDashboardUpdate(io, 'new_booking', booking);
};

const emitBookingStatusUpdate = (io, booking) => {
  emitDashboardUpdate(io, 'booking_status_update', booking);
};

const emitNewPayment = (io, payment) => {
  emitDashboardUpdate(io, 'new_payment', payment);
};

const emitPaymentStatusUpdate = (io, payment) => {
  emitDashboardUpdate(io, 'payment_status_update', payment);
};

const emitNewMessage = (io, message) => {
  emitDashboardUpdate(io, 'new_message', message);
};

const emitMessageStatusUpdate = (io, message) => {
  emitDashboardUpdate(io, 'message_status_update', message);
};

const emitStatsUpdate = (io, stats) => {
  emitDashboardUpdate(io, 'stats_update', stats);
};

module.exports = {
  socketHandler,
  emitDashboardUpdate,
  emitNewBooking,
  emitBookingStatusUpdate,
  emitNewPayment,
  emitPaymentStatusUpdate,
  emitNewMessage,
  emitMessageStatusUpdate,
  emitStatsUpdate
};
