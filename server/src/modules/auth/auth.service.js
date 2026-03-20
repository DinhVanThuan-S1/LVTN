/**
 * Auth Service
 * Business logic cho xác thực: register, login, google, refresh, logout, change-password
 */
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const User = require('../user/user.model');
const RefreshToken = require('./token.model');
const ApiError = require('../../utils/ApiError');
const { USER_STATUS, ROLES } = require('../../config/constants');
const logger = require('../../config/logger');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

class AuthService {
  /**
   * Tạo access token (ngắn hạn)
   */
  static generateAccessToken(userId, role) {
    return jwt.sign(
      { userId, role },
      process.env.JWT_ACCESS_SECRET,
      { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m' }
    );
  }

  /**
   * Tạo refresh token (dài hạn) và lưu vào DB
   */
  static async generateRefreshToken(userId, userAgent = '', ipAddress = '') {
    const token = jwt.sign(
      { userId },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    // Tính thời gian hết hạn
    const decoded = jwt.decode(token);
    const expiresAt = new Date(decoded.exp * 1000);

    // Lưu vào DB
    await RefreshToken.create({
      userId,
      token,
      userAgent,
      ipAddress,
      expiresAt,
    });

    return token;
  }

  /**
   * Đăng ký tài khoản mới
   * @param {{ email, password, fullName, role }} data
   * @param {{ userAgent, ip }} meta
   */
  static async register(data, meta = {}) {
    const { email, password, fullName, role } = data;

    // Kiểm tra email đã tồn tại (BR-01)
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw ApiError.conflict('Email đã được sử dụng');
    }

    // Không cho đăng ký role admin
    if (role === ROLES.ADMIN) {
      throw ApiError.forbidden('Không thể đăng ký với vai trò quản trị viên');
    }

    // Tạo user
    const user = await User.create({
      email,
      password,
      role,
      profile: { fullName },
    });

    // Tạo tokens
    const accessToken = AuthService.generateAccessToken(user._id, user.role);
    const refreshToken = await AuthService.generateRefreshToken(
      user._id, meta.userAgent, meta.ip
    );

    logger.info(`Đăng ký thành công: ${email} (${role})`);

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Đăng nhập bằng email/password
   */
  static async login(email, password, meta = {}) {
    // Tìm user (bao gồm password)
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
    }

    // Kiểm tra tài khoản bị khóa (BR-03)
    if (user.status === USER_STATUS.BLOCKED) {
      throw ApiError.forbidden('Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.');
    }

    // Kiểm tra mật khẩu (nếu đăng ký bằng Google thì không có password)
    if (!user.password) {
      throw ApiError.badRequest('Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw ApiError.unauthorized('Email hoặc mật khẩu không đúng');
    }

    // Cập nhật lastLoginAt
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Tạo tokens
    const accessToken = AuthService.generateAccessToken(user._id, user.role);
    const refreshToken = await AuthService.generateRefreshToken(
      user._id, meta.userAgent, meta.ip
    );

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Đăng nhập/đăng ký bằng Google
   * @param {string} credential - Google ID Token
   * @param {string} role - Role khi tạo mới (student/recruiter)
   */
  static async googleAuth(credential, role, meta = {}) {
    // Verify Google token
    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (error) {
      throw ApiError.unauthorized('Token Google không hợp lệ');
    }

    const { sub: googleId, email, name, picture } = payload;

    // Tìm user theo googleId hoặc email
    let user = await User.findOne({
      $or: [{ googleId }, { email }],
    });

    if (user) {
      // User đã tồn tại - kiểm tra khóa
      if (user.status === USER_STATUS.BLOCKED) {
        throw ApiError.forbidden('Tài khoản đã bị khóa');
      }

      // Liên kết googleId nếu chưa có
      if (!user.googleId) {
        user.googleId = googleId;
        if (picture && !user.profile.avatar) {
          user.profile.avatar = picture;
        }
        await user.save({ validateBeforeSave: false });
      }
    } else {
      // Tạo user mới
      if (!role || role === ROLES.ADMIN) {
        throw ApiError.badRequest('Vui lòng chọn vai trò (student hoặc recruiter)');
      }

      user = await User.create({
        email,
        googleId,
        role,
        emailVerified: true,
        profile: {
          fullName: name,
          avatar: picture || null,
        },
      });

      logger.info(`Đăng ký Google thành công: ${email} (${role})`);
    }

    // Cập nhật lastLoginAt
    user.lastLoginAt = new Date();
    await user.save({ validateBeforeSave: false });

    // Tạo tokens
    const accessToken = AuthService.generateAccessToken(user._id, user.role);
    const refreshToken = await AuthService.generateRefreshToken(
      user._id, meta.userAgent, meta.ip
    );

    return {
      user: user.toJSON(),
      accessToken,
      refreshToken,
    };
  }

  /**
   * Làm mới access token bằng refresh token
   */
  static async refreshAccessToken(refreshTokenStr) {
    // Verify refresh token
    let decoded;
    try {
      decoded = jwt.verify(refreshTokenStr, process.env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw ApiError.unauthorized('Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // Kiểm tra refresh token tồn tại trong DB
    const tokenDoc = await RefreshToken.findOne({ token: refreshTokenStr });
    if (!tokenDoc) {
      throw ApiError.unauthorized('Refresh token đã bị thu hồi');
    }

    // Kiểm tra user
    const user = await User.findById(decoded.userId);
    if (!user || user.status === USER_STATUS.BLOCKED) {
      // Xóa tất cả refresh tokens nếu user không hợp lệ
      await RefreshToken.deleteMany({ userId: decoded.userId });
      throw ApiError.unauthorized('Tài khoản không hợp lệ');
    }

    // Token rotation: xóa token cũ, tạo token mới
    await RefreshToken.deleteOne({ _id: tokenDoc._id });

    const newAccessToken = AuthService.generateAccessToken(user._id, user.role);
    const newRefreshToken = await AuthService.generateRefreshToken(
      user._id, tokenDoc.userAgent, tokenDoc.ipAddress
    );

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Đăng xuất - thu hồi refresh token (BR-15)
   */
  static async logout(refreshTokenStr) {
    await RefreshToken.deleteOne({ token: refreshTokenStr });
    logger.info('Đăng xuất thành công');
  }

  /**
   * Đổi mật khẩu (BR-15: thu hồi tất cả refresh tokens)
   */
  static async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw ApiError.notFound('Tài khoản không tồn tại');
    }

    // Kiểm tra mật khẩu cũ
    if (user.password) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        throw ApiError.badRequest('Mật khẩu hiện tại không đúng');
      }
    }

    // Cập nhật mật khẩu mới
    user.password = newPassword;
    await user.save();

    // Thu hồi tất cả refresh tokens (BR-15)
    await RefreshToken.deleteMany({ userId });

    logger.info(`Đổi mật khẩu thành công: userId=${userId}`);

    return { message: 'Đổi mật khẩu thành công. Vui lòng đăng nhập lại.' };
  }
}

module.exports = AuthService;
