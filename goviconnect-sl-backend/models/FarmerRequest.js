const mongoose = require('mongoose');

const farmerRequestSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
    },
    farmerName: String,
    farmerDistrict: String,
    type: {
      type: String,
      enum: ['diagnosis', 'consultation'],
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    description: String,
    cropName: String,
    imageUrl: String,
    status: {
      type: String,
      enum: ['pending', 'in_review', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    expertResponse: String,
  },
  {
    timestamps: true,
  }
);

farmerRequestSchema.index({ expertId: 1, status: 1 });
farmerRequestSchema.index({ farmerId: 1, createdAt: -1 });

module.exports = mongoose.model('FarmerRequest', farmerRequestSchema);
