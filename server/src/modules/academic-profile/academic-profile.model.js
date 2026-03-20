/**
 * Academic Profile Model (Hồ sơ học tập)
 * Lưu trữ CTĐT, kết quả học tập theo học kỳ
 */
const mongoose = require('mongoose');
const { SEMESTER_TYPE_ARRAY } = require('../../config/constants');

// Sub-schema: Kết quả môn học
const courseResultSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  grade: {
    type: Number, // Thang 10
    min: 0,
    max: 10,
    default: null,
  },
  letterGrade: {
    type: String, // A+, A, B+, B, C+, C, D+, D, F
    default: null,
  },
  gpa4: {
    type: Number, // Thang 4
    min: 0,
    max: 4,
    default: null,
  },
  passed: { type: Boolean, default: null },
}, { _id: true });

// Sub-schema: Học kỳ
const semesterResultSchema = new mongoose.Schema({
  year: { type: Number, required: true },      // Năm thứ mấy (1-6)
  semester: { type: String, enum: SEMESTER_TYPE_ARRAY, required: true },
  academicYear: { type: String },              // VD: "2023-2024"
  courses: [courseResultSchema],
  semesterGPA: { type: Number, min: 0, max: 4, default: null },
}, { _id: true });

const academicProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Mỗi user chỉ có 1 hồ sơ học tập
    },
    curriculumId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Curriculum',
      required: [true, 'Chương trình đào tạo là bắt buộc'],
    },
    studentId: {
      type: String, // Mã số sinh viên
      trim: true,
      default: null,
    },
    enrollmentYear: {
      type: Number, // Năm nhập học
      required: [true, 'Năm nhập học là bắt buộc'],
    },
    currentYear: { type: Number, default: 1 },   // Đang năm thứ mấy
    currentSemester: { type: String, enum: SEMESTER_TYPE_ARRAY, default: '1' },

    // Kết quả học tập
    semesters: [semesterResultSchema],

    // GPA tổng (tự động tính)
    cumulativeGPA: { type: Number, min: 0, max: 4, default: null },
    totalCreditsEarned: { type: Number, default: 0 },

    // Skill Map (tính từ AI service, cache tại đây)
    skillMap: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      proficiency: { type: Number, min: 0, max: 100, default: 0 }, // %
      level: { type: String, default: 'none' },
      lastUpdated: { type: Date, default: Date.now },
    }],
    skillMapUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Indexes
academicProfileSchema.index({ userId: 1 });
academicProfileSchema.index({ curriculumId: 1 });
academicProfileSchema.index({ enrollmentYear: -1 });

const AcademicProfile = mongoose.model('AcademicProfile', academicProfileSchema);
module.exports = AcademicProfile;
