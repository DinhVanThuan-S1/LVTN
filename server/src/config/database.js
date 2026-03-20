/**
 * Database Configuration
 * Kết nối MongoDB sử dụng Mongoose
 */
const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info(`MongoDB đã kết nối: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error) {
    logger.error(`Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Xử lý sự kiện kết nối
mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB mất kết nối');
});

mongoose.connection.on('error', (err) => {
  logger.error(`MongoDB error: ${err.message}`);
});

module.exports = connectDB;
