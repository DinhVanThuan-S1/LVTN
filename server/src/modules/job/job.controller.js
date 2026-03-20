/**
 * Job Controller
 */
const JobService = require('./job.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class JobController {
  // ===== PUBLIC =====
  static searchJobs = catchAsync(async (req, res) => {
    const result = await JobService.searchJobs(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getJobDetail = catchAsync(async (req, res) => {
    const userId = req.user?._id || null;
    const job = await JobService.getJobDetail(req.params.id, userId);
    ApiResponse.success(res, 200, 'Thành công', job);
  });

  // ===== RECRUITER =====
  static getRecruiterJobs = catchAsync(async (req, res) => {
    const result = await JobService.getRecruiterJobs(req.user._id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static createJob = catchAsync(async (req, res) => {
    const job = await JobService.createJob(req.user._id, req.body);
    ApiResponse.created(res, 'Tạo tin tuyển dụng thành công', job);
  });

  static updateJob = catchAsync(async (req, res) => {
    const job = await JobService.updateJob(req.user._id, req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật thành công', job);
  });

  static submitForReview = catchAsync(async (req, res) => {
    const job = await JobService.submitForReview(req.user._id, req.params.id);
    ApiResponse.success(res, 200, 'Đã nộp tin để duyệt', job);
  });

  static deleteJob = catchAsync(async (req, res) => {
    await JobService.deleteJob(req.user._id, req.params.id);
    ApiResponse.success(res, 200, 'Xóa tin thành công');
  });

  static getJobApplications = catchAsync(async (req, res) => {
    const result = await JobService.getJobApplications(req.user._id, req.params.id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static updateApplicationStatus = catchAsync(async (req, res) => {
    const app = await JobService.updateApplicationStatus(
      req.user._id, req.params.applicationId, req.body.status, req.body.note
    );
    ApiResponse.success(res, 200, 'Cập nhật trạng thái thành công', app);
  });

  static scheduleInterview = catchAsync(async (req, res) => {
    const app = await JobService.scheduleInterview(req.user._id, req.params.applicationId, req.body);
    ApiResponse.success(res, 200, 'Lên lịch phỏng vấn thành công', app);
  });

  // ===== ADMIN =====
  static getPendingJobs = catchAsync(async (req, res) => {
    const result = await JobService.getPendingJobs(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static approveJob = catchAsync(async (req, res) => {
    const job = await JobService.approveJob(req.params.id);
    ApiResponse.success(res, 200, 'Duyệt tin thành công', job);
  });

  static rejectJob = catchAsync(async (req, res) => {
    const job = await JobService.rejectJob(req.params.id, req.body.reason);
    ApiResponse.success(res, 200, 'Từ chối tin thành công', job);
  });

  // ===== STUDENT =====
  static applyJob = catchAsync(async (req, res) => {
    const app = await JobService.applyJob(
      req.user._id, req.params.id, req.body.cvId, req.body.coverLetter
    );
    ApiResponse.created(res, 'Ứng tuyển thành công', app);
  });

  static withdrawApplication = catchAsync(async (req, res) => {
    const app = await JobService.withdrawApplication(req.user._id, req.params.applicationId);
    ApiResponse.success(res, 200, 'Rút đơn thành công', app);
  });

  static getMyApplications = catchAsync(async (req, res) => {
    const result = await JobService.getMyApplications(req.user._id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  // ===== FAVORITES =====
  static toggleFavorite = catchAsync(async (req, res) => {
    const result = await JobService.toggleFavorite(req.user._id, req.body.targetType, req.body.targetId);
    const msg = result.isFavorited ? 'Đã thêm vào yêu thích' : 'Đã bỏ yêu thích';
    ApiResponse.success(res, 200, msg, result);
  });

  static getFavorites = catchAsync(async (req, res) => {
    const result = await JobService.getFavorites(req.user._id, req.query.type || 'job', req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });
}

module.exports = JobController;
