/**
 * Authorization Middleware
 * Kiểm tra role-based access control
 * @param  {...string} roles - Danh sách roles được phép
 */
const ApiError = require('../utils/ApiError');

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized('Vui lòng đăng nhập'));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        ApiError.forbidden(
          `Vai trò '${req.user.role}' không có quyền thực hiện thao tác này`
        )
      );
    }

    next();
  };
};

module.exports = authorize;
