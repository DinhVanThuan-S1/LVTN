/**
 * Public Routes
 * API công khai, không cần đăng nhập (dành cho Guest, dropdown, autocomplete)
 */
const express = require('express');
const router = express.Router();
const Skill = require('../skill/skill.model');
const Course = require('../course/course.model');
const Curriculum = require('../curriculum/curriculum.model');
const CareerDirection = require('../career-direction/career-direction.model');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { SKILL_CATEGORY_ARRAY } = require('../../config/constants');

// Lấy danh sách kỹ năng (public)
router.get('/skills', catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.category) filter.category = req.query.category;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [skills, total] = await Promise.all([
    Skill.find(filter).select('name slug category icon').skip(skip).limit(limit).sort({ name: 1 }),
    Skill.countDocuments(filter),
  ]);
  ApiResponse.paginated(res, skills, buildPagination(total, page, limit));
}));

// Lấy chi tiết kỹ năng (public - bao gồm resources, exercises)
router.get('/skills/:id', catchAsync(async (req, res) => {
  const skill = await Skill.findById(req.params.id);
  if (!skill) return ApiResponse.success(res, 404, 'Không tìm thấy kỹ năng');
  ApiResponse.success(res, 200, 'Thành công', skill);
}));

// Danh sách nhóm kỹ năng (enum)
router.get('/skill-categories', (req, res) => {
  ApiResponse.success(res, 200, 'Thành công', SKILL_CATEGORY_ARRAY);
});

// Danh sách học phần (public)
router.get('/courses', catchAsync(async (req, res) => {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = {};
  if (req.query.courseType) filter.courseType = req.query.courseType;
  if (req.query.search) filter.$text = { $search: req.query.search };

  const [courses, total] = await Promise.all([
    Course.find(filter).select('courseCode name credits courseType').skip(skip).limit(limit).sort({ courseCode: 1 }),
    Course.countDocuments(filter),
  ]);
  ApiResponse.paginated(res, courses, buildPagination(total, page, limit));
}));

// Danh sách CTĐT (public)
router.get('/curricula', catchAsync(async (req, res) => {
  const curricula = await Curriculum.find({ isActive: true })
    .select('name code totalCredits startYear')
    .sort({ startYear: -1 });
  ApiResponse.success(res, 200, 'Thành công', curricula);
}));

// Danh sách hướng nghề nghiệp (public)
router.get('/career-directions', catchAsync(async (req, res) => {
  const directions = await CareerDirection.find()
    .populate('requiredSkills.skillId', 'name category icon')
    .sort({ name: 1 });
  ApiResponse.success(res, 200, 'Thành công', directions);
}));

// Chi tiết hướng nghề nghiệp (public)
router.get('/career-directions/:id', catchAsync(async (req, res) => {
  const direction = await CareerDirection.findById(req.params.id)
    .populate('requiredSkills.skillId', 'name category icon');
  if (!direction) return ApiResponse.success(res, 404, 'Không tìm thấy hướng nghề nghiệp');
  ApiResponse.success(res, 200, 'Thành công', direction);
}));

module.exports = router;
