/**
 * Validation Middleware
 * Chạy express-validator rules và trả về lỗi nếu có
 */
const { validationResult } = require('express-validator');
const ApiError = require('../utils/ApiError');

const validate = (validations) => {
  return async (req, res, next) => {
    // Chạy tất cả validation rules
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Kiểm tra kết quả
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
      value: err.value,
    }));

    next(ApiError.badRequest('Dữ liệu không hợp lệ', formattedErrors));
  };
};

module.exports = validate;
