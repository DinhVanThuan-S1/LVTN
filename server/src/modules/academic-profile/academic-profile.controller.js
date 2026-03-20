/**
 * Academic Profile Controller
 */
const AcademicProfileService = require('./academic-profile.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class AcademicProfileController {
  /**
   * GET /api/v1/academic-profile
   */
  static getMyProfile = catchAsync(async (req, res) => {
    const profile = await AcademicProfileService.getByUserId(req.user._id);
    ApiResponse.success(res, 200, 'Thành công', profile);
  });

  /**
   * POST /api/v1/academic-profile
   */
  static createProfile = catchAsync(async (req, res) => {
    const profile = await AcademicProfileService.create(req.user._id, req.body);
    ApiResponse.created(res, 'Tạo hồ sơ học tập thành công', profile);
  });

  /**
   * PUT /api/v1/academic-profile
   */
  static updateProfile = catchAsync(async (req, res) => {
    const profile = await AcademicProfileService.update(req.user._id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật hồ sơ học tập thành công', profile);
  });

  /**
   * POST /api/v1/academic-profile/semesters
   */
  static upsertSemester = catchAsync(async (req, res) => {
    const profile = await AcademicProfileService.upsertSemesterResult(req.user._id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật kết quả học kỳ thành công', profile);
  });

  /**
   * DELETE /api/v1/academic-profile/semesters/:year/:semester
   */
  static deleteSemester = catchAsync(async (req, res) => {
    const profile = await AcademicProfileService.deleteSemesterResult(
      req.user._id, req.params.year, req.params.semester
    );
    ApiResponse.success(res, 200, 'Xóa kết quả học kỳ thành công', profile);
  });

  /**
   * GET /api/v1/academic-profile/skill-map
   */
  static getSkillMap = catchAsync(async (req, res) => {
    const result = await AcademicProfileService.getSkillMap(req.user._id);
    ApiResponse.success(res, 200, 'Thành công', result);
  });

  /**
   * POST /api/v1/academic-profile/skill-map/calculate
   */
  static calculateSkillMap = catchAsync(async (req, res) => {
    const result = await AcademicProfileService.calculateSkillMap(req.user._id);
    ApiResponse.success(res, 200, 'Tính Skill Map thành công', result);
  });
}

module.exports = AcademicProfileController;
