/**
 * Personal Roadmap Service
 * Business logic cho lộ trình cá nhân: enroll, track progress, complete steps
 */
const PersonalRoadmap = require('./personal-roadmap.model');
const Roadmap = require('../roadmap/roadmap.model');
const SkillTest = require('../skill-test/skill-test.model');
const TestResult = require('../skill-test/test-result.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { SESSION_STATUS, PERSONAL_ROADMAP_STATUS } = require('../../config/constants');
const logger = require('../../config/logger');

class PersonalRoadmapService {
  /**
   * Lấy tất cả lộ trình cá nhân của user
   */
  static async getMyRoadmaps(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId };
    if (query.status) filter.status = query.status;

    const [roadmaps, total] = await Promise.all([
      PersonalRoadmap.find(filter)
        .populate('roadmapId', 'title slug level thumbnail careerDirectionId')
        .skip(skip).limit(limit).sort({ enrolledAt: -1 }),
      PersonalRoadmap.countDocuments(filter),
    ]);

    return { data: roadmaps, pagination: buildPagination(total, page, limit) };
  }

  /**
   * Lấy chi tiết lộ trình cá nhân
   */
  static async getById(userId, personalRoadmapId) {
    const pr = await PersonalRoadmap.findOne({ _id: personalRoadmapId, userId })
      .populate({
        path: 'roadmapId',
        populate: [
          { path: 'careerDirectionId', select: 'name slug' },
          { path: 'phases.steps.skillId', select: 'name category' },
          { path: 'phases.steps.testId', select: 'title totalQuestions passingScore' },
        ],
      });

    if (!pr) throw ApiError.notFound('Không tìm thấy lộ trình cá nhân');
    return pr;
  }

  /**
   * Đăng ký lộ trình (Enroll)
   */
  static async enroll(userId, roadmapId) {
    // Kiểm tra roadmap tồn tại và đã publish
    const roadmap = await Roadmap.findById(roadmapId);
    if (!roadmap) throw ApiError.notFound('Không tìm thấy lộ trình');
    if (!roadmap.isPublished) throw ApiError.badRequest('Lộ trình chưa được xuất bản');

    // Kiểm tra đã enroll chưa
    const existing = await PersonalRoadmap.findOne({ userId, roadmapId });
    if (existing) {
      throw ApiError.conflict('Bạn đã đăng ký lộ trình này rồi');
    }

    // Tạo bản sao tiến độ từ roadmap template
    const phases = roadmap.phases.map((phase) => ({
      phaseId: phase._id,
      title: phase.title,
      totalSteps: phase.steps.length,
      completedSteps: 0,
      steps: phase.steps.map((step, index) => ({
        stepId: step._id,
        title: step.title,
        // Step đầu tiên mở sẵn, còn lại khóa
        status: index === 0 && phase.order === 1
          ? SESSION_STATUS.AVAILABLE
          : SESSION_STATUS.LOCKED,
      })),
    }));

    const personalRoadmap = await PersonalRoadmap.create({
      userId,
      roadmapId,
      phases,
      totalSteps: roadmap.totalSteps,
    });

    // Tăng enrollment count
    await Roadmap.findByIdAndUpdate(roadmapId, { $inc: { enrollmentCount: 1 } });

    logger.info(`User ${userId} đăng ký lộ trình ${roadmap.title}`);
    return personalRoadmap;
  }

  /**
   * Bắt đầu một step
   */
  static async startStep(userId, personalRoadmapId, phaseId, stepId) {
    const pr = await PersonalRoadmap.findOne({ _id: personalRoadmapId, userId });
    if (!pr) throw ApiError.notFound('Không tìm thấy lộ trình cá nhân');

    const phase = pr.phases.find((p) => p.phaseId.toString() === phaseId);
    if (!phase) throw ApiError.notFound('Không tìm thấy giai đoạn');

    const step = phase.steps.find((s) => s.stepId.toString() === stepId);
    if (!step) throw ApiError.notFound('Không tìm thấy bước học');

    if (step.status === SESSION_STATUS.LOCKED) {
      throw ApiError.badRequest('Bước học này chưa được mở. Hoàn thành bước trước đó.');
    }
    if (step.status === SESSION_STATUS.COMPLETED) {
      throw ApiError.badRequest('Bước học này đã hoàn thành');
    }

    step.status = SESSION_STATUS.IN_PROGRESS;
    step.startedAt = new Date();

    // Cập nhật startedAt nếu là lần đầu
    if (!pr.startedAt) pr.startedAt = new Date();

    await pr.save();
    return pr;
  }

  /**
   * Hoàn thành một step
   */
  static async completeStep(userId, personalRoadmapId, phaseId, stepId, data = {}) {
    const pr = await PersonalRoadmap.findOne({ _id: personalRoadmapId, userId });
    if (!pr) throw ApiError.notFound('Không tìm thấy lộ trình cá nhân');

    const phase = pr.phases.find((p) => p.phaseId.toString() === phaseId);
    if (!phase) throw ApiError.notFound('Không tìm thấy giai đoạn');

    const stepIndex = phase.steps.findIndex((s) => s.stepId.toString() === stepId);
    const step = phase.steps[stepIndex];
    if (!step) throw ApiError.notFound('Không tìm thấy bước học');

    if (step.status === SESSION_STATUS.LOCKED) {
      throw ApiError.badRequest('Bước học chưa được mở');
    }

    // Đánh dấu hoàn thành
    step.status = SESSION_STATUS.COMPLETED;
    step.completedAt = new Date();
    if (data.timeSpentMinutes) step.timeSpentMinutes = data.timeSpentMinutes;
    if (data.notes) step.notes = data.notes;
    if (data.testScore !== undefined) step.testScore = data.testScore;

    // Cập nhật completedSteps của phase
    phase.completedSteps = phase.steps.filter(
      (s) => s.status === SESSION_STATUS.COMPLETED
    ).length;

    // Mở step tiếp theo (nếu có)
    if (stepIndex + 1 < phase.steps.length) {
      const nextStep = phase.steps[stepIndex + 1];
      if (nextStep.status === SESSION_STATUS.LOCKED) {
        nextStep.status = SESSION_STATUS.AVAILABLE;
      }
    } else {
      // Phase hoàn thành → mở step đầu tiên của phase tiếp theo
      const phaseIndex = pr.phases.findIndex((p) => p.phaseId.toString() === phaseId);
      if (phaseIndex + 1 < pr.phases.length) {
        const nextPhase = pr.phases[phaseIndex + 1];
        if (nextPhase.steps.length > 0 && nextPhase.steps[0].status === SESSION_STATUS.LOCKED) {
          nextPhase.steps[0].status = SESSION_STATUS.AVAILABLE;
        }
      }
    }

    // Tính lại overall progress
    pr.completedSteps = pr.phases.reduce((sum, p) => sum + p.completedSteps, 0);
    pr.overallProgress = pr.totalSteps > 0
      ? Math.round((pr.completedSteps / pr.totalSteps) * 100)
      : 0;

    // Tổng thời gian
    pr.totalTimeSpentMinutes = pr.phases.reduce(
      (sum, p) => sum + p.steps.reduce((s, st) => s + (st.timeSpentMinutes || 0), 0),
      0
    );

    // Kiểm tra hoàn thành toàn bộ
    if (pr.overallProgress >= 100) {
      pr.status = PERSONAL_ROADMAP_STATUS.COMPLETED;
      pr.completedAt = new Date();
      logger.info(`User ${userId} hoàn thành lộ trình ${personalRoadmapId}`);
    }

    await pr.save();
    return pr;
  }

  /**
   * Cập nhật lịch học
   */
  static async updateSchedule(userId, personalRoadmapId, schedule, weeklyHoursTarget) {
    const pr = await PersonalRoadmap.findOne({ _id: personalRoadmapId, userId });
    if (!pr) throw ApiError.notFound('Không tìm thấy lộ trình cá nhân');

    if (schedule) pr.schedule = schedule;
    if (weeklyHoursTarget) pr.weeklyHoursTarget = weeklyHoursTarget;

    // Tính ngày hoàn thành dự kiến
    const roadmap = await Roadmap.findById(pr.roadmapId);
    if (roadmap && weeklyHoursTarget > 0) {
      const remainingHours = roadmap.totalEstimatedHours * (1 - pr.overallProgress / 100);
      const weeksRemaining = Math.ceil(remainingHours / weeklyHoursTarget);
      const expectedDate = new Date();
      expectedDate.setDate(expectedDate.getDate() + weeksRemaining * 7);
      pr.expectedCompletionDate = expectedDate;
    }

    await pr.save();
    return pr;
  }

  /**
   * Tạm dừng / Tiếp tục lộ trình
   */
  static async updateStatus(userId, personalRoadmapId, status) {
    const pr = await PersonalRoadmap.findOne({ _id: personalRoadmapId, userId });
    if (!pr) throw ApiError.notFound('Không tìm thấy lộ trình cá nhân');

    if (pr.status === PERSONAL_ROADMAP_STATUS.COMPLETED) {
      throw ApiError.badRequest('Lộ trình đã hoàn thành, không thể thay đổi trạng thái');
    }

    pr.status = status;
    await pr.save({ validateBeforeSave: false });
    return pr;
  }

  /**
   * Nộp bài test kỹ năng
   */
  static async submitTest(userId, testId, answers) {
    const test = await SkillTest.findById(testId);
    if (!test) throw ApiError.notFound('Không tìm thấy bài test');

    // Kiểm tra số lần thi
    if (test.maxAttempts > 0) {
      const attemptCount = await TestResult.countDocuments({ userId, testId });
      if (attemptCount >= test.maxAttempts) {
        throw ApiError.badRequest(`Đã hết số lần thi cho phép (${test.maxAttempts} lần)`);
      }
    }

    // Chấm điểm
    let correctCount = 0;
    const gradedAnswers = [];

    for (const q of test.questions) {
      const userAnswer = answers.find((a) => a.questionId === q._id.toString());
      const correctAnswerIds = q.answers
        .filter((a) => a.isCorrect)
        .map((a) => a._id.toString());

      const selectedIds = userAnswer?.selectedAnswerIds || [];
      const isCorrect =
        selectedIds.length === correctAnswerIds.length &&
        selectedIds.every((id) => correctAnswerIds.includes(id));

      if (isCorrect) correctCount++;

      gradedAnswers.push({
        questionId: q._id,
        selectedAnswerIds: selectedIds,
        isCorrect,
      });
    }

    const score = Math.round((correctCount / test.totalQuestions) * 100);
    const passed = score >= test.passingScore;

    const attemptNumber = (await TestResult.countDocuments({ userId, testId })) + 1;

    const result = await TestResult.create({
      userId,
      testId,
      skillId: test.skillId,
      answers: gradedAnswers,
      correctCount,
      totalQuestions: test.totalQuestions,
      score,
      passed,
      attemptNumber,
      completedAt: new Date(),
    });

    logger.info(`User ${userId} làm test ${test.title}: ${score}% (${passed ? 'ĐẠT' : 'CHƯA ĐẠT'})`);

    return result;
  }

  /**
   * Lấy kết quả test của user
   */
  static async getTestResults(userId, query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { userId };
    if (query.skillId) filter.skillId = query.skillId;
    if (query.testId) filter.testId = query.testId;

    const [results, total] = await Promise.all([
      TestResult.find(filter)
        .populate('testId', 'title passingScore')
        .populate('skillId', 'name category')
        .select('-answers')
        .skip(skip).limit(limit).sort({ completedAt: -1 }),
      TestResult.countDocuments(filter),
    ]);

    return { data: results, pagination: buildPagination(total, page, limit) };
  }
}

module.exports = PersonalRoadmapService;
