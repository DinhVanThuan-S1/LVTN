/**
 * Rate Limiter Middleware
 * Giới hạn số request để chống abuse
 */
const rateLimit = require('express-rate-limit');

// Rate limit cho API public (100 req/phút)
const publicLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 phút
  max: 100,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau 1 phút',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit cho API authenticated (300 req/phút)
const authLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  message: {
    success: false,
    message: 'Quá nhiều yêu cầu, vui lòng thử lại sau',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Rate limit cho login/register (10 req/15 phút - chống brute force)
const authRouteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 phút
  max: 10,
  message: {
    success: false,
    message: 'Quá nhiều lần thử đăng nhập, vui lòng thử lại sau 15 phút',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { publicLimiter, authLimiter, authRouteLimiter };
