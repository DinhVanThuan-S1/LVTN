/**
 * Admin Service
 * Business logic cho quản lý master data (Skill, Course, Curriculum, CareerDirection, JobTemplate)
 */
const slugify = require('slugify');
const Skill = require('../skill/skill.model');
const Course = require('../course/course.model');
const Curriculum = require('../curriculum/curriculum.model');
const CareerDirection = require('../career-direction/career-direction.model');
const JobTemplate = require('../job-template/job-template.model');
const User = require('../user/user.model');
const ApiError = require('../../utils/ApiError');
const { parsePagination, buildPagination } = require('../../utils/pagination');
const { ROLES, USER_STATUS } = require('../../config/constants');

class AdminService {
  // ========================================
  // QUẢN LÝ NGƯỜI DÙNG
  // ========================================

  /**
   * Lấy danh sách sinh viên
   */
  static async getStudents(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { role: ROLES.STUDENT };

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.status) {
      filter.status = query.status;
    }

    const [students, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return { data: students, pagination: buildPagination(total, page, limit) };
  }

  /**
   * Lấy chi tiết sinh viên
   */
  static async getStudentById(id) {
    const student = await User.findOne({ _id: id, role: ROLES.STUDENT });
    if (!student) throw ApiError.notFound('Không tìm thấy sinh viên');
    return student;
  }

  /**
   * Cập nhật trạng thái người dùng (khóa/mở khóa)
   */
  static async updateUserStatus(id, status) {
    const user = await User.findById(id);
    if (!user) throw ApiError.notFound('Không tìm thấy người dùng');

    // BR-14: Admin không thể bị thay đổi trạng thái
    if (user.role === ROLES.ADMIN) {
      throw ApiError.forbidden('Không thể thay đổi trạng thái tài khoản admin');
    }

    user.status = status;
    await user.save({ validateBeforeSave: false });
    return user;
  }

  /**
   * Lấy danh sách nhà tuyển dụng
   */
  static async getRecruiters(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = { role: ROLES.RECRUITER };

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.status) {
      filter.status = query.status;
    }

    const [recruiters, total] = await Promise.all([
      User.find(filter).skip(skip).limit(limit).sort({ createdAt: -1 }),
      User.countDocuments(filter),
    ]);

