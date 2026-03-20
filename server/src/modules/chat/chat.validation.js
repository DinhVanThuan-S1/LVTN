/**
 * Chat Validation
 */
const { body, param } = require('express-validator');

const createConversationValidation = [
  body('targetUserId').notEmpty().withMessage('Target user ID là bắt buộc')
    .isMongoId().withMessage('Target user ID không hợp lệ'),
  body('context').optional().isObject(),
  body('context.type').optional().isIn(['application', 'general']),
  body('context.applicationId').optional().isMongoId(),
  body('context.jobId').optional().isMongoId(),
];

const sendMessageValidation = [
  body('content').notEmpty().withMessage('Nội dung tin nhắn là bắt buộc')
    .isLength({ max: 5000 }).withMessage('Tin nhắn không quá 5000 ký tự'),
  body('type').optional().isIn(['text', 'image', 'file']),
  body('attachments').optional().isArray(),
];

module.exports = {
  createConversationValidation,
  sendMessageValidation,
};
