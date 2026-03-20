/**
 * Career Preference Controller
 */
const CareerPreferenceService = require('./career-preference.service');
const ApiResponse = require('../../utils/ApiResponse');
const catchAsync = require('../../utils/catchAsync');

class CareerPreferenceController {
  static getMyPreferences = catchAsync(async (req, res) => {
    const pref = await CareerPreferenceService.getByUserId(req.user._id);
    ApiResponse.success(res, 200, 'Thành công', pref);
  });

  static updatePreferences = catchAsync(async (req, res) => {
    const pref = await CareerPreferenceService.update(req.user._id, req.body);
    ApiResponse.success(res, 200, 'Cập nhật sở thích nghề nghiệp thành công', pref);
  });
}

module.exports = CareerPreferenceController;
