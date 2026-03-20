/**
 * Academic Profile Routes
 */
const express = require('express');
const router = express.Router();
const AcademicProfileController = require('./academic-profile.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../config/constants');
const {
  createProfileValidation,
  updateProfileValidation,
  upsertSemesterValidation,
} = require('./academic-profile.validation');

// Tất cả routes yêu cầu student login
router.use(authenticate, authorize(ROLES.STUDENT));

// Hồ sơ học tập
router.get('/', AcademicProfileController.getMyProfile);
router.post('/', validate(createProfileValidation), AcademicProfileController.createProfile);
router.put('/', validate(updateProfileValidation), AcademicProfileController.updateProfile);

// Quản lý kết quả học kỳ
router.post('/semesters', validate(upsertSemesterValidation), AcademicProfileController.upsertSemester);
router.delete('/semesters/:year/:semester', AcademicProfileController.deleteSemester);

// Skill Map
router.get('/skill-map', AcademicProfileController.getSkillMap);
router.post('/skill-map/calculate', AcademicProfileController.calculateSkillMap);

module.exports = router;
