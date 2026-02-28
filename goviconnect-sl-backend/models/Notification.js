const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ['User', 'Expert', 'Shop'],
    },
    type: {
      type: String,
      required: true,
      enum: ['meeting', 'tip', 'guide', 'chat', 'system', 'diagnosis'],
    },
    title: {
      type: String,
      required: true,
    },
    titleSi: String,
    body: {
      type: String,
      required: true,
    },
    bodySi: String,
    read: {
      type: Boolean,
      default: false,
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, read: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
