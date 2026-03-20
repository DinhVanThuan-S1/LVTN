/**
 * Curriculum Model (Chương trình đào tạo)
 */
const mongoose = require('mongoose');
const { SEMESTER_TYPE_ARRAY } = require('../../config/constants');

const curriculumSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên CTĐT là bắt buộc'],
      trim: true,
    },
    code: {
      type: String,
      required: [true, 'Mã CTĐT là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },
    totalCredits: {
      type: Number,
      required: [true, 'Tổng tín chỉ là bắt buộc'],
      min: 1,
    },
    startYear: {
      type: Number,
      required: [true, 'Năm bắt đầu áp dụng là bắt buộc'],
    },

    // Phân bổ học phần theo học kỳ
    semesters: [{
      year: { type: Number, required: true },  // Năm thứ mấy (1,2,3,4)
      semester: { type: String, enum: SEMESTER_TYPE_ARRAY, required: true },
      courses: [{
        courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
        isRequired: { type: Boolean, default: true },
      }],
    }],

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes
curriculumSchema.index({ isActive: 1 });
curriculumSchema.index({ name: 'text', code: 'text' });

const Curriculum = mongoose.model('Curriculum', curriculumSchema);
module.exports = Curriculum;
