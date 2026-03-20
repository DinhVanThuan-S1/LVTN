/**
 * Analytics Routes
 * Dashboard cho từng role
 */
const express = require('express');
const router = express.Router();
const AnalyticsService = require('./analytics.service');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { ROLES } = require('../../config/constants');

router.use(authenticate);

// Admin Dashboard
router.get('/admin', authorize(ROLES.ADMIN), catchAsync(async (req, res) => {
  const data = await AnalyticsService.getAdminDashboard();
  ApiResponse.success(res, 200, 'Thành công', data);
}));

// Student Dashboard
router.get('/student', authorize(ROLES.STUDENT), catchAsync(async (req, res) => {
  const data = await AnalyticsService.getStudentDashboard(req.user._id);
  ApiResponse.success(res, 200, 'Thành công', data);
}));

// Recruiter Dashboard
router.get('/recruiter', authorize(ROLES.RECRUITER), catchAsync(async (req, res) => {
  const data = await AnalyticsService.getRecruiterDashboard(req.user._id);
  ApiResponse.success(res, 200, 'Thành công', data);
}));

module.exports = router;
