const mongoose = require('mongoose');

const userCropGuideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    scientificName: String,
    category: {
      type: String,
      required: true,
    },
    description: String,
    climate: String,
    soil: String,
    season: String,
    diseases: String,
    treatments: String,
    practices: String,
    videoLink: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    rejectionReason: String,
  },
  {
    timestamps: true,
  }
);

userCropGuideSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('UserCropGuide', userCropGuideSchema);
