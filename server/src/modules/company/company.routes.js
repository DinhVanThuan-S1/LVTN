/**
 * Company Profile Routes (Recruiter)
 */
const express = require('express');
const router = express.Router();
const CompanyProfile = require('./company.model');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const { ROLES } = require('../../config/constants');

router.use(authenticate, authorize(ROLES.RECRUITER));

// Lấy hồ sơ công ty
router.get('/me', catchAsync(async (req, res) => {
  let company = await CompanyProfile.findOne({ userId: req.user._id });
  if (!company) {
    company = await CompanyProfile.create({
      userId: req.user._id,
      companyName: 'Chưa cập nhật tên công ty',
    });
  }
  ApiResponse.success(res, 200, 'Thành công', company);
}));

// Cập nhật hồ sơ công ty
router.put('/me', catchAsync(async (req, res) => {
  const company = await CompanyProfile.findOneAndUpdate(
    { userId: req.user._id },
    { $set: req.body },
    { new: true, upsert: true, runValidators: true }
  );
  ApiResponse.success(res, 200, 'Cập nhật hồ sơ công ty thành công', company);
}));

module.exports = router;
