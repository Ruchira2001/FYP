const mongoose = require('mongoose');

const predictionResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    crop: {
      type: String,
      required: true,
    },
    cropSi: String,
    variety: String,
    landSize: {
      type: Number,
      required: true,
    },
    landUnit: {
      type: String,
      required: true,
      enum: ['acres', 'hectares', 'perches'],
    },
    district: String,
    season: {
      type: String,
      enum: ['Maha', 'Yala', null],
    },
    expectedYield: String,
    priceLow: {
      type: Number,
      required: true,
    },
    priceHigh: {
      type: Number,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    summarySi: String,
    synced: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

predictionResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('PredictionResult', predictionResultSchema);
