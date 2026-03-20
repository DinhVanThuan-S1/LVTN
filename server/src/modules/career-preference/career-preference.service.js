/**
 * Career Preference Service
 */
const CareerPreference = require('./career-preference.model');
const ApiError = require('../../utils/ApiError');

class CareerPreferenceService {
  static async getByUserId(userId) {
    let pref = await CareerPreference.findOne({ userId })
      .populate('preferredDirections', 'name slug icon');
    if (!pref) {
      // Tạo mặc định nếu chưa có
      pref = await CareerPreference.create({ userId });
    }
    return pref;
  }

  static async update(userId, data) {
    const pref = await CareerPreference.findOneAndUpdate(
      { userId },
      { $set: data },
      { new: true, upsert: true, runValidators: true }
    ).populate('preferredDirections', 'name slug icon');

    return pref;
  }
}

module.exports = CareerPreferenceService;
