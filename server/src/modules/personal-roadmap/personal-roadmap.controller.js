/**
 * Personal Roadmap Controller (Student)
 */
const PersonalRoadmapService = require('./personal-roadmap.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class PersonalRoadmapController {
  /**
   * GET /api/v1/my-roadmaps — Danh sách lộ trình cá nhân
   */
  static getMyRoadmaps = catchAsync(async (req, res) => {
    const result = await PersonalRoadmapService.getMyRoadmaps(req.user._id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  /**
   * GET /api/v1/my-roadmaps/:id — Chi tiết lộ trình cá nhân
   */
  static getById = catchAsync(async (req, res) => {
    const pr = await PersonalRoadmapService.getById(req.user._id, req.params.id);
    ApiResponse.success(res, 200, 'Thành công', pr);
  });

  /**
   * POST /api/v1/my-roadmaps/enroll — Đăng ký lộ trình
   */
  static enroll = catchAsync(async (req, res) => {
    const pr = await PersonalRoadmapService.enroll(req.user._id, req.body.roadmapId);
    ApiResponse.created(res, 'Đăng ký lộ trình thành công', pr);
  });

  /**
   * POST /api/v1/my-roadmaps/:id/steps/:phaseId/:stepId/start
   */
  static startStep = catchAsync(async (req, res) => {
    const { id, phaseId, stepId } = req.params;
    const pr = await PersonalRoadmapService.startStep(req.user._id, id, phaseId, stepId);
    ApiResponse.success(res, 200, 'Bắt đầu bước học thành công', pr);
  });

  /**
   * POST /api/v1/my-roadmaps/:id/steps/:phaseId/:stepId/complete
   */
  static completeStep = catchAsync(async (req, res) => {
    const { id, phaseId, stepId } = req.params;
    const pr = await PersonalRoadmapService.completeStep(
      req.user._id, id, phaseId, stepId, req.body
    );
    ApiResponse.success(res, 200, 'Hoàn thành bước học', pr);
  });

  /**
   * PUT /api/v1/my-roadmaps/:id/schedule
   */
  static updateSchedule = catchAsync(async (req, res) => {
    const pr = await PersonalRoadmapService.updateSchedule(
      req.user._id, req.params.id, req.body.schedule, req.body.weeklyHoursTarget
    );
    ApiResponse.success(res, 200, 'Cập nhật lịch học thành công', pr);
  });

  /**
   * PATCH /api/v1/my-roadmaps/:id/status
   */
  static updateStatus = catchAsync(async (req, res) => {
    const pr = await PersonalRoadmapService.updateStatus(
      req.user._id, req.params.id, req.body.status
    );
    ApiResponse.success(res, 200, 'Cập nhật trạng thái thành công', pr);
  });

  /**
   * POST /api/v1/skill-tests/:testId/submit
   */
  static submitTest = catchAsync(async (req, res) => {
    const result = await PersonalRoadmapService.submitTest(
      req.user._id, req.params.testId, req.body.answers
    );
    ApiResponse.created(res, 'Nộp bài thành công', result);
  });

  /**
   * GET /api/v1/test-results
   */
  static getTestResults = catchAsync(async (req, res) => {
    const result = await PersonalRoadmapService.getTestResults(req.user._id, req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });
}

module.exports = PersonalRoadmapController;
