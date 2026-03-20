/**
 * Multer Upload Configuration
 * Cấu hình upload file cho avatar, CV, chat attachments
 * Multer v2 API
 */
const multer = require('multer');
const path = require('path');
const ApiError = require('../utils/ApiError');

// ========== STORAGE CONFIG ==========
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadDir = path.join(__dirname, '..', '..', 'uploads');

    if (file.fieldname === 'avatar') {
      uploadDir = path.join(uploadDir, 'avatars');
    } else if (file.fieldname === 'cvFile') {
      uploadDir = path.join(uploadDir, 'cvs');
    } else {
      uploadDir = path.join(uploadDir, 'general');
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ========== FILE FILTER ==========
const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Chỉ chấp nhận file ảnh (jpeg, jpg, png, gif, webp)'));
  }
};

const documentFilter = (req, file, cb) => {
  const allowed = /pdf|doc|docx/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    cb(null, true);
  } else {
    cb(new ApiError(400, 'Chỉ chấp nhận file PDF hoặc DOC/DOCX'));
  }
};

// ========== UPLOAD INSTANCES ==========

/**
 * Upload avatar (ảnh, max 5MB)
 */
const uploadAvatar = multer({
  storage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('avatar');

/**
 * Upload CV file (PDF/DOCX, max 10MB)
 */
const uploadCV = multer({
  storage,
  fileFilter: documentFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('cvFile');

/**
 * Upload chat attachment (ảnh, max 10MB)
 */
const uploadChatAttachment = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('attachment');

module.exports = {
  uploadAvatar,
  uploadCV,
  uploadChatAttachment,
};
