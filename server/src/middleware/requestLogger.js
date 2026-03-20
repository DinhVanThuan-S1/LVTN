/**
 * Request Logger Middleware
 * Log thông tin request cho monitoring
 */
const logger = require('../config/logger');

const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log khi response kết thúc
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userId: req.user?._id || 'anonymous',
    };

    if (res.statusCode >= 400) {
      logger.warn('Request failed', logData);
    } else {
      logger.info('Request completed', logData);
    }
  });

  next();
};

module.exports = requestLogger;
