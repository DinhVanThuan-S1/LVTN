/**
 * Company Profile Model (Hồ sơ công ty)
 */
const mongoose = require('mongoose');

const companyProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // Mỗi recruiter 1 company profile
    },
    companyName: {
      type: String,
      required: [true, 'Tên công ty là bắt buộc'],
      trim: true,
    },
    logo: { type: String, default: null },
    website: { type: String, default: null },
    industry: { type: String, default: '' },
    companySize: { type: String, default: '' }, // "1-50", "50-200", "200-500", "500+"
    description: { type: String, default: '' },
    taxCode: { type: String, default: null },
    addresses: [{
      label: { type: String, default: 'Trụ sở chính' },
      street: { type: String },
      district: { type: String },
      city: { type: String },
      province: { type: String },
    }],
    contactEmail: { type: String },
    contactPhone: { type: String },
  },
  { timestamps: true }
);

companyProfileSchema.index({ companyName: 'text' });

const CompanyProfile = mongoose.model('CompanyProfile', companyProfileSchema);
module.exports = CompanyProfile;
