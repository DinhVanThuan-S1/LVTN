/**
 * User Routes
 */
const express = require('express');
const router = express.Router();
const UserController = require('./user.controller');
const authenticate = require('../../middleware/authenticate');
const validate = require('../../middleware/validate');
const { updateProfileValidation } = require('./user.validation');
const { uploadAvatar } = require('../../config/upload');

// Tất cả routes đều yêu cầu đăng nhập
router.use(authenticate);

// Lấy thông tin cá nhân
router.get('/me', UserController.getMe);

// Cập nhật thông tin cá nhân
router.put('/me', validate(updateProfileValidation), UserController.updateMe);

// Upload avatar (Multer v2)
router.put('/me/avatar', uploadAvatar, UserController.updateAvatar);

module.exports = router;

