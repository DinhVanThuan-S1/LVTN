/**
 * Chat Controller
 */
const ChatService = require('./chat.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class ChatController {
  /**
   * GET /api/v1/chat/conversations — Danh sách hội thoại
   */
  static getConversations = catchAsync(async (req, res) => {
    const result = await ChatService.getConversations(req.user._id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * POST /api/v1/chat/conversations — Tạo/lấy direct conversation
   */
  static createConversation = catchAsync(async (req, res) => {
    const conversation = await ChatService.getOrCreateDirectConversation(
      req.user._id,
      req.body.targetUserId,
      req.body.context
    );
    ApiResponse.success(res, 200, 'Thành công', conversation);
  });

  /**
   * GET /api/v1/chat/conversations/:id/messages — Lấy tin nhắn
   */
  static getMessages = catchAsync(async (req, res) => {
    const result = await ChatService.getMessages(req.user._id, req.params.id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * POST /api/v1/chat/conversations/:id/messages — Gửi tin nhắn
   */
  static sendMessage = catchAsync(async (req, res) => {
    const message = await ChatService.sendMessage(
      req.user._id,
      req.params.id,
      req.body.content,
      req.body.type || 'text',
      req.body.attachments || []
    );
    ApiResponse.created(res, 'Gửi tin nhắn thành công', message);
  });

  /**
   * PATCH /api/v1/chat/conversations/:id/read — Đánh dấu đã đọc
   */
  static markAsRead = catchAsync(async (req, res) => {
    const result = await ChatService.markAsRead(req.user._id, req.params.id);
    ApiResponse.success(res, 200, result.message);
  });

  /**
   * DELETE /api/v1/chat/messages/:id — Xóa tin nhắn (soft)
   */
  static deleteMessage = catchAsync(async (req, res) => {
    await ChatService.deleteMessage(req.user._id, req.params.id);
    ApiResponse.success(res, 200, 'Xóa tin nhắn thành công');
  });

  /**
   * GET /api/v1/chat/unread — Tổng tin chưa đọc
   */
  static getTotalUnread = catchAsync(async (req, res) => {
    const result = await ChatService.getTotalUnread(req.user._id);
    ApiResponse.success(res, 200, 'Thành công', result);
  });
}

module.exports = ChatController;
