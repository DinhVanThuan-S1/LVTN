/**
 * Auth Controller
 * Xử lý HTTP request cho xác thực
 * Thin controller: chỉ parse request → gọi service → trả response
 */
const AuthService = require('./auth.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class AuthController {
  /**
   * POST /api/v1/auth/register
   */
  static register = catchAsync(async (req, res) => {
    const { email, password, fullName, role } = req.body;

    const result = await AuthService.register(
      { email, password, fullName, role },
      { userAgent: req.headers['user-agent'], ip: req.ip }
    );

    ApiResponse.created(res, 'Đăng ký thành công', result);
  });

  /**
   * POST /api/v1/auth/login
   */
  static login = catchAsync(async (req, res) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    ApiResponse.success(res, 200, 'Đăng nhập thành công', result);
  });

  /**
   * POST /api/v1/auth/google
   */
  static googleAuth = catchAsync(async (req, res) => {
    const { credential, role } = req.body;

    const result = await AuthService.googleAuth(credential, role, {
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    ApiResponse.success(res, 200, 'Đăng nhập Google thành công', result);
  });

  /**
   * POST /api/v1/auth/refresh-token
   */
  static refreshToken = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    const result = await AuthService.refreshAccessToken(refreshToken);

    ApiResponse.success(res, 200, 'Làm mới token thành công', result);
  });

  /**
   * POST /api/v1/auth/logout
   */
  static logout = catchAsync(async (req, res) => {
    const { refreshToken } = req.body;

    await AuthService.logout(refreshToken);

    ApiResponse.success(res, 200, 'Đăng xuất thành công');
  });

  /**
   * POST /api/v1/auth/change-password
   */
  static changePassword = catchAsync(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    const result = await AuthService.changePassword(
      req.user._id,
      currentPassword,
      newPassword
    );

    ApiResponse.success(res, 200, result.message);
  });
}

module.exports = AuthController;
