/**
 * Course Model (Học phần)
 * Bao gồm: loại HP, tiên quyết, song hành, kiến thức LT/TH
 */
const mongoose = require('mongoose');
const { COURSE_TYPE_ARRAY } = require('../../config/constants');

const courseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: [true, 'Mã học phần là bắt buộc'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Tên học phần là bắt buộc'],
      trim: true,
    },
    description: { type: String, default: '' },
    credits: {
      type: Number,
      required: [true, 'Số tín chỉ là bắt buộc'],
      min: [1, 'Số tín chỉ tối thiểu là 1'],
      max: [10, 'Số tín chỉ tối đa là 10'],
    },

    // Loại học phần (general, foundational, specialized, elective, thesis)
    courseType: {
      type: String,
      enum: { values: COURSE_TYPE_ARRAY, message: 'Loại học phần không hợp lệ' },
      required: [true, 'Loại học phần là bắt buộc'],
    },

    // Bắt buộc hay Tự chọn
    isRequired: {
      type: Boolean,
      default: true, // true = Bắt buộc, false = Tự chọn
    },

    // Kiến thức lý thuyết
    theoryDescription: { type: String, default: '' },

    // Kiến thức thực hành (nếu có)
    practiceDescription: { type: String, default: '' },

    // Kỹ năng mà học phần đóng góp (dùng cho Skill Map)
    contributedSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      weight: { type: Number, default: 1, min: 0.1, max: 5 },
    }],

    // Điều kiện tiên quyết (phải hoàn thành trước)
    prerequisiteCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],

    // Học phần song hành (học cùng lúc)
    corequisiteCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
);

// Indexes
courseSchema.index({ courseType: 1 });
courseSchema.index({ isRequired: 1 });
courseSchema.index({ name: 'text', courseCode: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
