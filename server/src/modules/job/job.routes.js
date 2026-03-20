/**
 * Job Routes (tổng hợp: Public + Student + Recruiter + Admin)
 */
const express = require('express');
const router = express.Router();
const JobController = require('./job.controller');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const validate = require('../../middleware/validate');
const { ROLES } = require('../../config/constants');
const {
  createJobValidation, applyJobValidation,
  updateAppStatusValidation, scheduleInterviewValidation,
  toggleFavoriteValidation,
} = require('./job.validation');

// ===== PUBLIC =====
router.get('/search', JobController.searchJobs);
router.get('/:id/detail', JobController.getJobDetail);

// ===== STUDENT =====
router.post('/:id/apply', authenticate, authorize(ROLES.STUDENT),
  validate(applyJobValidation), JobController.applyJob);

router.get('/my-applications', authenticate, authorize(ROLES.STUDENT),
  JobController.getMyApplications);

router.patch('/applications/:applicationId/withdraw', authenticate, authorize(ROLES.STUDENT),
  JobController.withdrawApplication);

// ===== FAVORITES (Student) =====
router.post('/favorites', authenticate, authorize(ROLES.STUDENT),
  validate(toggleFavoriteValidation), JobController.toggleFavorite);

router.get('/favorites', authenticate, authorize(ROLES.STUDENT),
  JobController.getFavorites);

// ===== RECRUITER =====
router.get('/recruiter/my-jobs', authenticate, authorize(ROLES.RECRUITER),
  JobController.getRecruiterJobs);

router.post('/recruiter', authenticate, authorize(ROLES.RECRUITER),
  validate(createJobValidation), JobController.createJob);

router.put('/recruiter/:id', authenticate, authorize(ROLES.RECRUITER),
  JobController.updateJob);

router.patch('/recruiter/:id/submit', authenticate, authorize(ROLES.RECRUITER),
  JobController.submitForReview);

router.delete('/recruiter/:id', authenticate, authorize(ROLES.RECRUITER),
  JobController.deleteJob);

router.get('/recruiter/:id/applications', authenticate, authorize(ROLES.RECRUITER),
  JobController.getJobApplications);

router.patch('/recruiter/applications/:applicationId/status', authenticate, authorize(ROLES.RECRUITER),
  validate(updateAppStatusValidation), JobController.updateApplicationStatus);

router.post('/recruiter/applications/:applicationId/interview', authenticate, authorize(ROLES.RECRUITER),
  validate(scheduleInterviewValidation), JobController.scheduleInterview);

// ===== ADMIN =====
router.get('/admin/pending', authenticate, authorize(ROLES.ADMIN),
  JobController.getPendingJobs);

router.patch('/admin/:id/approve', authenticate, authorize(ROLES.ADMIN),
  JobController.approveJob);

router.patch('/admin/:id/reject', authenticate, authorize(ROLES.ADMIN),
  JobController.rejectJob);

module.exports = router;
