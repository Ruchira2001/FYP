const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema(
  {
    name: String,
    nameSi: String,
    symptoms: String,
    symptomsSi: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
    },
  },
  { _id: false }
);

const treatmentSchema = new mongoose.Schema(
  {
    disease: String,
    methods: [String],
    methodsSi: [String],
  },
  { _id: false }
);

const practiceSchema = new mongoose.Schema(
  {
    title: String,
    titleSi: String,
    content: String,
    contentSi: String,
  },
  { _id: false }
);

const cropGuideSchema = new mongoose.Schema(
  {
    cropId: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    titleSi: String,
    category: {
      type: String,
      required: true,
    },
    thumbnail: String,
    overview: {
      content: String,
      contentSi: String,
      climate: String,
      climateSi: String,
      soil: String,
      soilSi: String,
      season: String,
      seasonSi: String,
    },
    diseases: [diseaseSchema],
    treatments: [treatmentSchema],
    bestPractices: [practiceSchema],
    media: {
      videos: [String],
      images: [String],
    },
    isExpertContributed: {
      type: Boolean,
      default: false,
    },
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
    },
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

cropGuideSchema.index({ category: 1 });
cropGuideSchema.index({ title: 'text', titleSi: 'text' });

module.exports = mongoose.model('CropGuide', cropGuideSchema);
