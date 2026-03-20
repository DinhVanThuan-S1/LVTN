/**
 * Auth Routes
 * Định nghĩa routes và middleware chain cho xác thực
 */
const express = require('express');
const router = express.Router();
const AuthController = require('./auth.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { authRouteLimiter } = require('../../middleware/rateLimiter');
const {
  registerValidation,
  loginValidation,
  googleAuthValidation,
  refreshTokenValidation,
  changePasswordValidation,
} = require('./auth.validation');

// ========== PUBLIC ROUTES ==========

// Đăng ký tài khoản
router.post(
  '/register',
  authRouteLimiter,
  validate(registerValidation),
  AuthController.register
);

// Đăng nhập
router.post(
  '/login',
  authRouteLimiter,
  validate(loginValidation),
  AuthController.login
);

// Đăng nhập/đăng ký bằng Google
router.post(
  '/google',
  validate(googleAuthValidation),
  AuthController.googleAuth
);

// Làm mới access token
router.post(
  '/refresh-token',
  validate(refreshTokenValidation),
  AuthController.refreshToken
);

// ========== PROTECTED ROUTES ==========

// Đăng xuất
router.post(
  '/logout',
  authenticate,
  AuthController.logout
);

// Đổi mật khẩu
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordValidation),
  AuthController.changePassword
);

module.exports = router;
