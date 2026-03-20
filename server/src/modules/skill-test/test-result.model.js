/**
 * Test Result Model (Kết quả thi)
 */
const mongoose = require('mongoose');

const testResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SkillTest',
      required: true,
    },
    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
    },

    // Kết quả
    answers: [{
      questionId: { type: mongoose.Schema.Types.ObjectId },
      selectedAnswerIds: [{ type: mongoose.Schema.Types.ObjectId }],
      isCorrect: { type: Boolean },
    }],

    correctCount: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    score: { type: Number, default: 0, min: 0, max: 100 }, // %
    passed: { type: Boolean, default: false },

    timeSpentSeconds: { type: Number, default: 0 },
    attemptNumber: { type: Number, default: 1 },

    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
testResultSchema.index({ userId: 1, testId: 1 });
testResultSchema.index({ userId: 1, skillId: 1 });
testResultSchema.index({ completedAt: -1 });

const TestResult = mongoose.model('TestResult', testResultSchema);
module.exports = TestResult;
