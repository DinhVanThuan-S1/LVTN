/**
 * Notification Routes
 */
const express = require('express');
const router = express.Router();
const NotificationService = require('./notification.service');
const authenticate = require('../../middleware/authenticate');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');

router.use(authenticate);

// Danh sách notification
router.get('/', catchAsync(async (req, res) => {
  const result = await NotificationService.getByUserId(req.user._id, req.query);
  ApiResponse.paginated(res, result.data, result.pagination, { unreadCount: result.unreadCount });
}));

// Đếm chưa đọc
router.get('/unread-count', catchAsync(async (req, res) => {
  const result = await NotificationService.getUnreadCount(req.user._id);
  ApiResponse.success(res, 200, 'Thành công', result);
}));

// Đánh dấu đã đọc 1 notification
router.patch('/:id/read', catchAsync(async (req, res) => {
  const notification = await NotificationService.markAsRead(req.user._id, req.params.id);
  ApiResponse.success(res, 200, 'Đã đánh dấu đã đọc', notification);
}));

// Đánh dấu tất cả đã đọc
router.patch('/read-all', catchAsync(async (req, res) => {
  const result = await NotificationService.markAllAsRead(req.user._id);
  ApiResponse.success(res, 200, result.message);
}));

module.exports = router;
