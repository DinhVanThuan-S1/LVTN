/**
 * User Controller
 */
const UserService = require('./user.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class UserController {
  /**
   * GET /api/v1/users/me
   */
  static getMe = catchAsync(async (req, res) => {
    const user = await UserService.getMe(req.user._id);
    ApiResponse.success(res, 200, 'Thành công', user);
  });

  /**
   * PUT /api/v1/users/me
   */
  static updateMe = catchAsync(async (req, res) => {
    const user = await UserService.updateMe(req.user._id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật thông tin thành công', user);
  });

  /**
   * PUT /api/v1/users/me/avatar
   */
  static updateAvatar = catchAsync(async (req, res) => {
    if (!req.file) {
      return ApiResponse.success(res, 400, 'Vui lòng chọn ảnh');
    }

    // URL ảnh (đường dẫn tương đối)
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    const user = await UserService.updateAvatar(req.user._id, avatarUrl);

    ApiResponse.success(res, 200, 'Cập nhật ảnh đại diện thành công', user);
  });
}

module.exports = UserController;
