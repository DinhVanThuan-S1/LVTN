/**
 * Standardized API Response
 * Đảm bảo format response nhất quán trên toàn hệ thống
 */
class ApiResponse {
  /**
   * Response thành công
   * @param {Object} res - Express response
   * @param {number} statusCode - HTTP status code
   * @param {string} message - Thông báo
   * @param {*} data - Dữ liệu trả về
   */
  static success(res, statusCode = 200, message = 'Thành công', data = null) {
    const response = { success: true, message };
    if (data !== null) response.data = data;
    return res.status(statusCode).json(response);
  }

  /**
   * Response thành công với phân trang
   * @param {Object} res - Express response
   * @param {Array} data - Mảng dữ liệu
   * @param {Object} pagination - { page, limit, total, totalPages }
   * @param {string} message - Thông báo
   */
  static paginated(res, data, pagination, message = 'Thành công') {
    return res.status(200).json({
      success: true,
      message,
      data,
      pagination,
    });
  }

  /**
   * Response tạo mới thành công
   */
  static created(res, message = 'Tạo mới thành công', data = null) {
    return ApiResponse.success(res, 201, message, data);
  }

  /**
   * Response không có nội dung
   */
  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = ApiResponse;
