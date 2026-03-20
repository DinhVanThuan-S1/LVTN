/**
 * Skill Test Model (Bài test kỹ năng)
 * Trắc nghiệm online, hệ thống tự chấm
 */
const mongoose = require('mongoose');
const { QUESTION_TYPE_ARRAY } = require('../../config/constants');

// Sub-schema: Đáp án
const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
}, { _id: true });

// Sub-schema: Câu hỏi
const questionSchema = new mongoose.Schema({
  question: { type: String, required: [true, 'Nội dung câu hỏi là bắt buộc'] },
  type: {
    type: String,
    enum: QUESTION_TYPE_ARRAY,
    default: 'single_choice',
  },
  answers: {
    type: [answerSchema],
    validate: {
      validator: (v) => v.length >= 2,
      message: 'Mỗi câu hỏi phải có ít nhất 2 đáp án',
    },
  },
  explanation: { type: String, default: '' }, // Giải thích đáp án đúng
  order: { type: Number, default: 0 },
}, { _id: true });

const skillTestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Tên bài test là bắt buộc'],
      trim: true,
    },
    description: { type: String, default: '' },

    skillId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Skill',
      required: [true, 'Kỹ năng liên quan là bắt buộc'],
    },

    questions: [questionSchema],
    totalQuestions: { type: Number, default: 0 },
    passingScore: { type: Number, default: 70, min: 0, max: 100 }, // % điểm đậu
    timeLimit: { type: Number, default: 30 }, // phút (0 = không giới hạn)
    maxAttempts: { type: Number, default: 3 }, // Số lần thi tối đa (0 = không giới hạn)

    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

// ========== INDEXES ==========
skillTestSchema.index({ skillId: 1 });
skillTestSchema.index({ isActive: 1 });

// Pre-save: tính totalQuestions
skillTestSchema.pre('save', function () {
  this.totalQuestions = this.questions.length;
});

const SkillTest = mongoose.model('SkillTest', skillTestSchema);
module.exports = SkillTest;
