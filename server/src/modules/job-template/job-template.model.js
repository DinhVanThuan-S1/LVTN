/**
 * Job Template Model (Công việc mẫu - Admin tạo)
 */
const mongoose = require('mongoose');
const { PROFICIENCY_LEVEL_ARRAY, EXPERIENCE_LEVEL_ARRAY } = require('../../config/constants');

const jobTemplateSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên công việc mẫu là bắt buộc'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Mô tả là bắt buộc'],
    },

    careerDirectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerDirection',
    },

    requiredSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
      level: { type: String, enum: PROFICIENCY_LEVEL_ARRAY, default: 'intermediate' },
    }],

    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVEL_ARRAY,
      default: 'fresher',
    },
    salaryRange: {
      min: { type: Number },
      max: { type: Number },
    },
  },
  { timestamps: true }
);

// Indexes
jobTemplateSchema.index({ careerDirectionId: 1 });
jobTemplateSchema.index({ title: 'text' });

const JobTemplate = mongoose.model('JobTemplate', jobTemplateSchema);
module.exports = JobTemplate;
