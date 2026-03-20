/**
 * Message Model (Tin nhắn)
 */
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    content: {
      type: String,
      required: [true, 'Nội dung tin nhắn là bắt buộc'],
      maxlength: [5000, 'Tin nhắn không quá 5000 ký tự'],
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },

    // File đính kèm
    attachments: [{
      fileName: { type: String },
      fileUrl: { type: String },
      fileSize: { type: Number },
      mimeType: { type: String },
    }],

    // Trạng thái đã đọc (cho mỗi participant)
    readBy: [{
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      readAt: { type: Date, default: Date.now },
    }],

    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1 });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
