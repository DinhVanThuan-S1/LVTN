/**
 * Roadmap Controller (Admin)
 */
const RoadmapService = require('./roadmap.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class RoadmapController {
  // ===== ADMIN =====
  static getAll = catchAsync(async (req, res) => {
    const result = await RoadmapService.getAll(req.query, true);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getById = catchAsync(async (req, res) => {
    const roadmap = await RoadmapService.getById(req.params.id);
    ApiResponse.success(res, 200, 'Thành công', roadmap);
  });

  static create = catchAsync(async (req, res) => {
    const roadmap = await RoadmapService.create(req.body, req.user._id);
    ApiResponse.created(res, 'Tạo lộ trình thành công', roadmap);
  });

  static update = catchAsync(async (req, res) => {
    const roadmap = await RoadmapService.update(req.params.id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật lộ trình thành công', roadmap);
  });

  static togglePublish = catchAsync(async (req, res) => {
    const roadmap = await RoadmapService.togglePublish(req.params.id);
    const msg = roadmap.isPublished ? 'Xuất bản lộ trình thành công' : 'Ẩn lộ trình thành công';
    ApiResponse.success(res, 200, msg, roadmap);
  });

  static delete = catchAsync(async (req, res) => {
    await RoadmapService.delete(req.params.id);
    ApiResponse.success(res, 200, 'Xóa lộ trình thành công');
  });

  // ===== PUBLIC =====
  static getPublicList = catchAsync(async (req, res) => {
    const result = await RoadmapService.getAll(req.query, false);
    ApiResponse.paginated(res, result.data, result.pagination);
  });

  static getPublicDetail = catchAsync(async (req, res) => {
    const roadmap = await RoadmapService.getById(req.params.id);
    if (!roadmap.isPublished) {
      return ApiResponse.success(res, 404, 'Lộ trình chưa được xuất bản');
    }
    ApiResponse.success(res, 200, 'Thành công', roadmap);
  });
}

module.exports = RoadmapController;
