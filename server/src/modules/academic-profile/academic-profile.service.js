/**
 * Academic Profile Service
 * Business logic cho hồ sơ học tập + Skill Map
 */
const AcademicProfile = require('./academic-profile.model');
const Course = require('../course/course.model');
const Skill = require('../skill/skill.model');
const ApiError = require('../../utils/ApiError');
const logger = require('../../config/logger');

class AcademicProfileService {
  /**
   * Lấy hồ sơ học tập của user
   */
  static async getByUserId(userId) {
    const profile = await AcademicProfile.findOne({ userId })
      .populate('curriculumId', 'name code totalCredits')
      .populate('semesters.courses.courseId', 'courseCode name credits courseType')
      .populate('skillMap.skillId', 'name category icon');

    if (!profile) {
      throw ApiError.notFound('Chưa có hồ sơ học tập. Vui lòng tạo hồ sơ.');
    }
    return profile;
  }

  /**
   * Tạo hồ sơ học tập mới
   */
  static async create(userId, data) {
    const existing = await AcademicProfile.findOne({ userId });
    if (existing) {
      throw ApiError.conflict('Hồ sơ học tập đã tồn tại');
    }

    const profile = await AcademicProfile.create({
      userId,
      curriculumId: data.curriculumId,
      studentId: data.studentId,
      enrollmentYear: data.enrollmentYear,
      currentYear: data.currentYear || 1,
      currentSemester: data.currentSemester || '1',
    });

    return profile;
  }

