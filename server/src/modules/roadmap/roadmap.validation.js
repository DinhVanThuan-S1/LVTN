/**
 * Roadmap Validation
 */
const { body, param } = require('express-validator');
const { ROADMAP_LEVEL_ARRAY, RESOURCE_TYPE_ARRAY } = require('../../config/constants');

const createRoadmapValidation = [
  body('title').notEmpty().withMessage('Tên lộ trình là bắt buộc').trim(),
  body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
  body('level').notEmpty().withMessage('Cấp độ là bắt buộc')
    .isIn(ROADMAP_LEVEL_ARRAY).withMessage('Cấp độ không hợp lệ'),
  body('careerDirectionId').optional().isMongoId(),
  body('phases').optional().isArray(),
  body('phases.*.title').optional().notEmpty().withMessage('Tên giai đoạn là bắt buộc'),
  body('phases.*.order').optional().isInt({ min: 1 }),
  body('phases.*.steps').optional().isArray(),
  body('phases.*.steps.*.title').optional().notEmpty(),
  body('phases.*.steps.*.order').optional().isInt({ min: 1 }),
  body('phases.*.steps.*.estimatedHours').optional().isFloat({ min: 0.5 }),
];

const updateRoadmapValidation = [
  body('title').optional().notEmpty().trim(),
  body('description').optional().notEmpty(),
  body('level').optional().isIn(ROADMAP_LEVEL_ARRAY),
];

module.exports = { createRoadmapValidation, updateRoadmapValidation };
