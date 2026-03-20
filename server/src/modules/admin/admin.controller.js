/**
 * Admin Controller
 * HTTP handlers cho admin API
 */
const AdminService = require('./admin.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class AdminController {
  // ========== QUẢN LÝ NGƯỜI DÙNG ==========
  static getStudents = catchAsync(async (req, res) => {
    const result = await AdminService.getStudents(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getStudentById = catchAsync(async (req, res) => {
    const student = await AdminService.getStudentById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', student);
  });

  static updateStudentStatus = catchAsync(async (req, res) => {
    const user = await AdminService.updateUserStatus(req.params.id, req.body.status);
    ApiResponse.success(res, 200, 'Cập nhật trạng thái thành công', user);
  });

  static getRecruiters = catchAsync(async (req, res) => {
    const result = await AdminService.getRecruiters(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getRecruiterById = catchAsync(async (req, res) => {
    const recruiter = await AdminService.getRecruiterById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', recruiter);
  });

  static updateRecruiterStatus = catchAsync(async (req, res) => {
    const user = await AdminService.updateUserStatus(req.params.id, req.body.status);
    ApiResponse.success(res, 200, 'Cập nhật trạng thái thành công', user);
  });

  // ========== QUẢN LÝ KỸ NĂNG ==========
  static getSkills = catchAsync(async (req, res) => {
    const result = await AdminService.getSkills(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getSkillById = catchAsync(async (req, res) => {
    const skill = await AdminService.getSkillById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', skill);
  });

  static createSkill = catchAsync(async (req, res) => {
    const skill = await AdminService.createSkill(req.body);
    ApiResponse.created(res, 'Tạo kỹ năng thành công', skill);
  });

  static updateSkill = catchAsync(async (req, res) => {
    const skill = await AdminService.updateSkill(req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật kỹ năng thành công', skill);
  });

  static deleteSkill = catchAsync(async (req, res) => {
    await AdminService.deleteSkill(req.params.id);
    ApiResponse.success(res, 200, 'Xóa kỹ năng thành công');
  });

  // ========== QUẢN LÝ HỌC PHẦN ==========
  static getCourses = catchAsync(async (req, res) => {
    const result = await AdminService.getCourses(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getCourseById = catchAsync(async (req, res) => {
    const course = await AdminService.getCourseById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', course);
  });

  static createCourse = catchAsync(async (req, res) => {
    const course = await AdminService.createCourse(req.body);
    ApiResponse.created(res, 'Tạo học phần thành công', course);
  });

  static updateCourse = catchAsync(async (req, res) => {
    const course = await AdminService.updateCourse(req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật học phần thành công', course);
  });

  static deleteCourse = catchAsync(async (req, res) => {
    await AdminService.deleteCourse(req.params.id);
    ApiResponse.success(res, 200, 'Xóa học phần thành công');
  });

  // ========== QUẢN LÝ CTĐT ==========
  static getCurricula = catchAsync(async (req, res) => {
    const result = await AdminService.getCurricula(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getCurriculumById = catchAsync(async (req, res) => {
    const curriculum = await AdminService.getCurriculumById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', curriculum);
  });

  static createCurriculum = catchAsync(async (req, res) => {
    const curriculum = await AdminService.createCurriculum(req.body);
    ApiResponse.created(res, 'Tạo CTĐT thành công', curriculum);
  });

  static updateCurriculum = catchAsync(async (req, res) => {
    const curriculum = await AdminService.updateCurriculum(req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật CTĐT thành công', curriculum);
  });

  static deleteCurriculum = catchAsync(async (req, res) => {
    await AdminService.deleteCurriculum(req.params.id);
    ApiResponse.success(res, 200, 'Xóa CTĐT thành công');
  });

  // ========== QUẢN LÝ HƯỚNG NGHỀ NGHIỆP ==========
  static getCareerDirections = catchAsync(async (req, res) => {
    const result = await AdminService.getCareerDirections(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getCareerDirectionById = catchAsync(async (req, res) => {
    const direction = await AdminService.getCareerDirectionById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', direction);
  });

  static createCareerDirection = catchAsync(async (req, res) => {
    const direction = await AdminService.createCareerDirection(req.body);
    ApiResponse.created(res, 'Tạo hướng nghề nghiệp thành công', direction);
  });

  static updateCareerDirection = catchAsync(async (req, res) => {
    const direction = await AdminService.updateCareerDirection(req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật thành công', direction);
  });

  static deleteCareerDirection = catchAsync(async (req, res) => {
    await AdminService.deleteCareerDirection(req.params.id);
    ApiResponse.success(res, 200, 'Xóa thành công');
  });

  // ========== QUẢN LÝ CÔNG VIỆC MẪU ==========
  static getJobTemplates = catchAsync(async (req, res) => {
    const result = await AdminService.getJobTemplates(req.query);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getJobTemplateById = catchAsync(async (req, res) => {
    const template = await AdminService.getJobTemplateById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', template);
  });

  static createJobTemplate = catchAsync(async (req, res) => {
    const template = await AdminService.createJobTemplate(req.body);
    ApiResponse.created(res, 'Tạo công việc mẫu thành công', template);
  });

  static updateJobTemplate = catchAsync(async (req, res) => {
    const template = await AdminService.updateJobTemplate(req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật thành công', template);
  });

  static deleteJobTemplate = catchAsync(async (req, res) => {
    await AdminService.deleteJobTemplate(req.params.id);
    ApiResponse.success(res, 200, 'Xóa thành công');
  });
}

module.exports = AdminController;
