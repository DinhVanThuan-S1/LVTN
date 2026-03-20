/**
 * User Validation Rules
 */
const { body } = require('express-validator');
const { GENDERS_ARRAY } = require('../../config/constants');

const updateProfileValidation = [
  body('profile.fullName')
    .optional()
    .isLength({ min: 2, max: 100 }).withMessage('Họ tên phải từ 2-100 ký tự')
    .trim(),

  body('profile.phone')
    .optional({ nullable: true })
    .matches(/^[0-9]{10,11}$/).withMessage('Số điện thoại không hợp lệ'),

  body('profile.gender')
    .optional({ nullable: true })
    .isIn(GENDERS_ARRAY).withMessage('Giới tính không hợp lệ'),

  body('profile.dateOfBirth')
    .optional({ nullable: true })
    .isISO8601().withMessage('Ngày sinh không hợp lệ'),
];

module.exports = { updateProfileValidation };
