/**
 * Chat Service
 * Business logic cho hội thoại và tin nhắn
 */
const Conversation = require('./conversation.model');
const Message = require('./message.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const logger = require('../../config/logger');

class ChatService {
  // Socket.IO instance (set từ socketio.js)
  static io = null;

  static setSocketIO(io) {
    ChatService.io = io;
  }

  // ============================================================
  // CONVERSATIONS
  // ============================================================

  /**
   * Lấy danh sách hội thoại của user
   */
  static async getConversations(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {
      'participants.userId': userId,
      isActive: true,
    };

    const [conversations, total] = await Promise.all([
      Conversation.find(filter)
        .populate('participants.userId', 'profile.fullName profile.avatar role')
        .populate('context.jobId', 'title')
        .skip(skip).limit(limit).sort({ updatedAt: -1 }),
      Conversation.countDocuments(filter),
    ]);

    // Thêm unreadCount cho mỗi conversation
    const enriched = await Promise.all(conversations.map(async (conv) => {
      const participant = conv.participants.find(
        (p) => p.userId._id.toString() === userId.toString()
      );
      const lastReadAt = participant?.lastReadAt || new Date(0);

      const unreadCount = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        createdAt: { $gt: lastReadAt },
        isDeleted: false,
      });

      return { ...conv.toObject(), unreadCount };
    }));

    return { data: enriched, pagination: buildPagination(total, page, limit) };
  }

  /**
   * Tạo hoặc lấy conversation giữa 2 users (direct)
   */
  static async getOrCreateDirectConversation(userId, targetUserId, context = {}) {
    if (userId.toString() === targetUserId.toString()) {
      throw ApiError.badRequest('Không thể nhắn tin cho chính mình');
    }

    // Tìm conversation trực tiếp hiện có
    let conversation = await Conversation.findOne({
      type: 'direct',
      'participants.userId': { $all: [userId, targetUserId] },
      $expr: { $eq: [{ $size: '$participants' }, 2] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        type: 'direct',
        participants: [
          { userId },
          { userId: targetUserId },
        ],
        context: {
          type: context.type || 'general',
          applicationId: context.applicationId || null,
          jobId: context.jobId || null,
        },
      });
      logger.info(`New conversation created: ${userId} ↔ ${targetUserId}`);
    }

    return conversation;
  }

  // ============================================================
  // MESSAGES
  // ============================================================

  /**
   * Lấy tin nhắn trong conversation (phân trang)
   */
  static async getMessages(userId, conversationId, query) {
    // Verify user thuộc conversation
    const conv = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId,
    });
    if (!conv) throw ApiError.notFound('Không tìm thấy hội thoại');

    const { page, limit, skip } = parsePagination(query);

    const [messages, total] = await Promise.all([
      Message.find({
        conversationId,
        isDeleted: false,
      })
        .populate('senderId', 'profile.fullName profile.avatar role')
        .skip(skip).limit(limit).sort({ createdAt: -1 }), // Mới nhất trước
      Message.countDocuments({ conversationId, isDeleted: false }),
    ]);

    return { data: messages.reverse(), pagination: buildPagination(total, page, limit) };
  }

  /**
   * Gửi tin nhắn
   */
  static async sendMessage(userId, conversationId, content, type = 'text', attachments = []) {
    // Verify user thuộc conversation
    const conv = await Conversation.findOne({
      _id: conversationId,
      'participants.userId': userId,
    });
    if (!conv) throw ApiError.notFound('Không tìm thấy hội thoại');

    const message = await Message.create({
      conversationId,
      senderId: userId,
      content,
      type,
      attachments,
      readBy: [{ userId }], // Người gửi auto đã đọc
    });

    // Cập nhật lastMessage trong conversation
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: {
        content: content.substring(0, 100),
        senderId: userId,
        sentAt: new Date(),
      },
      updatedAt: new Date(),
    });

    // Populate sender info
    const populated = await Message.findById(message._id)
      .populate('senderId', 'profile.fullName profile.avatar role');

    // Emit realtime qua Socket.IO
    if (ChatService.io) {
      // Gửi cho tất cả participants (trừ sender)
      conv.participants.forEach((p) => {
        if (p.userId.toString() !== userId.toString()) {
          ChatService.io.to(`user:${p.userId}`).emit('chat:message', {
            conversationId,
            message: populated,
          });
        }
      });
    }

    return populated;
  }

  /**
   * Đánh dấu đã đọc tất cả tin nhắn trong conversation
   */
  static async markAsRead(userId, conversationId) {
    // Cập nhật lastReadAt trong conversation
    await Conversation.updateOne(
      { _id: conversationId, 'participants.userId': userId },
      { $set: { 'participants.$.lastReadAt': new Date() } }
    );

    // Cập nhật readBy trong messages chưa đọc
    await Message.updateMany(
      {
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
      },
      { $push: { readBy: { userId, readAt: new Date() } } }
    );

    // Emit typing/read event
    if (ChatService.io) {
      ChatService.io.to(`conversation:${conversationId}`).emit('chat:read', {
        conversationId,
        userId,
        readAt: new Date(),
      });
    }

    return { message: 'Đã đánh dấu đã đọc' };
  }

  /**
   * Xóa tin nhắn (soft delete)
   */
  static async deleteMessage(userId, messageId) {
    const message = await Message.findOne({ _id: messageId, senderId: userId });
    if (!message) throw ApiError.notFound('Không tìm thấy tin nhắn');

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.content = 'Tin nhắn đã bị xóa';
    await message.save({ validateBeforeSave: false });

    // Emit delete event
    if (ChatService.io) {
      ChatService.io.to(`conversation:${message.conversationId}`).emit('chat:deleted', {
        conversationId: message.conversationId,
        messageId,
      });
    }

    return message;
  }

  /**
   * Đếm tổng unread messages cho user
   */
  static async getTotalUnread(userId) {
    const conversations = await Conversation.find({
      'participants.userId': userId,
      isActive: true,
    });

    let totalUnread = 0;
    for (const conv of conversations) {
      const participant = conv.participants.find(
        (p) => p.userId.toString() === userId.toString()
      );
      const lastReadAt = participant?.lastReadAt || new Date(0);

      const unread = await Message.countDocuments({
        conversationId: conv._id,
        senderId: { $ne: userId },
        createdAt: { $gt: lastReadAt },
        isDeleted: false,
      });
      totalUnread += unread;
    }

    return { totalUnread };
  }
}

module.exports = ChatService;
