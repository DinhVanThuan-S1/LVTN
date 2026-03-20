/**
 * Pagination Helper
 * Hỗ trợ tính toán phân trang từ query params
 */

/**
 * Parse pagination params từ request query
 * @param {Object} query - req.query
 * @returns {{ page: number, limit: number, skip: number }}
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Tạo object pagination cho response
 * @param {number} total - Tổng số bản ghi
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số bản ghi mỗi trang
 * @returns {{ page, limit, total, totalPages }}
 */
const buildPagination = (total, page, limit) => {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

module.exports = { parsePagination, buildPagination };
