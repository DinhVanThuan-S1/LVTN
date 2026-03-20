/**
 * Notification Service
 * Tạo, gửi (Socket.IO), đánh dấu đã đọc
 */
const Notification = require('./notification.model');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { NOTIFICATION_TYPE } = require('../../config/constants');
const logger = require('../../config/logger');

class NotificationService {
  // Tham chiếu Socket.IO instance (set từ server.js)
  static io = null;

  static setSocketIO(io) {
    NotificationService.io = io;
  }

  /**
   * Tạo và gửi notification
   */
  static async create({ userId, type, title, message, linkType = null, linkId = null }) {
    const notification = await Notification.create({
      userId, type, title, message, linkType, linkId,
    });

    // Gửi realtime qua Socket.IO nếu có
    if (NotificationService.io) {
      NotificationService.io
        .to(`user:${userId}`)
        .emit('notification:new', notification);
    }

    logger.info(`Notification sent to ${userId}: ${title}`);
    return notification;
  }

  /**
   * Lấy danh sách notification của user
   */
  static async getByUserId(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId };
    if (query.isRead !== undefined) filter.isRead = query.isRead === 'true';

    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Notification.countDocuments(filter),
      Notification.countDocuments({ userId, isRead: false }),
    ]);

    return {
      data: notifications,
      pagination: buildPagination(total, page, limit),
      unreadCount,
    };
  }

  /**
   * Đánh dấu đã đọc 1 notification
   */
  static async markAsRead(userId, notificationId) {
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, userId },
      { isRead: true, readAt: new Date() },
      { new: true }
    );
    return notification;
  }

  /**
   * Đánh dấu tất cả đã đọc
   */
  static async markAllAsRead(userId) {
    await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );
    return { message: 'Đã đánh dấu tất cả đã đọc' };
  }

  /**
   * Đếm chưa đọc
   */
  static async getUnreadCount(userId) {
    const count = await Notification.countDocuments({ userId, isRead: false });
    return { unreadCount: count };
  }

  // ============================================================
  // HELPER: Tạo notification theo business events
  // ============================================================

  /**
   * BR-Event: Có đơn ứng tuyển mới (gửi cho Recruiter)
   */
  static async notifyNewApplication(recruiterId, jobTitle, studentName) {
    return NotificationService.create({
      userId: recruiterId,
      type: NOTIFICATION_TYPE.APPLICATION_RECEIVED,
      title: 'Đơn ứng tuyển mới',
      message: `${studentName} đã ứng tuyển vào tin "${jobTitle}"`,
      linkType: 'application',
    });
  }

  /**
   * BR-Event: Trạng thái đơn thay đổi (gửi cho Student)
   */
  static async notifyApplicationStatusChanged(studentId, jobTitle, newStatus) {
    const statusLabels = {
      reviewing: 'đang xem xét',
      interview_scheduled: 'đã lên lịch phỏng vấn',
      accepted: 'được chấp nhận',
      rejected: 'bị từ chối',
    };
    return NotificationService.create({
      userId: studentId,
      type: NOTIFICATION_TYPE.APPLICATION_STATUS_CHANGED,
      title: 'Cập nhật đơn ứng tuyển',
      message: `Đơn ứng tuyển "${jobTitle}" ${statusLabels[newStatus] || newStatus}`,
      linkType: 'application',
    });
  }

  /**
   * BR-Event: Tin tuyển dụng được duyệt/từ chối (gửi cho Recruiter)
   */
  static async notifyJobReview(recruiterId, jobTitle, approved) {
    return NotificationService.create({
      userId: recruiterId,
      type: approved ? NOTIFICATION_TYPE.JOB_APPROVED : NOTIFICATION_TYPE.JOB_REJECTED,
      title: approved ? 'Tin tuyển dụng đã được duyệt' : 'Tin tuyển dụng bị từ chối',
      message: `Tin "${jobTitle}" đã ${approved ? 'được duyệt và xuất bản' : 'bị từ chối'}`,
      linkType: 'job',
    });
  }

  /**
   * BR-Event: Hoàn thành lộ trình
   */
  static async notifyRoadmapCompleted(studentId, roadmapTitle) {
    return NotificationService.create({
      userId: studentId,
      type: NOTIFICATION_TYPE.ROADMAP_COMPLETED,
      title: '🎉 Hoàn thành lộ trình!',
      message: `Chúc mừng bạn đã hoàn thành lộ trình "${roadmapTitle}"`,
      linkType: 'roadmap',
    });
  }

  /**
   * BR-Event: Kết quả bài test
   */
  static async notifyTestResult(studentId, testTitle, score, passed) {
    return NotificationService.create({
      userId: studentId,
      type: NOTIFICATION_TYPE.TEST_RESULT,
      title: passed ? '✅ Đạt bài test!' : '❌ Chưa đạt bài test',
      message: `Bài test "${testTitle}": ${score}% (${passed ? 'ĐẠT' : 'CHƯA ĐẠT'})`,
      linkType: 'test',
    });
  }
}

module.exports = NotificationService;
