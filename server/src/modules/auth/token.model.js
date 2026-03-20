/**
 * Refresh Token Model
 * Lưu trữ refresh token để hỗ trợ token rotation và blacklist
 */
const mongoose = require('mongoose');

const refreshTokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  userAgent: { type: String, default: '' },
  ipAddress: { type: String, default: '' },
  expiresAt: {
    type: Date,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ========== INDEXES ==========
// token đã có unique: true ở schema level, không khai báo lại
refreshTokenSchema.index({ userId: 1 });
// TTL index: tự động xóa document khi hết hạn
refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model('RefreshToken', refreshTokenSchema);

module.exports = RefreshToken;
