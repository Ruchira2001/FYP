const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema(
  {
    expertId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Expert',
      required: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    expertName: String,
    expertAvatar: String,
    farmerName: String,
    farmerDistrict: String,
    type: {
      type: String,
      enum: ['group', 'personal'],
      default: 'personal',
    },
    topic: {
      type: String,
      required: [true, 'Meeting topic is required'],
    },
    topicSi: String,
    description: String,
    descriptionSi: String,
    sessionTitle: String,
    sessionTitleSi: String,
    dateTime: {
      type: Date,
      required: [true, 'Meeting date/time is required'],
    },
    duration: {
      type: Number,
      default: 30, // minutes
    },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'completed', 'cancelled'],
      default: 'pending',
    },
    notes: String,
    meetingLink: String,
    reminderSet: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['scheduled', 'chat_booking'],
      default: 'scheduled',
    },
    attendees: {
      type: Number,
      default: 0,
    },
    maxAttendees: {
      type: Number,
      default: 50,
    },
    registeredUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

meetingSchema.index({ expertId: 1, dateTime: 1 });
meetingSchema.index({ farmerId: 1, dateTime: 1 });
meetingSchema.index({ type: 1, dateTime: 1 });

module.exports = mongoose.model('Meeting', meetingSchema);
