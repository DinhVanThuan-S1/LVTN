/**
 * CV Routes (Student)
 */
const express = require('express');
const router = express.Router();
const CV = require('./cv.model');
const authenticate = require('../../middleware/authenticate');
const authorize = require('../../middleware/authorize');
const catchAsync = require('../../utils/catchAsync');
const ApiResponse = require('../../utils/ApiResponse');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../config/constants');

router.use(authenticate, authorize(ROLES.STUDENT));

// Danh sách CV
router.get('/', catchAsync(async (req, res) => {
  const cvs = await CV.find({ userId: req.user._id }).sort({ isDefault: -1, updatedAt: -1 });
  ApiResponse.success(res, 200, 'Thành công', cvs);
}));

// Chi tiết CV
router.get('/:id', catchAsync(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cv) throw ApiError.notFound('Không tìm thấy CV');
  ApiResponse.success(res, 200, 'Thành công', cv);
}));

// Tạo CV
router.post('/', catchAsync(async (req, res) => {
  const cvCount = await CV.countDocuments({ userId: req.user._id });
  const isDefault = cvCount === 0; // CV đầu tiên tự động là default
  const cv = await CV.create({ ...req.body, userId: req.user._id, isDefault });
  ApiResponse.created(res, 'Tạo CV thành công', cv);
}));

// Cập nhật CV
router.put('/:id', catchAsync(async (req, res) => {
  const cv = await CV.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    req.body,
    { new: true, runValidators: true }
  );
  if (!cv) throw ApiError.notFound('Không tìm thấy CV');
  ApiResponse.success(res, 200, 'Cập nhật CV thành công', cv);
}));

// Đặt CV mặc định
router.patch('/:id/default', catchAsync(async (req, res) => {
  // Bỏ default cũ
  await CV.updateMany({ userId: req.user._id }, { isDefault: false });
  // Set default mới
  const cv = await CV.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isDefault: true },
    { new: true }
  );
  if (!cv) throw ApiError.notFound('Không tìm thấy CV');
  ApiResponse.success(res, 200, 'Đặt CV mặc định thành công', cv);
}));

// Xóa CV
router.delete('/:id', catchAsync(async (req, res) => {
  const cv = await CV.findOne({ _id: req.params.id, userId: req.user._id });
  if (!cv) throw ApiError.notFound('Không tìm thấy CV');
  await CV.findByIdAndDelete(cv._id);
  ApiResponse.success(res, 200, 'Xóa CV thành công');
}));

module.exports = router;
