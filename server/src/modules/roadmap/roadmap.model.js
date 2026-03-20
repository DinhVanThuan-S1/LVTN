/**
 * Roadmap Model (Lộ trình mẫu — Admin tạo)
 * Cấu trúc: Roadmap → Phases → Steps
 */
const mongoose = require('mongoose');
const {
  ROADMAP_LEVEL_ARRAY,
  RESOURCE_TYPE_ARRAY,
} = require('../../config/constants');

// Sub-schema: Tài nguyên trong step
const stepResourceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  type: { type: String, enum: RESOURCE_TYPE_ARRAY, required: true },
  url: { type: String, required: true },
  description: { type: String, default: '' },
  duration: { type: Number, default: null }, // phút
}, { _id: true });

// Sub-schema: Step (Bước học)
const stepSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Tên bước học là bắt buộc'] },
  description: { type: String, default: '' },
  order: { type: Number, required: true },

  // Kỹ năng liên quan
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null },

  // Tài nguyên & bài tập
  resources: [stepResourceSchema],
  exerciseDescription: { type: String, default: '' },
  exerciseUrl: { type: String, default: null },

  // Thời gian ước tính (giờ)
  estimatedHours: { type: Number, default: 2, min: 0.5 },

  // Có bài test không
  hasTest: { type: Boolean, default: false },
  testId: { type: mongoose.Schema.Types.ObjectId, ref: 'SkillTest', default: null },
}, { _id: true });

// Sub-schema: Phase (Giai đoạn)
const phaseSchema = new mongoose.Schema({
  title: { type: String, required: [true, 'Tên giai đoạn là bắt buộc'] },
  description: { type: String, default: '' },
  order: { type: Number, required: true },
  steps: [stepSchema],
}, { _id: true });

const roadmapSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên lộ trình là bắt buộc'],
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả lộ trình là bắt buộc'],
    },
    thumbnail: { type: String, default: null },
    level: {
      type: String,
      enum: ROADMAP_LEVEL_ARRAY,
      required: [true, 'Cấp độ là bắt buộc'],
    },

    // Liên kết
    careerDirectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerDirection',
      default: null,
    },
    requiredSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      minLevel: { type: String, default: 'none' },
    }],
    targetSkills: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    }],

    // Nội dung
    phases: [phaseSchema],

    // Metadata
    totalEstimatedHours: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 },
    enrollmentCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
roadmapSchema.index({ isPublished: 1, level: 1 });
roadmapSchema.index({ careerDirectionId: 1 });
roadmapSchema.index({ title: 'text', description: 'text' });
roadmapSchema.index({ createdAt: -1 });

// ========== PRE-SAVE ==========
// Tính tổng steps và estimated hours
roadmapSchema.pre('save', function () {
  let totalSteps = 0;
  let totalHours = 0;
  for (const phase of this.phases) {
    totalSteps += phase.steps.length;
    for (const step of phase.steps) {
      totalHours += step.estimatedHours || 0;
    }
  }
  this.totalSteps = totalSteps;
  this.totalEstimatedHours = Math.round(totalHours * 10) / 10;
});

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
module.exports = Roadmap;
