/**
 * Analytics Service
 * Thống kê tổng hợp cho Dashboard: Admin, Student, Recruiter
 */
const User = require('../user/user.model');
const Job = require('../job/job.model');
const Application = require('../application/application.model');
const PersonalRoadmap = require('../personal-roadmap/personal-roadmap.model');
const Skill = require('../skill/skill.model');
const Course = require('../course/course.model');
const AcademicProfile = require('../academic-profile/academic-profile.model');
const { ROLES, JOB_STATUS, APPLICATION_STATUS, PERSONAL_ROADMAP_STATUS } = require('../../config/constants');

class AnalyticsService {
  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================

  static async getAdminDashboard() {
    const [
      totalStudents,
      totalRecruiters,
      totalJobs,
      publishedJobs,
      pendingJobs,
      totalApplications,
      totalSkills,
      totalCourses,
    ] = await Promise.all([
      User.countDocuments({ role: ROLES.STUDENT }),
      User.countDocuments({ role: ROLES.RECRUITER }),
      Job.countDocuments(),
      Job.countDocuments({ status: JOB_STATUS.PUBLISHED }),
      Job.countDocuments({ status: JOB_STATUS.PENDING_REVIEW }),
      Application.countDocuments(),
      Skill.countDocuments(),
      Course.countDocuments(),
    ]);

    // Thống kê user đăng ký theo tháng (6 tháng gần nhất)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const userGrowth = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            role: '$role',
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    // Top kỹ năng được yêu cầu nhiều nhất trong JD
    const topSkills = await Job.aggregate([
      { $match: { status: JOB_STATUS.PUBLISHED } },
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills.skillId',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'skills',
          localField: '_id',
          foreignField: '_id',
          as: 'skill',
        },
      },
      { $unwind: '$skill' },
      { $project: { _id: 1, count: 1, name: '$skill.name', category: '$skill.category' } },
    ]);

    return {
      overview: {
        totalStudents, totalRecruiters, totalJobs, publishedJobs,
        pendingJobs, totalApplications, totalSkills, totalCourses,
      },
      userGrowth,
      topSkills,
    };
  }

  // ============================================================
  // STUDENT DASHBOARD
  // ============================================================

  static async getStudentDashboard(userId) {
    const [
      academicProfile,
      myRoadmaps,
      myApplications,
      completedRoadmaps,
    ] = await Promise.all([
      AcademicProfile.findOne({ userId })
        .select('cumulativeGPA totalCreditsEarned skillMap skillMapUpdatedAt'),
      PersonalRoadmap.countDocuments({ userId }),
      Application.countDocuments({ studentId: userId }),
      PersonalRoadmap.countDocuments({ userId, status: PERSONAL_ROADMAP_STATUS.COMPLETED }),
    ]);

    // Lộ trình đang hoạt động
    const activeRoadmaps = await PersonalRoadmap.find({
      userId,
      status: PERSONAL_ROADMAP_STATUS.ACTIVE,
    })
      .populate('roadmapId', 'title slug level thumbnail')
      .select('overallProgress completedSteps totalSteps enrolledAt')
      .sort({ updatedAt: -1 })
      .limit(5);

    // Top skills
    const topSkills = academicProfile?.skillMap
      ?.sort((a, b) => b.proficiency - a.proficiency)
      ?.slice(0, 8) || [];

    // Application stats
    const appStats = await Application.aggregate([
      { $match: { studentId: academicProfile?.userId || userId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    return {
      overview: {
        cumulativeGPA: academicProfile?.cumulativeGPA || null,
        totalCreditsEarned: academicProfile?.totalCreditsEarned || 0,
        totalRoadmaps: myRoadmaps,
        completedRoadmaps,
        totalApplications: myApplications,
      },
      activeRoadmaps,
      topSkills,
      applicationStats: appStats,
    };
  }

  // ============================================================
  // RECRUITER DASHBOARD
  // ============================================================

  static async getRecruiterDashboard(recruiterId) {
    const [
      totalJobs,
      publishedJobs,
      totalApplications,
      pendingApplications,
    ] = await Promise.all([
      Job.countDocuments({ recruiterId }),
      Job.countDocuments({ recruiterId, status: JOB_STATUS.PUBLISHED }),
      Application.countDocuments({
        jobId: { $in: await Job.find({ recruiterId }).distinct('_id') },
      }),
      Application.countDocuments({
        jobId: { $in: await Job.find({ recruiterId }).distinct('_id') },
        status: APPLICATION_STATUS.PENDING,
      }),
    ]);

    // Tin tuyển dụng gần đây
    const recentJobs = await Job.find({ recruiterId })
      .select('title status applicationCount viewCount publishedAt createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Đơn ứng tuyển gần đây
    const recruiterJobIds = await Job.find({ recruiterId }).distinct('_id');
    const recentApplications = await Application.find({
      jobId: { $in: recruiterJobIds },
    })
      .populate('studentId', 'profile.fullName profile.avatar')
      .populate('jobId', 'title')
      .select('status appliedAt matchScore')
      .sort({ appliedAt: -1 })
      .limit(10);

    return {
      overview: { totalJobs, publishedJobs, totalApplications, pendingApplications },
      recentJobs,
      recentApplications,
    };
  }
}

module.exports = AnalyticsService;