    return { data: recruiters, pagination: buildPagination(total, page, limit) };
  }

  /**
   * Lấy chi tiết nhà tuyển dụng
   */
  static async getRecruiterById(id) {
    const recruiter = await User.findOne({ _id: id, role: ROLES.RECRUITER });
    if (!recruiter) throw ApiError.notFound('Không tìm thấy nhà tuyển dụng');
    return recruiter;
  }

  // ========================================
  // QUẢN LÝ KỸ NĂNG (SKILL)
  // ========================================

  static async getSkills(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.category) {
      filter.category = query.category;
    }

    const [skills, total] = await Promise.all([
      Skill.find(filter).skip(skip).limit(limit).sort({ category: 1, name: 1 }),
      Skill.countDocuments(filter),
    ]);

    return { data: skills, pagination: buildPagination(total, page, limit) };
  }

  static async getSkillById(id) {
    const skill = await Skill.findById(id).populate('relatedCourses.courseId', 'courseCode name');
    if (!skill) throw ApiError.notFound('Không tìm thấy kỹ năng');
    return skill;
  }

  static async createSkill(data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const skill = await Skill.create({ ...data, slug });
    return skill;
  }

  static async updateSkill(id, data) {
    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const skill = await Skill.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!skill) throw ApiError.notFound('Không tìm thấy kỹ năng');
    return skill;
  }

  static async deleteSkill(id) {
    // BR-13: Kiểm tra tham chiếu trước khi xóa
    const [inRoadmap, inJobTemplate, inCareerDir, inCourse] = await Promise.all([
      mongoose.model('Roadmap')?.countDocuments({ 'phases.steps.skillId': id }).catch(() => 0),
      JobTemplate.countDocuments({ 'requiredSkills.skillId': id }),
      CareerDirection.countDocuments({ 'requiredSkills.skillId': id }),
      Course.countDocuments({ 'contributedSkills.skillId': id }),
    ]);

    const references = [];
    if (inRoadmap) references.push(`${inRoadmap} lộ trình`);
    if (inJobTemplate) references.push(`${inJobTemplate} công việc mẫu`);
    if (inCareerDir) references.push(`${inCareerDir} hướng nghề nghiệp`);
    if (inCourse) references.push(`${inCourse} học phần`);

    if (references.length > 0) {
      throw ApiError.conflict(
        `Không thể xóa kỹ năng vì đang được tham chiếu bởi: ${references.join(', ')}`
      );
    }

    const skill = await Skill.findByIdAndDelete(id);
    if (!skill) throw ApiError.notFound('Không tìm thấy kỹ năng');
    return skill;
  }

  // ========================================
  // QUẢN LÝ HỌC PHẦN (COURSE)
  // ========================================

  static async getCourses(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.courseType) {
      filter.courseType = query.courseType;
    }

    const [courses, total] = await Promise.all([
      Course.find(filter).skip(skip).limit(limit).sort({ courseCode: 1 }),
      Course.countDocuments(filter),
    ]);

    return { data: courses, pagination: buildPagination(total, page, limit) };
  }

  static async getCourseById(id) {
    const course = await Course.findById(id)
      .populate('contributedSkills.skillId', 'name category')
      .populate('prerequisiteCourses', 'courseCode name');
    if (!course) throw ApiError.notFound('Không tìm thấy học phần');
    return course;
  }

  static async createCourse(data) {
    const course = await Course.create(data);
    return course;
  }

  static async updateCourse(id, data) {
    const course = await Course.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!course) throw ApiError.notFound('Không tìm thấy học phần');
    return course;
  }

  static async deleteCourse(id) {
    // BR-13: Kiểm tra tham chiếu
    const inCurriculum = await Curriculum.countDocuments({ 'semesters.courses.courseId': id });
    if (inCurriculum > 0) {
      throw ApiError.conflict(
        `Không thể xóa học phần vì đang có ${inCurriculum} CTĐT tham chiếu`
      );
    }

    const course = await Course.findByIdAndDelete(id);
    if (!course) throw ApiError.notFound('Không tìm thấy học phần');
    return course;
  }

  // ========================================
  // QUẢN LÝ CTĐT (CURRICULUM)
  // ========================================

  static async getCurricula(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.isActive !== undefined) {
      filter.isActive = query.isActive === 'true';
    }

    const [curricula, total] = await Promise.all([
      Curriculum.find(filter).skip(skip).limit(limit).sort({ startYear: -1 }),
      Curriculum.countDocuments(filter),
    ]);

    return { data: curricula, pagination: buildPagination(total, page, limit) };
  }

  static async getCurriculumById(id) {
    const curriculum = await Curriculum.findById(id)
      .populate('semesters.courses.courseId', 'courseCode name credits courseType');
    if (!curriculum) throw ApiError.notFound('Không tìm thấy CTĐT');
    return curriculum;
  }

  static async createCurriculum(data) {
    const curriculum = await Curriculum.create(data);
    return curriculum;
  }

  static async updateCurriculum(id, data) {
    const curriculum = await Curriculum.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!curriculum) throw ApiError.notFound('Không tìm thấy CTĐT');
    return curriculum;
  }

  static async deleteCurriculum(id) {
    // BR-13: Kiểm tra tham chiếu
    const AcademicProfile = mongoose.models.AcademicProfile;
    if (AcademicProfile) {
      const inUse = await AcademicProfile.countDocuments({ curriculumId: id });
      if (inUse > 0) {
        throw ApiError.conflict(
          `Không thể xóa CTĐT vì đang có ${inUse} sinh viên sử dụng`
        );
      }
    }

    const curriculum = await Curriculum.findByIdAndDelete(id);
    if (!curriculum) throw ApiError.notFound('Không tìm thấy CTĐT');
    return curriculum;
  }

  // ========================================
  // QUẢN LÝ HƯỚNG NGHỀ NGHIỆP (CAREER DIRECTION)
  // ========================================

  static async getCareerDirections(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }

    const [directions, total] = await Promise.all([
      CareerDirection.find(filter)
        .populate('requiredSkills.skillId', 'name category')
        .skip(skip).limit(limit).sort({ name: 1 }),
      CareerDirection.countDocuments(filter),
    ]);

    return { data: directions, pagination: buildPagination(total, page, limit) };
  }

  static async getCareerDirectionById(id) {
    const direction = await CareerDirection.findById(id)
      .populate('requiredSkills.skillId', 'name category icon');
    if (!direction) throw ApiError.notFound('Không tìm thấy hướng nghề nghiệp');
    return direction;
  }

  static async createCareerDirection(data) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const direction = await CareerDirection.create({ ...data, slug });
    return direction;
  }

  static async updateCareerDirection(id, data) {
    if (data.name) {
      data.slug = slugify(data.name, { lower: true, strict: true });
    }
    const direction = await CareerDirection.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!direction) throw ApiError.notFound('Không tìm thấy hướng nghề nghiệp');
    return direction;
  }

  static async deleteCareerDirection(id) {
    // BR-13: Kiểm tra tham chiếu
    const inJobTemplate = await JobTemplate.countDocuments({ careerDirectionId: id });
    if (inJobTemplate > 0) {
      throw ApiError.conflict(
        `Không thể xóa vì đang có ${inJobTemplate} công việc mẫu tham chiếu`
      );
    }

    const direction = await CareerDirection.findByIdAndDelete(id);
    if (!direction) throw ApiError.notFound('Không tìm thấy hướng nghề nghiệp');
    return direction;
  }

  // ========================================
  // QUẢN LÝ CÔNG VIỆC MẪU (JOB TEMPLATE)
  // ========================================

  static async getJobTemplates(query) {
    const { page, limit, skip } = parsePagination(query);
    const filter = {};

    if (query.search) {
      filter.$text = { $search: query.search };
    }
    if (query.careerDirectionId) {
      filter.careerDirectionId = query.careerDirectionId;
    }

    const [templates, total] = await Promise.all([
      JobTemplate.find(filter)
        .populate('careerDirectionId', 'name')
        .populate('requiredSkills.skillId', 'name category')
        .skip(skip).limit(limit).sort({ title: 1 }),
      JobTemplate.countDocuments(filter),
    ]);

    return { data: templates, pagination: buildPagination(total, page, limit) };
  }

  static async getJobTemplateById(id) {
    const template = await JobTemplate.findById(id)
      .populate('careerDirectionId', 'name slug')
      .populate('requiredSkills.skillId', 'name category icon');
    if (!template) throw ApiError.notFound('Không tìm thấy công việc mẫu');
    return template;
  }

  static async createJobTemplate(data) {
    const template = await JobTemplate.create(data);
    return template;
  }

  static async updateJobTemplate(id, data) {
    const template = await JobTemplate.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!template) throw ApiError.notFound('Không tìm thấy công việc mẫu');
    return template;
  }

  static async deleteJobTemplate(id) {
    // BR-13: Kiểm tra tham chiếu bởi roadmap
    const Roadmap = mongoose.models.Roadmap;
    if (Roadmap) {
      const inUse = await Roadmap.countDocuments({ relatedJobTemplates: id });
      if (inUse > 0) {
        throw ApiError.conflict(
          `Không thể xóa vì đang có ${inUse} lộ trình tham chiếu`
        );
      }
    }

    const template = await JobTemplate.findByIdAndDelete(id);
    if (!template) throw ApiError.notFound('Không tìm thấy công việc mẫu');
    return template;
  }
}

// Cần import mongoose cho BR-13 checks
const mongoose = require('mongoose');

module.exports = AdminService;
