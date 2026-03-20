/**
 * Conversation Model (Hội thoại)
 * Hỗ trợ: Student ↔ Recruiter, Student ↔ Admin, Group
 */
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    participants: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      joinedAt: { type: Date, default: Date.now },
      lastReadAt: { type: Date, default: null },
    }],

    type: {
      type: String,
      enum: ['direct', 'group'],
      default: 'direct',
    },
    title: { type: String, default: null }, // Chỉ dùng cho group

    // Tin nhắn cuối cùng (cache để hiển thị list)
    lastMessage: {
      content: { type: String, default: '' },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      sentAt: { type: Date, default: null },
    },

    // Liên kết context (chat từ job application)
    context: {
      type: { type: String, enum: ['application', 'general'], default: 'general' },
      applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', default: null },
      jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', default: null },
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ updatedAt: -1 });
// Index cho tìm conversation giữa 2 users (direct)
conversationSchema.index({ 'participants.userId': 1, type: 1 });

const Conversation = mongoose.model('Conversation', conversationSchema);
module.exports = Conversation;
