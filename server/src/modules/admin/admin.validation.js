/**
 * Admin Validation Rules
 */
const { body, param } = require('express-validator');
const {
  SKILL_CATEGORY_ARRAY, RESOURCE_TYPE_ARRAY, EXERCISE_TYPE_ARRAY,
  COURSE_TYPE_ARRAY, PROFICIENCY_LEVEL_ARRAY, EXPERIENCE_LEVEL_ARRAY,
  USER_STATUS_ARRAY, IMPORTANCE_ARRAY, SEMESTER_TYPE_ARRAY,
} = require('../../config/constants');

// ========== KỸ NĂNG ==========
const createSkillValidation = [
  body('name').notEmpty().withMessage('Tên kỹ năng là bắt buộc').trim(),
  body('category').notEmpty().withMessage('Nhóm kỹ năng là bắt buộc')
    .isIn(SKILL_CATEGORY_ARRAY).withMessage('Nhóm kỹ năng không hợp lệ'),
  body('description').optional().trim(),
  body('resources').optional().isArray(),
  body('resources.*.title').optional().notEmpty().withMessage('Tên tài nguyên là bắt buộc'),
  body('resources.*.type').optional().isIn(RESOURCE_TYPE_ARRAY).withMessage('Loại tài nguyên không hợp lệ'),
  body('resources.*.url').optional().isURL().withMessage('URL không hợp lệ'),
  body('exercises').optional().isArray(),
  body('exercises.*.title').optional().notEmpty().withMessage('Tên bài tập là bắt buộc'),
  body('exercises.*.type').optional().isIn(EXERCISE_TYPE_ARRAY).withMessage('Loại bài tập không hợp lệ'),
];

const updateSkillValidation = [
  body('name').optional().notEmpty().withMessage('Tên kỹ năng không được rỗng').trim(),
  body('category').optional().isIn(SKILL_CATEGORY_ARRAY).withMessage('Nhóm kỹ năng không hợp lệ'),
];

// ========== HỌC PHẦN ==========
const createCourseValidation = [
  body('courseCode').notEmpty().withMessage('Mã học phần là bắt buộc').trim(),
  body('name').notEmpty().withMessage('Tên học phần là bắt buộc').trim(),
  body('credits').notEmpty().withMessage('Số tín chỉ là bắt buộc')
    .isInt({ min: 1, max: 10 }).withMessage('Số tín chỉ phải từ 1-10'),
  body('courseType').notEmpty().withMessage('Loại học phần là bắt buộc')
    .isIn(COURSE_TYPE_ARRAY).withMessage('Loại học phần không hợp lệ'),
  body('description').optional().trim(),
  body('contributedSkills').optional().isArray(),
  body('contributedSkills.*.skillId').optional().isMongoId().withMessage('Skill ID không hợp lệ'),
  body('contributedSkills.*.weight').optional().isFloat({ min: 0.1, max: 5 }),
];

const updateCourseValidation = [
  body('name').optional().notEmpty().trim(),
  body('credits').optional().isInt({ min: 1, max: 10 }),
  body('courseType').optional().isIn(COURSE_TYPE_ARRAY),
];

// ========== CTĐT ==========
const createCurriculumValidation = [
  body('name').notEmpty().withMessage('Tên CTĐT là bắt buộc').trim(),
  body('code').notEmpty().withMessage('Mã CTĐT là bắt buộc').trim(),
  body('totalCredits').notEmpty().withMessage('Tổng tín chỉ là bắt buộc')
    .isInt({ min: 1 }).withMessage('Tổng tín chỉ phải lớn hơn 0'),
  body('startYear').notEmpty().withMessage('Năm bắt đầu là bắt buộc')
    .isInt({ min: 2000, max: 2100 }),
  body('semesters').optional().isArray(),
  body('semesters.*.year').optional().isInt({ min: 1, max: 6 }),
  body('semesters.*.semester').optional().isIn(SEMESTER_TYPE_ARRAY),
];

// ========== HƯỚNG NGHỀ NGHIỆP ==========
const createCareerDirectionValidation = [
  body('name').notEmpty().withMessage('Tên hướng nghề nghiệp là bắt buộc').trim(),
  body('description').optional().trim(),
  body('requiredSkills').optional().isArray(),
  body('requiredSkills.*.skillId').optional().isMongoId().withMessage('Skill ID không hợp lệ'),
  body('requiredSkills.*.importance').optional().isIn(IMPORTANCE_ARRAY),
  body('averageSalary.min').optional().isInt({ min: 0 }),
  body('averageSalary.max').optional().isInt({ min: 0 }),
];

// ========== CÔNG VIỆC MẪU ==========
const createJobTemplateValidation = [
  body('title').notEmpty().withMessage('Tên công việc mẫu là bắt buộc').trim(),
  body('description').notEmpty().withMessage('Mô tả là bắt buộc'),
  body('careerDirectionId').optional().isMongoId().withMessage('Career Direction ID không hợp lệ'),
  body('requiredSkills').optional().isArray(),
  body('requiredSkills.*.skillId').optional().isMongoId(),
  body('requiredSkills.*.level').optional().isIn(PROFICIENCY_LEVEL_ARRAY),
  body('experienceLevel').optional().isIn(EXPERIENCE_LEVEL_ARRAY),
  body('salaryRange.min').optional().isInt({ min: 0 }),
  body('salaryRange.max').optional().isInt({ min: 0 }),
];

// ========== CHUNG ==========
const updateStatusValidation = [
  body('status').notEmpty().withMessage('Trạng thái là bắt buộc')
    .isIn([USER_STATUS_ARRAY[0], USER_STATUS_ARRAY[1]]).withMessage('Trạng thái không hợp lệ (active/blocked)'),
];

const mongoIdParam = [
  param('id').isMongoId().withMessage('ID không hợp lệ'),
];

module.exports = {
  createSkillValidation, updateSkillValidation,
  createCourseValidation, updateCourseValidation,
  createCurriculumValidation,
  createCareerDirectionValidation,
  createJobTemplateValidation,
  updateStatusValidation,
  mongoIdParam,
};
