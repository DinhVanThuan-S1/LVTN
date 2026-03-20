/**
 * Winston Logger Configuration
 * Structured logging với level INFO/WARN/ERROR
 */
const { createLogger, format, transports } = require('winston');
const path = require('path');

const logger = createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.errors({ stack: true }),
    format.json()
  ),
  defaultMeta: { service: 'edupath-api' },
  transports: [
    // Console output (có màu cho dev)
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.printf(({ timestamp, level, message, ...meta }) => {
          const metaStr = Object.keys(meta).length > 1
            ? ` ${JSON.stringify(meta)}` : '';
          return `${timestamp} [${level}]: ${message}${metaStr}`;
        })
      ),
    }),
  ],
});

// Trong production, ghi ra file
if (process.env.NODE_ENV === 'production') {
  logger.add(new transports.File({ 
    filename: path.join('logs', 'error.log'), 
    level: 'error',
    maxsize: 5242880, // 5MB
    maxFiles: 5,
  }));
  logger.add(new transports.File({ 
    filename: path.join('logs', 'combined.log'),
    maxsize: 5242880,
    maxFiles: 5,
  }));
}

module.exports = logger;
