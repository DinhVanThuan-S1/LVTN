/**
 * Auth Validation Rules
 * Validation rules cho các endpoint auth sử dụng express-validator
 */
const { body } = require('express-validator');
const { ROLES } = require('../../config/constants');

const registerValidation = [
  body('email')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc')
    .isLength({ min: 8 }).withMessage('Mật khẩu phải có ít nhất 8 ký tự')
    .matches(/[A-Z]/).withMessage('Mật khẩu phải có ít nhất 1 chữ hoa')
    .matches(/[0-9]/).withMessage('Mật khẩu phải có ít nhất 1 chữ số')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),

  body('fullName')
    .notEmpty().withMessage('Họ tên là bắt buộc')
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự')
    .trim(),

  body('role')
    .notEmpty().withMessage('Vai trò là bắt buộc')
    .isIn([ROLES.STUDENT, ROLES.RECRUITER]).withMessage('Vai trò phải là student hoặc recruiter'),
];

const loginValidation = [
  body('email')
    .notEmpty().withMessage('Email là bắt buộc')
    .isEmail().withMessage('Email không hợp lệ')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Mật khẩu là bắt buộc'),
];

const googleAuthValidation = [
  body('credential')
    .notEmpty().withMessage('Google credential là bắt buộc'),

  body('role')
    .optional()
    .isIn([ROLES.STUDENT, ROLES.RECRUITER]).withMessage('Vai trò phải là student hoặc recruiter'),
];

const refreshTokenValidation = [
  body('refreshToken')
    .notEmpty().withMessage('Refresh token là bắt buộc'),
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty().withMessage('Mật khẩu hiện tại là bắt buộc'),

  body('newPassword')
    .notEmpty().withMessage('Mật khẩu mới là bắt buộc')
    .isLength({ min: 8 }).withMessage('Mật khẩu mới phải có ít nhất 8 ký tự')
    .matches(/[A-Z]/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ hoa')
    .matches(/[0-9]/).withMessage('Mật khẩu mới phải có ít nhất 1 chữ số')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('Mật khẩu mới phải có ít nhất 1 ký tự đặc biệt'),
];

module.exports = {
  registerValidation,
  loginValidation,
  googleAuthValidation,
  refreshTokenValidation,
  changePasswordValidation,
};
