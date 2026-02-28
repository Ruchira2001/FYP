const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema(
  {
    participants: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          refPath: 'participants.userModel',
        },
        userModel: {
          type: String,
          required: true,
          enum: ['User', 'Expert'],
        },
        userType: {
          type: String,
          required: true,
          enum: ['farmer', 'expert'],
        },
        name: String,
        avatar: String,
      },
    ],
    lastMessage: {
      type: String,
      default: '',
    },
    lastMessageTime: {
      type: Date,
      default: Date.now,
    },
    lastMessageType: {
      type: String,
      default: 'text',
      enum: ['text', 'image', 'diagnosis', 'prediction'],
    },
    unreadCount: {
      type: Map,
      of: Number,
      default: {},
    },
    hasActiveDiagnosis: {
      type: Boolean,
      default: false,
    },
    cropTags: [String],
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
chatSchema.index({ 'participants.userId': 1 });
chatSchema.index({ lastMessageTime: -1 });

module.exports = mongoose.model('Chat', chatSchema);
