/**
 * EduPath Server Entry Point
 * Khởi động HTTP server + Socket.IO + MongoDB connection
 */
require('dotenv').config();

const http = require('http');
const app = require('./src/app');
const connectDB = require('./src/config/database');
const logger = require('./src/config/logger');
const { initSocketIO } = require('./src/config/socketio');
const NotificationService = require('./src/modules/notification/notification.service');
const ChatService = require('./src/modules/chat/chat.service');

const PORT = process.env.PORT || 5000;

// Tạo HTTP server (cần cho Socket.IO sau này)
const server = http.createServer(app);

// Khởi động
const startServer = async () => {
  try {
    // 1. Kết nối MongoDB
    await connectDB();

    // 2. Khởi động HTTP server
    server.listen(PORT, () => {
      logger.info(`🚀 EduPath API Server đang chạy tại http://localhost:${PORT}`);
      logger.info(`📊 Môi trường: ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🔗 Health check: http://localhost:${PORT}/api/health`);
    });

    // 3. Khởi tạo Socket.IO cho realtime notifications + chat
    const io = initSocketIO(server);
    NotificationService.setSocketIO(io);
    ChatService.setSocketIO(io);
  } catch (error) {
    logger.error(`Không thể khởi động server: ${error.message}`);
    process.exit(1);
  }
};

// Xử lý lỗi không bắt được
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => {
    process.exit(1);
  });
});

process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    logger.info('Server shut down');
    process.exit(0);
  });
});

startServer();
