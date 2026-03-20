/**
 * Socket.IO Configuration
 * Quản lý kết nối WebSocket cho realtime notifications
 */
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const logger = require('./logger');

/**
 * Khởi tạo Socket.IO server
 * @param {http.Server} httpServer
 * @returns {Server} io instance
 */
function initSocketIO(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || 'http://localhost:3000',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // ========== AUTHENTICATION MIDDLEWARE ==========
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;

    if (!token) {
      return next(new Error('Authentication required'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
      socket.userId = decoded.userId;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Invalid or expired token'));
    }
  });

  // ========== CONNECTION HANDLER ==========
  io.on('connection', (socket) => {
    const userId = socket.userId;

    // Join user-specific room (cho targeted notifications)
    socket.join(`user:${userId}`);
    socket.join(`role:${socket.userRole}`);

    logger.info(`Socket connected: user=${userId}, socketId=${socket.id}`);

    // ===== CHAT EVENTS =====

    // Join conversation room (khi mở chat)
    socket.on('chat:join', (conversationId) => {
      socket.join(`conversation:${conversationId}`);
      logger.info(`User ${userId} joined conversation ${conversationId}`);
    });

    // Leave conversation room
    socket.on('chat:leave', (conversationId) => {
      socket.leave(`conversation:${conversationId}`);
    });

    // Typing indicator
    socket.on('chat:typing', ({ conversationId, isTyping }) => {
      socket.to(`conversation:${conversationId}`).emit('chat:typing', {
        conversationId,
        userId,
        isTyping,
      });
    });

    // Client ping
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });

    // Disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`Socket disconnected: user=${userId}, reason=${reason}`);
    });
  });

  logger.info('✅ Socket.IO initialized');
  return io;
}

module.exports = { initSocketIO };
