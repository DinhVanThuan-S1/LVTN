/**
 * Academic Profile Validation
 */
const { body, param } = require('express-validator');
const { SEMESTER_TYPE_ARRAY } = require('../../config/constants');

const createProfileValidation = [
  body('curriculumId').notEmpty().withMessage('CTĐT là bắt buộc').isMongoId().withMessage('CTĐT ID không hợp lệ'),
  body('enrollmentYear').notEmpty().withMessage('Năm nhập học là bắt buộc')
    .isInt({ min: 2000, max: 2100 }).withMessage('Năm nhập học không hợp lệ'),
  body('studentId').optional().trim(),
  body('currentYear').optional().isInt({ min: 1, max: 6 }),
  body('currentSemester').optional().isIn(SEMESTER_TYPE_ARRAY),
];

const updateProfileValidation = [
  body('curriculumId').optional().isMongoId(),
  body('enrollmentYear').optional().isInt({ min: 2000, max: 2100 }),
  body('currentYear').optional().isInt({ min: 1, max: 6 }),
  body('currentSemester').optional().isIn(SEMESTER_TYPE_ARRAY),
];

const upsertSemesterValidation = [
  body('year').notEmpty().withMessage('Năm là bắt buộc').isInt({ min: 1, max: 6 }),
  body('semester').notEmpty().withMessage('Học kỳ là bắt buộc').isIn(SEMESTER_TYPE_ARRAY),
  body('academicYear').optional().trim(),
  body('courses').isArray({ min: 1 }).withMessage('Danh sách môn học là bắt buộc'),
  body('courses.*.courseId').isMongoId().withMessage('Course ID không hợp lệ'),
  body('courses.*.grade').optional({ nullable: true }).isFloat({ min: 0, max: 10 }).withMessage('Điểm phải từ 0-10'),
  body('courses.*.gpa4').optional({ nullable: true }).isFloat({ min: 0, max: 4 }).withMessage('GPA phải từ 0-4'),
  body('courses.*.passed').optional({ nullable: true }).isBoolean(),
];

module.exports = {
  createProfileValidation,
  updateProfileValidation,
  upsertSemesterValidation,
};
