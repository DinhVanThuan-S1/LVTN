/**
 * User Service
 * Business logic cho quản lý thông tin cá nhân
 */
const User = require('./user.model');
const ApiError = require('../../utils/ApiError');

class UserService {
  /**
   * Lấy thông tin user hiện tại
   */
  static async getMe(userId) {
    const user = await User.findById(userId);
    if (!user) {
      throw ApiError.notFound('Tài khoản không tồn tại');
    }
    return user;
  }

  /**
   * Cập nhật thông tin cá nhân
   */
  static async updateMe(userId, updateData) {
    // Chỉ cho phép cập nhật các field trong profile
    const allowedUpdates = {};

    if (updateData.profile) {
      const { fullName, phone, gender, dateOfBirth, address } = updateData.profile;

      if (fullName) allowedUpdates['profile.fullName'] = fullName;
      if (phone !== undefined) allowedUpdates['profile.phone'] = phone;
      if (gender !== undefined) allowedUpdates['profile.gender'] = gender;
      if (dateOfBirth !== undefined) allowedUpdates['profile.dateOfBirth'] = dateOfBirth;

      // Cập nhật từng field địa chỉ
      if (address) {
        if (address.street !== undefined) allowedUpdates['profile.address.street'] = address.street;
        if (address.ward !== undefined) allowedUpdates['profile.address.ward'] = address.ward;
        if (address.district !== undefined) allowedUpdates['profile.address.district'] = address.district;
        if (address.city !== undefined) allowedUpdates['profile.address.city'] = address.city;
        if (address.province !== undefined) allowedUpdates['profile.address.province'] = address.province;
      }
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!user) {
      throw ApiError.notFound('Tài khoản không tồn tại');
    }

    return user;
  }

  /**
   * Upload avatar
   */
  static async updateAvatar(userId, avatarUrl) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { 'profile.avatar': avatarUrl } },
      { new: true }
    );

    if (!user) {
      throw ApiError.notFound('Tài khoản không tồn tại');
    }

    return user;
  }
}

module.exports = UserService;
