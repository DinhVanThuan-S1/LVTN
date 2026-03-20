/**
 * Career Direction Model (Hướng nghề nghiệp)
 */
const mongoose = require('mongoose');
const { IMPORTANCE_ARRAY } = require('../../config/constants');

const careerDirectionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên hướng nghề nghiệp là bắt buộc'],
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    description: { type: String, default: '' },
    icon: { type: String, default: null },

    // Kỹ năng cần thiết cho hướng này
    requiredSkills: [{
      skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
      importance: {
        type: String,
        enum: IMPORTANCE_ARRAY,
        default: 'should_have',
      },
    }],

    averageSalary: {
      min: { type: Number, default: null }, // VND/tháng
      max: { type: Number, default: null },
    },
  },
  { timestamps: true }
);

// Indexes
careerDirectionSchema.index({ name: 'text', description: 'text' });

const CareerDirection = mongoose.model('CareerDirection', careerDirectionSchema);
module.exports = CareerDirection;
