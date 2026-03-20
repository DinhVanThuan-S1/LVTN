/**
 * Course Model (Học phần)
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
    courseType: {
      type: String,
      enum: { values: COURSE_TYPE_ARRAY, message: 'Loại học phần không hợp lệ' },
      required: [true, 'Loại học phần là bắt buộc'],
    },

    // Kỹ năng mà học phần đóng góp (dùng cho Skill Map)
    contributedSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      weight: { type: Number, default: 1, min: 0.1, max: 5 },
    }],

    // Điều kiện tiên quyết
    prerequisiteCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  },
  { timestamps: true }
);

// Indexes
courseSchema.index({ courseType: 1 });
courseSchema.index({ name: 'text', courseCode: 'text' });

const Course = mongoose.model('Course', courseSchema);
module.exports = Course;
