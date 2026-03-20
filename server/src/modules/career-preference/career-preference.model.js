/**
 * Career Preference Model (Sở thích nghề nghiệp)
 */
const mongoose = require('mongoose');
const { JOB_TYPE_ARRAY, EXPERIENCE_LEVEL_ARRAY } = require('../../config/constants');

const careerPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    preferredDirections: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'CareerDirection',
    }],
    preferredJobTypes: [{
      type: String,
      enum: JOB_TYPE_ARRAY,
    }],
    preferredLocations: [{
      type: String,
      trim: true,
    }],
    preferredCompanies: [{
      type: String,
      trim: true,
    }],
    expectedSalary: {
      min: { type: Number, default: null },
      max: { type: Number, default: null },
    },
    experienceLevel: {
      type: String,
      enum: EXPERIENCE_LEVEL_ARRAY,
      default: 'intern',
    },
    willingToRelocate: { type: Boolean, default: false },
    availableFrom: { type: Date, default: null },
    additionalNotes: { type: String, default: '' },
  },
  { timestamps: true }
);

// Indexes
careerPreferenceSchema.index({ userId: 1 });

const CareerPreference = mongoose.model('CareerPreference', careerPreferenceSchema);
module.exports = CareerPreference;
