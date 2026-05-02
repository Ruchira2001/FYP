const mongoose = require('mongoose');

const diagnosisResultSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    diseaseName: {
      type: String,
      required: true,
    },
    diseaseNameSi: String,
    confidence: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    treatments: [String],
    treatmentsSi: [String],
    preventionTips: [String],
    preventionTipsSi: [String],
    recommendedChemicals: [String],
    recommendedChemicalsSi: [String],
    isHealthy: {
      type: Boolean,
      default: false,
    },
    healthMessage: String,
    healthMessageSi: String,
    synced: {
      type: Boolean,
      default: true,
    },
    // Expert review fields
    expertReviewed: {
      type: Boolean,
      default: false,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
    },
    expertDiagnosis: String,
    expertNotes: String,
    reviewStatus: {
      type: String,
      enum: ['pending_review', 'verified', 'corrected'],
      default: 'pending_review',
    },
    reviewedAt: Date,
  },
  {
    timestamps: true,
  }
);

diagnosisResultSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DiagnosisResult', diagnosisResultSchema);
