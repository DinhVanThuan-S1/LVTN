/**
 * Personal Roadmap Routes (Student)
 */
const express = require('express');
const router = express.Router();
const PersonalRoadmapController = require('./personal-roadmap.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../config/constants');
const {
  enrollValidation,
  updateScheduleValidation,
  updateStatusValidation,
  submitTestValidation,
} = require('./personal-roadmap.validation');

// Tất cả routes yêu cầu student login
router.use(authenticate, authorize(ROLES.STUDENT));

// Danh sách lộ trình cá nhân
router.get('/', PersonalRoadmapController.getMyRoadmaps);

// Đăng ký lộ trình
router.post('/enroll', validate(enrollValidation), PersonalRoadmapController.enroll);

// Chi tiết lộ trình cá nhân
router.get('/:id', PersonalRoadmapController.getById);

// Cập nhật lịch học
router.put('/:id/schedule', validate(updateScheduleValidation), PersonalRoadmapController.updateSchedule);

// Cập nhật trạng thái (pause/resume/cancel)
router.patch('/:id/status', validate(updateStatusValidation), PersonalRoadmapController.updateStatus);

// Bắt đầu bước học
router.post('/:id/steps/:phaseId/:stepId/start', PersonalRoadmapController.startStep);

// Hoàn thành bước học
router.post('/:id/steps/:phaseId/:stepId/complete', PersonalRoadmapController.completeStep);

// Nộp bài test kỹ năng
router.post('/tests/:testId/submit', validate(submitTestValidation), PersonalRoadmapController.submitTest);

// Xem kết quả test
router.get('/test-results/me', PersonalRoadmapController.getTestResults);

module.exports = router;
