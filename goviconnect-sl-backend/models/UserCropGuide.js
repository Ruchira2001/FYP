const mongoose = require('mongoose');

const userCropGuideSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropId: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    scientificName: String,
    category: String,
    description: String,
    climate: String,
    soil: String,
    season: String,
    diseases: String,
    treatments: String,
    practices: String,
    videoLink: String,
    videoLinks: [String],
    videoUrls: [String],
    imageUrl: String,
    images: [String],
    reactions: {
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    },
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
