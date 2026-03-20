/**
 * Global Error Handler Middleware
 * Middleware cuối cùng trong pipeline, xử lý tất cả lỗi
 */
const logger = require('../config/logger');
const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.stack = err.stack;

  // Log lỗi
  logger.error(`${err.message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Mongoose: Validation Error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    error = ApiError.badRequest('Dữ liệu không hợp lệ', errors);
  }

  // Mongoose: Duplicate Key (unique)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error = ApiError.conflict(`${field} đã tồn tại trong hệ thống`);
  }

  // Mongoose: Cast Error (ObjectId không hợp lệ)
  if (err.name === 'CastError') {
    error = ApiError.badRequest(`ID không hợp lệ: ${err.value}`);
  }

  // JWT: Token không hợp lệ
  if (err.name === 'JsonWebTokenError') {
    error = ApiError.unauthorized('Token không hợp lệ');
  }

  // JWT: Token hết hạn
  if (err.name === 'TokenExpiredError') {
    error = ApiError.unauthorized('Token đã hết hạn');
  }

  // Response
  const statusCode = error.statusCode || 500;
  const response = {
    success: false,
    message: error.message || 'Lỗi hệ thống',
  };

  // Chỉ trả errors array nếu có
  if (error.errors && error.errors.length > 0) {
    response.errors = error.errors;
  }

  // Chỉ trả stack trace ở môi trường development
  if (process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
