/**
 * Notification Model
 */
const mongoose = require('mongoose');
const { NOTIFICATION_TYPE_ARRAY } = require('../../config/constants');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: NOTIFICATION_TYPE_ARRAY,
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề thông báo là bắt buộc'],
    },
    message: {
      type: String,
      required: [true, 'Nội dung thông báo là bắt buộc'],
    },

    // Liên kết (click vào notification để đi đến đâu)
    link: { type: String, default: null },
    linkType: { type: String, default: null }, // 'job', 'application', 'roadmap', etc.
    linkId: { type: mongoose.Schema.Types.ObjectId, default: null },

    isRead: { type: Boolean, default: false },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
notificationSchema.index({ userId: 1, isRead: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
// TTL: tự xóa notification sau 90 ngày
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model('Notification', notificationSchema);
module.exports = Notification;
