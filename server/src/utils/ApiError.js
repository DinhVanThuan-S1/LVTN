/**
 * Custom API Error Class
 * Extends Error để hỗ trợ HTTP status code và errors array
 */
class ApiError extends Error {
  constructor(statusCode, message, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.isOperational = true; // Phân biệt lỗi nghiệp vụ vs lỗi hệ thống

    Error.captureStackTrace(this, this.constructor);
  }

  // Factory methods cho các lỗi phổ biến
  static badRequest(message, errors = []) {
    return new ApiError(400, message, errors);
  }

  static unauthorized(message = 'Không có quyền truy cập') {
    return new ApiError(401, message);
  }

  static forbidden(message = 'Bạn không có quyền thực hiện thao tác này') {
    return new ApiError(403, message);
  }

  static notFound(message = 'Không tìm thấy tài nguyên') {
    return new ApiError(404, message);
  }

  static conflict(message = 'Dữ liệu bị xung đột') {
    return new ApiError(409, message);
  }

  static internal(message = 'Lỗi hệ thống, vui lòng thử lại sau') {
    return new ApiError(500, message);
  }
}

module.exports = ApiError;
