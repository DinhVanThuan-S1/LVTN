/**
 * Roadmap Service (Admin CRUD lộ trình mẫu)
 */
const slugify = require('slugify');
const Roadmap = require('./roadmap.model');
const PersonalRoadmap = require('../personal-roadmap/personal-roadmap.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPagination } = require('../../utils/pagination');

class RoadmapService {
  /**
   * Lấy danh sách roadmap (hỗ trợ filter, search, pagination)
   */
  static async getAll(query, isAdmin = false) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    // Public chỉ thấy roadmap đã publish
    if (!isAdmin) filter.isPublished = true;

    if (query.search) filter.$text = { $search: query.search };
    if (query.level) filter.level = query.level;
    if (query.careerDirectionId) filter.careerDirectionId = query.careerDirectionId;

    const [roadmaps, total] = await Promise.all([
      Roadmap.find(filter)
        .select('-phases') // Không lấy phases trong list
        .populate('careerDirectionId', 'name slug')
        .populate('targetSkills', 'name category icon')
        .skip(skip).limit(limit).sort({ createdAt: -1 }),
      Roadmap.countDocuments(filter),
    ]);

    return { data: roadmaps, pagination: buildPagination(total, page, limit) };
  }

  /**
   * Lấy chi tiết roadmap (bao gồm phases + steps)
   */
  static async getById(id) {
    const roadmap = await Roadmap.findById(id)
      .populate('careerDirectionId', 'name slug icon')
      .populate('targetSkills', 'name category icon')
      .populate('requiredSkills.skillId', 'name category')
      .populate('phases.steps.skillId', 'name category')
      .populate('phases.steps.testId', 'title totalQuestions passingScore timeLimit')
      .populate('createdBy', 'profile.fullName');

    if (!roadmap) throw ApiError.notFound('Không tìm thấy lộ trình');
    return roadmap;
  }

  /**
   * Tạo roadmap mới (Admin)
   */
  static async create(data, adminId) {
    const slug = slugify(data.title, { lower: true, strict: true });
    const roadmap = await Roadmap.create({
      ...data,
      slug,
      createdBy: adminId,
    });
    return roadmap;
  }

  /**
   * Cập nhật roadmap (Admin)
   */
  static async update(id, data) {
    if (data.title) {
      data.slug = slugify(data.title, { lower: true, strict: true });
    }

    const roadmap = await Roadmap.findById(id);
    if (!roadmap) throw ApiError.notFound('Không tìm thấy lộ trình');

    // Merge dữ liệu
    Object.assign(roadmap, data);
    await roadmap.save(); // Trigger pre-save để tính totalSteps/Hours

    return roadmap;
  }

  /**
   * Publish/Unpublish roadmap
   */
  static async togglePublish(id) {
    const roadmap = await Roadmap.findById(id);
    if (!roadmap) throw ApiError.notFound('Không tìm thấy lộ trình');

    roadmap.isPublished = !roadmap.isPublished;
    await roadmap.save({ validateBeforeSave: false });

    return roadmap;
  }

  /**
   * Xóa roadmap (BR-13: kiểm tra tham chiếu)
   */
  static async delete(id) {
    const enrollCount = await PersonalRoadmap.countDocuments({ roadmapId: id });
    if (enrollCount > 0) {
      throw ApiError.conflict(
        `Không thể xóa lộ trình vì đang có ${enrollCount} sinh viên đăng ký`
      );
    }

    const roadmap = await Roadmap.findByIdAndDelete(id);
    if (!roadmap) throw ApiError.notFound('Không tìm thấy lộ trình');
    return roadmap;
  }
}

module.exports = RoadmapService;
