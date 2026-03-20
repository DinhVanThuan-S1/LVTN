/**
 * Admin Routes
 * Tất cả routes yêu cầu role ADMIN
 */
const express = require('express');
const router = express.Router();
const AdminController = require('./admin.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../config/constants');
const {
  createSkillValidation, updateSkillValidation,
  createCourseValidation, updateCourseValidation,
  createCurriculumValidation,
  createCareerDirectionValidation,
  createJobTemplateValidation,
  updateStatusValidation,
  mongoIdParam,
} = require('./admin.validation');

// Tất cả admin routes đều yêu cầu authenticate + authorize ADMIN
router.use(authenticate, authorize(ROLES.ADMIN));

// ========== QUẢN LÝ SINH VIÊN ==========
router.get('/students', AdminController.getStudents);
router.get('/students/:id', validate(mongoIdParam), AdminController.getStudentById);
router.patch('/students/:id/status', validate([...mongoIdParam, ...updateStatusValidation]), AdminController.updateStudentStatus);

// ========== QUẢN LÝ NHÀ TUYỂN DỤNG ==========
router.get('/recruiters', AdminController.getRecruiters);
router.get('/recruiters/:id', validate(mongoIdParam), AdminController.getRecruiterById);
router.patch('/recruiters/:id/status', validate([...mongoIdParam, ...updateStatusValidation]), AdminController.updateRecruiterStatus);

// ========== QUẢN LÝ KỸ NĂNG ==========
router.get('/skills', AdminController.getSkills);
router.post('/skills', validate(createSkillValidation), AdminController.createSkill);
router.get('/skills/:id', validate(mongoIdParam), AdminController.getSkillById);
router.put('/skills/:id', validate([...mongoIdParam, ...updateSkillValidation]), AdminController.updateSkill);
router.delete('/skills/:id', validate(mongoIdParam), AdminController.deleteSkill);

// ========== QUẢN LÝ HỌC PHẦN ==========
router.get('/courses', AdminController.getCourses);
router.post('/courses', validate(createCourseValidation), AdminController.createCourse);
router.get('/courses/:id', validate(mongoIdParam), AdminController.getCourseById);
router.put('/courses/:id', validate([...mongoIdParam, ...updateCourseValidation]), AdminController.updateCourse);
router.delete('/courses/:id', validate(mongoIdParam), AdminController.deleteCourse);

// ========== QUẢN LÝ CTĐT ==========
router.get('/curricula', AdminController.getCurricula);
router.post('/curricula', validate(createCurriculumValidation), AdminController.createCurriculum);
router.get('/curricula/:id', validate(mongoIdParam), AdminController.getCurriculumById);
router.put('/curricula/:id', validate(mongoIdParam), AdminController.updateCurriculum);
router.delete('/curricula/:id', validate(mongoIdParam), AdminController.deleteCurriculum);

// ========== QUẢN LÝ HƯỚNG NGHỀ NGHIỆP ==========
router.get('/career-directions', AdminController.getCareerDirections);
router.post('/career-directions', validate(createCareerDirectionValidation), AdminController.createCareerDirection);
router.get('/career-directions/:id', validate(mongoIdParam), AdminController.getCareerDirectionById);
router.put('/career-directions/:id', validate(mongoIdParam), AdminController.updateCareerDirection);
router.delete('/career-directions/:id', validate(mongoIdParam), AdminController.deleteCareerDirection);

// ========== QUẢN LÝ CÔNG VIỆC MẪU ==========
router.get('/job-templates', AdminController.getJobTemplates);
router.post('/job-templates', validate(createJobTemplateValidation), AdminController.createJobTemplate);
router.get('/job-templates/:id', validate(mongoIdParam), AdminController.getJobTemplateById);
router.put('/job-templates/:id', validate(mongoIdParam), AdminController.updateJobTemplate);
router.delete('/job-templates/:id', validate(mongoIdParam), AdminController.deleteJobTemplate);

module.exports = router;
