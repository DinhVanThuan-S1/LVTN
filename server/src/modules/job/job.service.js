/**
 * Job Service
 * Business logic cho tuyển dụng: Recruiter đăng tin, Admin duyệt, Student tìm kiếm
 */
const slugify = require('slugify');
const Job = require('./job.model');
const Application = require('../application/application.model');
const CV = require('../cv/cv.model');
const Favorite = require('../favorite/favorite.model');
const CompanyProfile = require('../company/company.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const {
  JOB_STATUS, APPLICATION_STATUS, ACTIVE_APPLICATION_STATUSES,
} = require('../../config/constants');
const logger = require('../../config/logger');

class JobService {
  // ============================================================
  // PUBLIC — Tìm kiếm việc làm (Guest + Student)
  // ============================================================

  static async searchJobs(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { status: JOB_STATUS.PUBLISHED };

    if (query.search) filter.$text = { $search: query.search };
    if (query.city) filter['location.city'] = query.city;
    if (query.jobType) filter.jobType = query.jobType;
    if (query.experienceLevel) filter.experienceLevel = query.experienceLevel;
    if (query.careerDirectionId) filter.careerDirectionId = query.careerDirectionId;

    // Lương tối thiểu
    if (query.salaryMin) filter['salary.min'] = { $gte: parseInt(query.salaryMin) };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('recruiterId', 'profile.fullName profile.avatar')
        .populate('companyId', 'companyName logo')
        .populate('requiredSkills.skillId', 'name category icon')
        .select('-rejectionReason')
        .skip(skip).limit(limit).sort({ publishedAt: -1 }),
      Job.countDocuments(filter),
    ]);

    return { data: jobs, pagination: buildPagination(total, page, limit) };
  }

  static async getJobDetail(jobId, userId = null) {
    const job = await Job.findById(jobId)
      .populate('recruiterId', 'profile.fullName profile.avatar')
      .populate('companyId', 'companyName logo website industry companySize description addresses')
      .populate('requiredSkills.skillId', 'name category icon')
      .populate('careerDirectionId', 'name slug');

    if (!job) throw ApiError.notFound('Không tìm thấy tin tuyển dụng');

    // Tăng view count
    await Job.findByIdAndUpdate(jobId, { $inc: { viewCount: 1 } });

    const result = job.toObject();

    // Kiểm tra đã ứng tuyển chưa (nếu có userId)
    if (userId) {
      const applied = await Application.findOne({ jobId, studentId: userId });
      result.hasApplied = !!applied;
      result.applicationStatus = applied?.status || null;

      const fav = await Favorite.findOne({ userId, targetType: 'job', targetId: jobId });
      result.isFavorited = !!fav;
    }

    return result;
  }

  // ============================================================
  // RECRUITER — CRUD tin tuyển dụng
  // ============================================================

  static async getRecruiterJobs(recruiterId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { recruiterId };
    if (query.status) filter.status = query.status;

    const [jobs, total] = await Promise.all([
      Job.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      Job.countDocuments(filter),
    ]);

    return { data: jobs, pagination: buildPagination(total, page, limit) };
  }

  static async createJob(recruiterId, data) {
    const company = await CompanyProfile.findOne({ userId: recruiterId });

    const job = await Job.create({
      ...data,
      recruiterId,
      companyId: company?._id || null,
      slug: slugify(data.title, { lower: true, strict: true }),
    });

    logger.info(`Recruiter ${recruiterId} tạo tin: ${job.title}`);
    return job;
  }

  static async updateJob(recruiterId, jobId, data) {
    const job = await Job.findOne({ _id: jobId, recruiterId });
    if (!job) throw ApiError.notFound('Không tìm thấy tin tuyển dụng');

    // Chỉ cho sửa khi ở trạng thái draft hoặc rejected
    if (![JOB_STATUS.DRAFT, JOB_STATUS.REJECTED].includes(job.status)) {
      throw ApiError.badRequest('Chỉ có thể sửa tin ở trạng thái nháp hoặc bị từ chối');
    }

    if (data.title) data.slug = slugify(data.title, { lower: true, strict: true });
    Object.assign(job, data);
    await job.save();

    return job;
  }

  /**
   * Nộp tin để admin duyệt (BR-09)
   */
  static async submitForReview(recruiterId, jobId) {
    const job = await Job.findOne({ _id: jobId, recruiterId });
    if (!job) throw ApiError.notFound('Không tìm thấy tin tuyển dụng');

    if (![JOB_STATUS.DRAFT, JOB_STATUS.REJECTED].includes(job.status)) {
      throw ApiError.badRequest('Chỉ có thể nộp tin ở trạng thái nháp hoặc bị từ chối');
    }

    job.status = JOB_STATUS.PENDING_REVIEW;
    job.rejectionReason = null;
    await job.save({ validateBeforeSave: false });

    logger.info(`Tin ${job.title} đã nộp để duyệt`);
    return job;
  }

  static async deleteJob(recruiterId, jobId) {
    const job = await Job.findOne({ _id: jobId, recruiterId });
    if (!job) throw ApiError.notFound('Không tìm thấy tin tuyển dụng');

    // Không xóa nếu đang có ứng viên active
    const activeApps = await Application.countDocuments({
      jobId,
      status: { $in: ACTIVE_APPLICATION_STATUSES },
    });
    if (activeApps > 0) {
      throw ApiError.conflict(`Không thể xóa vì đang có ${activeApps} đơn ứng tuyển chưa xử lý`);
    }

    await Job.findByIdAndDelete(jobId);
    return { message: 'Xóa tin tuyển dụng thành công' };
  }

  // ============================================================
  // ADMIN — Duyệt/Từ chối tin tuyển dụng (BR-10)
  // ============================================================

  static async getPendingJobs(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { status: JOB_STATUS.PENDING_REVIEW };

    const [jobs, total] = await Promise.all([
      Job.find(filter)
        .populate('recruiterId', 'profile.fullName email')
        .populate('companyId', 'companyName')
        .skip(skip).limit(limit).sort({ createdAt: 1 }),
      Job.countDocuments(filter),
    ]);

    return { data: jobs, pagination: buildPagination(total, page, limit) };
  }

  static async approveJob(jobId) {
    const job = await Job.findById(jobId);
    if (!job) throw ApiError.notFound('Không tìm thấy tin');
    if (job.status !== JOB_STATUS.PENDING_REVIEW) {
      throw ApiError.badRequest('Tin không ở trạng thái chờ duyệt');
    }

    job.status = JOB_STATUS.PUBLISHED;
    job.publishedAt = new Date();
    // Mặc định hết hạn sau 30 ngày
    job.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await job.save({ validateBeforeSave: false });

    logger.info(`Admin duyệt tin: ${job.title}`);
    return job;
  }

  static async rejectJob(jobId, reason) {
    const job = await Job.findById(jobId);
    if (!job) throw ApiError.notFound('Không tìm thấy tin');
    if (job.status !== JOB_STATUS.PENDING_REVIEW) {
      throw ApiError.badRequest('Tin không ở trạng thái chờ duyệt');
    }

    job.status = JOB_STATUS.REJECTED;
    job.rejectionReason = reason || 'Không đạt yêu cầu';
    await job.save({ validateBeforeSave: false });

    logger.info(`Admin từ chối tin: ${job.title}`);
    return job;
  }

  // ============================================================
  // STUDENT — Ứng tuyển
  // ============================================================

  /**
   * Nộp đơn ứng tuyển (BR-06, BR-07, BR-08)
   */
  static async applyJob(studentId, jobId, cvId, coverLetter = '') {
    // BR-08: Kiểm tra tin đang published
    const job = await Job.findById(jobId);
    if (!job || job.status !== JOB_STATUS.PUBLISHED) {
      throw ApiError.badRequest('Tin tuyển dụng không tồn tại hoặc đã đóng');
    }

    // BR-06: Kiểm tra CV
    const cv = await CV.findOne({ _id: cvId, userId: studentId });
    if (!cv) throw ApiError.badRequest('CV không hợp lệ');

    // BR-07: Kiểm tra đã ứng tuyển chưa
    const existing = await Application.findOne({ jobId, studentId });
    if (existing) {
      throw ApiError.conflict('Bạn đã ứng tuyển công việc này rồi');
    }

    const application = await Application.create({
      jobId,
      studentId,
      cvId,
      coverLetter,
    });

    // Tăng application count
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationCount: 1 } });

    logger.info(`Student ${studentId} ứng tuyển job ${job.title}`);
    return application;
  }

  /**
   * Rút đơn
   */
  static async withdrawApplication(studentId, applicationId) {
    const app = await Application.findOne({ _id: applicationId, studentId });
    if (!app) throw ApiError.notFound('Không tìm thấy đơn ứng tuyển');

    if (![APPLICATION_STATUS.PENDING, APPLICATION_STATUS.REVIEWING].includes(app.status)) {
      throw ApiError.badRequest('Không thể rút đơn ở trạng thái hiện tại');
    }

    app.status = APPLICATION_STATUS.WITHDRAWN;
    app.withdrawnAt = new Date();
    await app.save({ validateBeforeSave: false });

    return app;
  }

  /**
   * Lấy danh sách đơn ứng tuyển của student
   */
  static async getMyApplications(studentId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { studentId };
    if (query.status) filter.status = query.status;

    const [apps, total] = await Promise.all([
      Application.find(filter)
        .populate({
          path: 'jobId',
          select: 'title slug jobType location salary status',
          populate: { path: 'companyId', select: 'companyName logo' },
        })
        .populate('cvId', 'title')
        .skip(skip).limit(limit).sort({ appliedAt: -1 }),
      Application.countDocuments(filter),
    ]);

    return { data: apps, pagination: buildPagination(total, page, limit) };
  }

  // ============================================================
  // RECRUITER — Quản lý ứng viên
  // ============================================================

  static async getJobApplications(recruiterId, jobId, query) {
    // Verify ownership
    const job = await Job.findOne({ _id: jobId, recruiterId });
    if (!job) throw ApiError.notFound('Không tìm thấy tin tuyển dụng');

    const { page, limit, skip } = parsePagination(query);
    const filter = { jobId };
    if (query.status) filter.status = query.status;

    const [apps, total] = await Promise.all([
      Application.find(filter)
        .populate('studentId', 'profile.fullName profile.avatar email')
        .populate('cvId')
        .skip(skip).limit(limit).sort({ appliedAt: -1 }),
      Application.countDocuments(filter),
    ]);

    return { data: apps, pagination: buildPagination(total, page, limit) };
  }

  /**
   * Cập nhật trạng thái đơn ứng tuyển (Recruiter)
   */
  static async updateApplicationStatus(recruiterId, applicationId, status, note = '') {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) throw ApiError.notFound('Không tìm thấy đơn ứng tuyển');

    // Verify recruiter owns this job
    if (app.jobId.recruiterId.toString() !== recruiterId.toString()) {
      throw ApiError.forbidden('Bạn không có quyền xử lý đơn này');
    }

    app.status = status;
    app.recruiterNote = note || app.recruiterNote;
    app.reviewedAt = new Date();
    await app.save({ validateBeforeSave: false });

    return app;
  }

  /**
   * Lên lịch phỏng vấn
   */
  static async scheduleInterview(recruiterId, applicationId, interviewData) {
    const app = await Application.findById(applicationId).populate('jobId');
    if (!app) throw ApiError.notFound('Không tìm thấy đơn ứng tuyển');

    if (app.jobId.recruiterId.toString() !== recruiterId.toString()) {
      throw ApiError.forbidden('Bạn không có quyền xử lý đơn này');
    }

    app.status = APPLICATION_STATUS.INTERVIEW_SCHEDULED;
    app.interviewDate = interviewData.date;
    app.interviewLocation = interviewData.location || '';
    app.interviewLink = interviewData.link || '';
    app.recruiterNote = interviewData.note || app.recruiterNote;
    app.reviewedAt = new Date();
    await app.save({ validateBeforeSave: false });

    return app;
  }

  // ============================================================
  // FAVORITES
  // ============================================================

  static async toggleFavorite(userId, targetType, targetId) {
    const existing = await Favorite.findOne({ userId, targetType, targetId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      return { isFavorited: false };
    }

    await Favorite.create({ userId, targetType, targetId });
    return { isFavorited: true };
  }

  static async getFavorites(userId, targetType, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId, targetType };

    const [favorites, total] = await Promise.all([
      Favorite.find(filter)
        .populate('targetId')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      Favorite.countDocuments(filter),
    ]);

    return { data: favorites, pagination: buildPagination(total, page, limit) };
  }
}

module.exports = JobService;
