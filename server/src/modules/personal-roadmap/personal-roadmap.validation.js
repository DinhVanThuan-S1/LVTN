/**
 * Personal Roadmap Validation
 */
const { body, param } = require('express-validator');
const { PERSONAL_ROADMAP_STATUS_ARRAY, PERSONAL_ROADMAP_STATUS } = require('../../config/constants');

const enrollValidation = [
  body('roadmapId').notEmpty().withMessage('Roadmap ID là bắt buộc')
    .isMongoId().withMessage('Roadmap ID không hợp lệ'),
];

const updateScheduleValidation = [
  body('schedule').optional().isArray(),
  body('schedule.*.dayOfWeek').optional().isInt({ min: 0, max: 6 })
    .withMessage('Ngày trong tuần phải từ 0-6'),
  body('schedule.*.startTime').optional().matches(/^\d{2}:\d{2}$/)
    .withMessage('Giờ bắt đầu phải có format HH:mm'),
  body('schedule.*.endTime').optional().matches(/^\d{2}:\d{2}$/)
    .withMessage('Giờ kết thúc phải có format HH:mm'),
  body('weeklyHoursTarget').optional().isFloat({ min: 1, max: 60 })
    .withMessage('Mục tiêu giờ/tuần phải từ 1-60'),
];

const updateStatusValidation = [
  body('status').notEmpty().withMessage('Trạng thái là bắt buộc')
    .isIn([PERSONAL_ROADMAP_STATUS.ACTIVE, PERSONAL_ROADMAP_STATUS.PAUSED, PERSONAL_ROADMAP_STATUS.CANCELLED])
    .withMessage('Trạng thái không hợp lệ'),
];

const submitTestValidation = [
  body('answers').isArray({ min: 1 }).withMessage('Danh sách đáp án là bắt buộc'),
  body('answers.*.questionId').notEmpty().withMessage('Question ID là bắt buộc'),
  body('answers.*.selectedAnswerIds').isArray().withMessage('Đáp án phải là mảng'),
];

module.exports = {
  enrollValidation,
  updateScheduleValidation,
  updateStatusValidation,
  submitTestValidation,
};
