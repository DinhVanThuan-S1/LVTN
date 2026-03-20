/**
 * Job Validation
 */
const { body, param } = require('express-validator');
const {
  JOB_TYPE_ARRAY, EXPERIENCE_LEVEL_ARRAY, APPLICATION_STATUS_ARRAY,
  FAVORITE_TYPE_ARRAY,
} = require('../../config/constants');

const createJobValidation = [
  body('title').notEmpty().withMessage('Tiêu đề là bắt buộc').trim(),
  body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
  body('jobType').notEmpty().withMessage('Loại công việc là bắt buộc')
    .isIn(JOB_TYPE_ARRAY).withMessage('Loại công việc không hợp lệ'),
  body('experienceLevel').notEmpty().withMessage('Cấp độ là bắt buộc')
    .isIn(EXPERIENCE_LEVEL_ARRAY).withMessage('Cấp độ không hợp lệ'),
  body('salary.min').optional().isInt({ min: 0 }),
  body('salary.max').optional().isInt({ min: 0 }),
  body('positions').optional().isInt({ min: 1 }),
];

const applyJobValidation = [
  body('cvId').notEmpty().withMessage('CV là bắt buộc').isMongoId(),
  body('coverLetter').optional().trim(),
];

const updateAppStatusValidation = [
  body('status').notEmpty().withMessage('Trạng thái là bắt buộc')
    .isIn(APPLICATION_STATUS_ARRAY).withMessage('Trạng thái không hợp lệ'),
  body('note').optional().trim(),
];

const scheduleInterviewValidation = [
  body('date').notEmpty().withMessage('Ngày phỏng vấn là bắt buộc').isISO8601(),
  body('location').optional().trim(),
  body('link').optional().trim(),
  body('note').optional().trim(),
];

const toggleFavoriteValidation = [
  body('targetType').notEmpty().isIn(FAVORITE_TYPE_ARRAY),
  body('targetId').notEmpty().isMongoId(),
];

module.exports = {
  createJobValidation,
  applyJobValidation,
  updateAppStatusValidation,
  scheduleInterviewValidation,
  toggleFavoriteValidation,
};
