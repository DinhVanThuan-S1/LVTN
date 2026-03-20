/**
 * Favorite Model (Yêu thích — Job / Roadmap)
 */
const mongoose = require('mongoose');
const { FAVORITE_TYPE_ARRAY } = require('../../config/constants');

const favoriteSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetType: {
      type: String,
      enum: FAVORITE_TYPE_ARRAY,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: 'targetType', // Dynamic ref
    },
  },
  { timestamps: true }
);

// Unique: mỗi user chỉ thích 1 target 1 lần
favoriteSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });
favoriteSchema.index({ userId: 1, targetType: 1 });

const Favorite = mongoose.model('Favorite', favoriteSchema);
module.exports = Favorite;
