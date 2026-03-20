/**
 * Skill Model
 * Kỹ năng + tài nguyên học tập + bài tập
 */
const mongoose = require('mongoose');
const {
  SKILL_CATEGORY_ARRAY,
  RESOURCE_TYPE_ARRAY,
  EXERCISE_TYPE_ARRAY,
} = require('../../config/constants');

// Sub-schema: Tài nguyên học tập
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Tên tài nguyên là bắt buộc'] },
  type: { type: String, enum: RESOURCE_TYPE_ARRAY, required: true },
  url: { type: String, required: [true, 'URL tài nguyên là bắt buộc'] },
  description: { type: String, default: '' },
  duration: { type: Number, default: null }, // Thời lượng (phút)
  order: { type: Number, default: 0 },
}, { _id: true });

// Sub-schema: Bài tập
const exerciseSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Tên bài tập là bắt buộc'] },
  type: { type: String, enum: EXERCISE_TYPE_ARRAY, required: true },
  description: { type: String, required: [true, 'Mô tả bài tập là bắt buộc'] },
  instructions: { type: String, default: '' },
  referenceUrl: { type: String, default: null },
  estimatedTime: { type: Number, default: 30 }, // phút
  order: { type: Number, default: 0 },
}, { _id: true });

// Sub-schema: Liên kết học phần (cho Skill Map)
const relatedCourseSchema = new mongoose.Schema({
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  weight: { type: Number, default: 1, min: 0.1, max: 5 },
  // weight = mức độ liên quan: 1=bình thường, 3=rất liên quan, 5=trọng tâm
}, { _id: false });

const skillSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên kỹ năng là bắt buộc'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      enum: { values: SKILL_CATEGORY_ARRAY, message: 'Category không hợp lệ' },
      required: [true, 'Nhóm kỹ năng là bắt buộc'],
    },
    description: { type: String, default: '' },
    icon: { type: String, default: null },

    resources: [resourceSchema],
    exercises: [exerciseSchema],
    relatedCourses: [relatedCourseSchema],
  },
  { timestamps: true }
);

// Indexes
skillSchema.index({ category: 1 });
skillSchema.index({ name: 'text', description: 'text' });

const Skill = mongoose.model('Skill', skillSchema);
module.exports = Skill;