  /**
   * Cập nhật thông tin hồ sơ
   */
  static async update(userId, data) {
    const allowedFields = [
      'curriculumId', 'studentId', 'enrollmentYear',
      'currentYear', 'currentSemester',
    ];

    const updateData = {};
    for (const key of allowedFields) {
      if (data[key] !== undefined) updateData[key] = data[key];
    }

    const profile = await AcademicProfile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!profile) throw ApiError.notFound('Chưa có hồ sơ học tập');
    return profile;
  }

  /**
   * Thêm/cập nhật kết quả học kỳ
   */
  static async upsertSemesterResult(userId, semesterData) {
    const { year, semester, academicYear, courses } = semesterData;

    const profile = await AcademicProfile.findOne({ userId });
    if (!profile) throw ApiError.notFound('Chưa có hồ sơ học tập');

    // Tìm semester đã có
    const existingIdx = profile.semesters.findIndex(
      (s) => s.year === year && s.semester === semester
    );

    // Tính GPA học kỳ
    const semesterGPA = AcademicProfileService._calculateSemesterGPA(courses);

    const semesterResult = {
      year,
      semester,
      academicYear,
      courses,
      semesterGPA,
    };

    if (existingIdx >= 0) {
      profile.semesters[existingIdx] = semesterResult;
    } else {
      profile.semesters.push(semesterResult);
      // Sắp xếp theo năm, học kỳ
      profile.semesters.sort((a, b) => a.year - b.year || a.semester.localeCompare(b.semester));
    }

    // Tính lại GPA tổng
    const { cumulativeGPA, totalCreditsEarned } =
      await AcademicProfileService._calculateCumulativeGPA(profile);
    profile.cumulativeGPA = cumulativeGPA;
    profile.totalCreditsEarned = totalCreditsEarned;

    await profile.save();
    logger.info(`Cập nhật kết quả HK ${year}.${semester} cho user ${userId}`);

    return profile;
  }

  /**
   * Xóa kết quả một học kỳ
   */
  static async deleteSemesterResult(userId, year, semester) {
    const profile = await AcademicProfile.findOne({ userId });
    if (!profile) throw ApiError.notFound('Chưa có hồ sơ học tập');

    profile.semesters = profile.semesters.filter(
      (s) => !(s.year === parseInt(year) && s.semester === semester)
    );

    // Tính lại GPA tổng
    const { cumulativeGPA, totalCreditsEarned } =
      await AcademicProfileService._calculateCumulativeGPA(profile);
    profile.cumulativeGPA = cumulativeGPA;
    profile.totalCreditsEarned = totalCreditsEarned;

    await profile.save();
    return profile;
  }

  /**
   * Lấy Skill Map (từ cache hoặc tính lại)
   */
  static async getSkillMap(userId) {
    const profile = await AcademicProfile.findOne({ userId })
      .populate('skillMap.skillId', 'name category icon');

    if (!profile) throw ApiError.notFound('Chưa có hồ sơ học tập');

    return {
      skillMap: profile.skillMap,
      lastUpdated: profile.skillMapUpdatedAt,
    };
  }

  /**
   * Tính toán Skill Map từ kết quả học tập
   * Logic: Điểm môn học × weight liên kết kỹ năng → proficiency %
   */
  static async calculateSkillMap(userId) {
    const profile = await AcademicProfile.findOne({ userId });
    if (!profile) throw ApiError.notFound('Chưa có hồ sơ học tập');

    // Lấy tất cả courseIds đã học
    const allCourseIds = [];
    const courseGrades = {}; // courseId -> grade
    for (const sem of profile.semesters) {
      for (const cr of sem.courses) {
        if (cr.grade !== null && cr.grade !== undefined) {
          allCourseIds.push(cr.courseId);
          courseGrades[cr.courseId.toString()] = cr.grade;
        }
      }
    }

    if (allCourseIds.length === 0) {
      profile.skillMap = [];
      profile.skillMapUpdatedAt = new Date();
      await profile.save();
      return { skillMap: [], message: 'Chưa có kết quả học tập để tính Skill Map' };
    }

    // Lấy courses kèm contributedSkills
    const courses = await Course.find({ _id: { $in: allCourseIds } });

    // Tính weighted score cho mỗi skill
    // skillScores[skillId] = { totalWeightedGrade, totalWeight }
    const skillScores = {};

    for (const course of courses) {
      const courseId = course._id.toString();
      const grade = courseGrades[courseId];
      if (grade === undefined || grade === null) continue;

      for (const cs of course.contributedSkills || []) {
        const skillId = cs.skillId.toString();
        if (!skillScores[skillId]) {
          skillScores[skillId] = { totalWeightedGrade: 0, totalWeight: 0 };
        }
        skillScores[skillId].totalWeightedGrade += grade * (cs.weight || 1);
        skillScores[skillId].totalWeight += (cs.weight || 1);
      }
    }

    // Chuyển sang proficiency % và level
    const skillMap = [];
    for (const [skillId, scores] of Object.entries(skillScores)) {
      const avgGrade = scores.totalWeightedGrade / scores.totalWeight; // 0-10
      const proficiency = Math.round((avgGrade / 10) * 100); // 0-100%
      const level = AcademicProfileService._gradeToLevel(proficiency);

      skillMap.push({
        skillId,
        proficiency,
        level,
        lastUpdated: new Date(),
      });
    }

    // Sắp xếp theo proficiency giảm dần
    skillMap.sort((a, b) => b.proficiency - a.proficiency);

    // Lưu cache
    profile.skillMap = skillMap;
    profile.skillMapUpdatedAt = new Date();
    await profile.save();

    // Populate lại để trả về đầy đủ tên skill
    const result = await AcademicProfile.findById(profile._id)
      .populate('skillMap.skillId', 'name category icon');

    logger.info(`Tính Skill Map thành công cho user ${userId}: ${skillMap.length} kỹ năng`);

    return {
      skillMap: result.skillMap,
      lastUpdated: result.skillMapUpdatedAt,
    };
  }

  // ========== PRIVATE HELPERS ==========

  /**
   * Tính GPA học kỳ từ danh sách courses
   */
  static _calculateSemesterGPA(courses) {
    // Lọc các môn có gpa4
    const validCourses = courses.filter((c) => c.gpa4 !== null && c.gpa4 !== undefined);
    if (validCourses.length === 0) return null;
    const total = validCourses.reduce((sum, c) => sum + c.gpa4, 0);
    return Math.round((total / validCourses.length) * 100) / 100;
  }

  /**
   * Tính GPA tổng từ tất cả semesters
   */
  static async _calculateCumulativeGPA(profile) {
    let totalPoints = 0;
    let totalCredits = 0;

    // Lấy thông tin credits cho các courses
    const allCourseIds = [];
    for (const sem of profile.semesters) {
      for (const cr of sem.courses) {
        allCourseIds.push(cr.courseId);
      }
    }

    const courses = await Course.find({ _id: { $in: allCourseIds } });
    const creditMap = {};
    for (const c of courses) {
      creditMap[c._id.toString()] = c.credits;
    }

    for (const sem of profile.semesters) {
      for (const cr of sem.courses) {
        const credits = creditMap[cr.courseId.toString()] || 3; // Default 3 credits
        if (cr.gpa4 !== null && cr.gpa4 !== undefined && cr.passed !== false) {
          totalPoints += cr.gpa4 * credits;
          totalCredits += credits;
        }
      }
    }

    return {
      cumulativeGPA: totalCredits > 0
        ? Math.round((totalPoints / totalCredits) * 100) / 100
        : null,
      totalCreditsEarned: totalCredits,
    };
  }

  /**
   * Chuyển proficiency % sang level label
   */
  static _gradeToLevel(proficiency) {
    if (proficiency >= 85) return 'expert';
    if (proficiency >= 70) return 'advanced';
    if (proficiency >= 50) return 'intermediate';
    if (proficiency >= 30) return 'beginner';
    return 'none';
  }
}

module.exports = AcademicProfileService;
