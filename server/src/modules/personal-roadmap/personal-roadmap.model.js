/**
 * Personal Roadmap Model (Lộ trình cá nhân của sinh viên)
 * Khi SV enroll roadmap → tạo bản sao cá nhân hóa để track progress
 */
const mongoose = require('mongoose');
const {
  PERSONAL_ROADMAP_STATUS_ARRAY,
  SESSION_STATUS_ARRAY,
  SESSION_STATUS,
  PERSONAL_ROADMAP_STATUS,
} = require('../../config/constants');

// Sub-schema: Tiến độ từng step
const stepProgressSchema = new mongoose.Schema({
  stepId: { type: mongoose.Schema.Types.ObjectId, required: true }, // Reference tới step trong Roadmap
  title: { type: String },
  status: {
    type: String,
    enum: SESSION_STATUS_ARRAY,
    default: SESSION_STATUS.LOCKED,
  },
  startedAt: { type: Date, default: null },
  completedAt: { type: Date, default: null },
  timeSpentMinutes: { type: Number, default: 0 },
  notes: { type: String, default: '' },
  testScore: { type: Number, default: null }, // Điểm test (nếu có)
}, { _id: true });

// Sub-schema: Tiến độ giai đoạn
const phaseProgressSchema = new mongoose.Schema({
  phaseId: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String },
  steps: [stepProgressSchema],
  completedSteps: { type: Number, default: 0 },
  totalSteps: { type: Number, default: 0 },
}, { _id: true });

// Sub-schema: Lịch học
const scheduleSlotSchema = new mongoose.Schema({
  dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=CN, 1=T2...6=T7
  startTime: { type: String, required: true }, // "08:00"
  endTime: { type: String, required: true },   // "10:00"
}, { _id: false });

const personalRoadmapSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    roadmapId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Roadmap',
      required: true,
    },
    status: {
      type: String,
      enum: PERSONAL_ROADMAP_STATUS_ARRAY,
      default: PERSONAL_ROADMAP_STATUS.ACTIVE,
    },

    // Tiến độ
    phases: [phaseProgressSchema],
    overallProgress: { type: Number, default: 0, min: 0, max: 100 }, // %
    completedSteps: { type: Number, default: 0 },
    totalSteps: { type: Number, default: 0 },

    // Lịch học cá nhân
    schedule: [scheduleSlotSchema],
    weeklyHoursTarget: { type: Number, default: 10 }, // Mục tiêu giờ/tuần

    // Thời gian
    enrolledAt: { type: Date, default: Date.now },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    expectedCompletionDate: { type: Date, default: null },
    totalTimeSpentMinutes: { type: Number, default: 0 },

    // Readiness Score (cache từ AI)
    readinessScore: { type: Number, default: null, min: 0, max: 100 },
    readinessUpdatedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
personalRoadmapSchema.index({ userId: 1, status: 1 });
personalRoadmapSchema.index({ userId: 1, roadmapId: 1 }, { unique: true }); // Mỗi SV chỉ enroll 1 lần/roadmap
personalRoadmapSchema.index({ roadmapId: 1 });

const PersonalRoadmap = mongoose.model('PersonalRoadmap', personalRoadmapSchema);
module.exports = PersonalRoadmap;
