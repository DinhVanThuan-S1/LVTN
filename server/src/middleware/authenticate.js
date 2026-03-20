/**
 * Authentication Middleware
 * Verify JWT access token và attach user vào req
 */
const jwt = require('jsonwebtoken');
const User = require('../modules/user/user.model');
const ApiError = require('../utils/ApiError');
const { USER_STATUS } = require('../config/constants');

const authenticate = async (req, res, next) => {
  try {
    // 1. Lấy token từ header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw ApiError.unauthorized('Vui lòng đăng nhập để tiếp tục');
    }

    const token = authHeader.split(' ')[1];

    // 2. Verify token
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);

    // 3. Kiểm tra user tồn tại và không bị khóa
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      throw ApiError.unauthorized('Tài khoản không tồn tại');
    }

    if (user.status === USER_STATUS.BLOCKED) {
      throw ApiError.forbidden('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // 4. Attach user vào request
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof ApiError) {
      return next(error);
    }
    // JWT errors sẽ được xử lý bởi errorHandler
    next(error);
  }
};

module.exports = authenticate;
