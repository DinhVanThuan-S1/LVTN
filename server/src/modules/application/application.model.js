/**
 * Application Model (Đơn ứng tuyển)
 */
const mongoose = require('mongoose');
const { APPLICATION_STATUS_ARRAY, APPLICATION_STATUS } = require('../../config/constants');

const applicationSchema = new mongoose.Schema(
  {
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Job',
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cvId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CV',
      required: [true, 'CV là bắt buộc khi ứng tuyển'], // BR-06
    },

    coverLetter: { type: String, default: '' },

    status: {
      type: String,
      enum: APPLICATION_STATUS_ARRAY,
      default: APPLICATION_STATUS.PENDING,
    },

    // Feedback từ recruiter
    recruiterNote: { type: String, default: '' },
    interviewDate: { type: Date, default: null },
    interviewLocation: { type: String, default: '' },
    interviewLink: { type: String, default: '' },

    // Match % (từ AI)
    matchScore: { type: Number, default: null, min: 0, max: 100 },

    // Timestamps
    appliedAt: { type: Date, default: Date.now },
    reviewedAt: { type: Date, default: null },
    withdrawnAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
applicationSchema.index({ jobId: 1, studentId: 1 }, { unique: true }); // BR-07: Không ứng tuyển trùng
applicationSchema.index({ studentId: 1, status: 1 });
applicationSchema.index({ jobId: 1, status: 1 });
applicationSchema.index({ appliedAt: -1 });

const Application = mongoose.model('Application', applicationSchema);
module.exports = Application;
