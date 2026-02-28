const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    senderType: {
      type: String,
      required: true,
      enum: ['user', 'expert'],
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      default: 'text',
      enum: ['text', 'image', 'diagnosis', 'prediction'],
    },
    attachmentData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    synced: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for chat message listing (sorted by time)
messageSchema.index({ chatId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
