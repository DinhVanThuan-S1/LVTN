/**
 * User Model
 * Schema cho tài khoản người dùng (tất cả role)
 */
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES_ARRAY, USER_STATUS_ARRAY, GENDERS_ARRAY, USER_STATUS } = require('../../config/constants');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    password: {
      type: String,
      minlength: [8, 'Mật khẩu phải có ít nhất 8 ký tự'],
      select: false, // Không trả password mặc định khi query
    },
    googleId: {
      type: String,
      sparse: true,
    },
    role: {
      type: String,
      enum: {
        values: ROLES_ARRAY,
        message: 'Role không hợp lệ: {VALUE}',
      },
      required: [true, 'Role là bắt buộc'],
    },
    status: {
      type: String,
      enum: USER_STATUS_ARRAY,
      default: USER_STATUS.ACTIVE,
    },

    // Thông tin cá nhân
    profile: {
      fullName: {
        type: String,
        required: [true, 'Họ tên là bắt buộc'],
        trim: true,
        minlength: [2, 'Họ tên phải có ít nhất 2 ký tự'],
        maxlength: [100, 'Họ tên không quá 100 ký tự'],
      },
      avatar: { type: String, default: null },
      phone: { type: String, default: null },
      gender: {
        type: String,
        enum: GENDERS_ARRAY,
        default: null,
      },
      dateOfBirth: { type: Date, default: null },
      address: {
        street: { type: String, default: '' },
        ward: { type: String, default: '' },
        district: { type: String, default: '' },
        city: { type: String, default: '' },
        province: { type: String, default: '' },
      },
    },

    // Metadata
    lastLoginAt: { type: Date },
    emailVerified: { type: Boolean, default: false },
  },
  {
    timestamps: true, // createdAt, updatedAt tự động
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ========== INDEXES ==========
// email và googleId đã có unique/sparse ở schema level, không cần khai báo lại
userSchema.index({ role: 1, status: 1 });
userSchema.index({ 'profile.fullName': 'text' });
userSchema.index({ createdAt: -1 });

// ========== PRE-SAVE HOOK ==========
// Hash password trước khi lưu (Mongoose 9: không dùng next())
userSchema.pre('save', async function () {
  // Chỉ hash khi password mới hoặc thay đổi
  if (!this.isModified('password') || !this.password) return;

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
});

// ========== INSTANCE METHODS ==========

/**
 * So sánh password đầu vào với password đã hash
 * @param {string} candidatePassword - Password cần kiểm tra
 * @returns {boolean}
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Loại bỏ fields nhạy cảm khi chuyển sang JSON
 */
userSchema.methods.toJSON = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
