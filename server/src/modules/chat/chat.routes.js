/**
 * Chat Routes
 * Yêu cầu đăng nhập (tất cả roles)
 */
const express = require('express');
const router = express.Router();
const ChatController = require('./chat.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const {
  createConversationValidation,
  sendMessageValidation,
} = require('./chat.validation');

router.use(authenticate);

// Danh sách hội thoại
router.get('/conversations', ChatController.getConversations);

// Tạo / lấy direct conversation
router.post('/conversations',
  validate(createConversationValidation),
  ChatController.createConversation
);

// Lấy tin nhắn
router.get('/conversations/:id/messages', ChatController.getMessages);

// Gửi tin nhắn
router.post('/conversations/:id/messages',
  validate(sendMessageValidation),
  ChatController.sendMessage
);

// Đánh dấu đã đọc
router.patch('/conversations/:id/read', ChatController.markAsRead);

// Xóa tin nhắn (soft)
router.delete('/messages/:id', ChatController.deleteMessage);

// Tổng tin chưa đọc
router.get('/unread', ChatController.getTotalUnread);

module.exports = router;
