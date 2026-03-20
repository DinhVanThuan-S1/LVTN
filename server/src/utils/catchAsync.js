/**
 * Async Error Wrapper
 * Bọc controller function để tự động catch lỗi và forward đến error handler
 * Tránh phải try-catch ở mỗi controller method
 */
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

module.exports = catchAsync;
