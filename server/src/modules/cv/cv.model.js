/**
 * CV Model (Hồ sơ xin việc)
 */
const mongoose = require('mongoose');

const cvSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Tiêu đề CV là bắt buộc'],
      trim: true,
    },
    isDefault: { type: Boolean, default: false },

    // Nội dung CV
    personalInfo: {
      fullName: { type: String },
      email: { type: String },
      phone: { type: String },
      address: { type: String },
      dateOfBirth: { type: Date },
      summary: { type: String, default: '' }, // Tóm tắt bản thân
    },
    education: [{
      school: { type: String },
      major: { type: String },
      degree: { type: String },
      startYear: { type: Number },
      endYear: { type: Number },
      gpa: { type: Number },
    }],
    experience: [{
      company: { type: String },
      position: { type: String },
      startDate: { type: Date },
      endDate: { type: Date },
      isCurrent: { type: Boolean, default: false },
      description: { type: String },
    }],
    skills: [{
      name: { type: String },
      level: { type: String },
    }],
    certifications: [{
      name: { type: String },
      issuer: { type: String },
      date: { type: Date },
      url: { type: String },
    }],
    projects: [{
      name: { type: String },
      description: { type: String },
      technologies: [{ type: String }],
      url: { type: String },
    }],
    languages: [{
      name: { type: String },
      level: { type: String },
    }],
    hobbies: { type: String, default: '' },

    // File CV upload
    fileUrl: { type: String, default: null }, // PDF/DOCX
  },
  { timestamps: true }
);

// Indexes
cvSchema.index({ userId: 1 });
cvSchema.index({ userId: 1, isDefault: 1 });

const CV = mongoose.model('CV', cvSchema);
module.exports = CV;
