/**
 * Job Model (Tin tuyển dụng)
 */
const mongoose = require('mongoose');
const {
  JOB_STATUS_ARRAY, JOB_STATUS, JOB_TYPE_ARRAY,
  EXPERIENCE_LEVEL_ARRAY, PROFICIENCY_LEVEL_ARRAY,
} = require('../../config/constants');

const jobSchema = new mongoose.Schema(
  {
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    companyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CompanyProfile',
    },

    title: {
      type: String,
      required: [true, 'Tiêu đề tin tuyển dụng là bắt buộc'],
      trim: true,
    },
    slug: { type: String },
    description: {
      type: String,
      required: [true, 'Mô tả công việc là bắt buộc'],
    },
    requirements: { type: String, default: '' },
    benefits: { type: String, default: '' },

    // Chi tiết
    jobType: {
      type: String,
      enum: JOB_TYPE_ARRAY,
      required: [true, 'Loại công việc là bắt buộc'],
    },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVEL_ARRAY,
      required: [true, 'Cấp độ kinh nghiệm là bắt buộc'],
    },
    location: {
      city: { type: String },
      district: { type: String },
      address: { type: String },
      isRemote: { type: Boolean, default: false },
    },
    salary: {
      min: { type: Number },
      max: { type: Number },
      currency: { type: String, default: 'VND' },
      isNegotiable: { type: Boolean, default: false },
    },
    positions: { type: Number, default: 1 }, // Số lượng tuyển

    // Kỹ năng yêu cầu
    requiredSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' },
      level: { type: String, enum: PROFICIENCY_LEVEL_ARRAY, default: 'intermediate' },
    }],

    careerDirectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerDirection',
      default: null,
    },

    // Trạng thái (BR-09, BR-10)
    status: {
      type: String,
      enum: JOB_STATUS_ARRAY,
      default: JOB_STATUS.DRAFT,
    },
    rejectionReason: { type: String, default: null },
    publishedAt: { type: Date, default: null },
    expiresAt: { type: Date, default: null },

    // Metadata
    viewCount: { type: Number, default: 0 },
    applicationCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
jobSchema.index({ recruiterId: 1, status: 1 });
jobSchema.index({ status: 1, publishedAt: -1 });
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ 'location.city': 1 });
jobSchema.index({ jobType: 1 });
jobSchema.index({ experienceLevel: 1 });
jobSchema.index({ careerDirectionId: 1 });
jobSchema.index({ expiresAt: 1 });

const Job = mongoose.model('Job', jobSchema);
module.exports = Job;
