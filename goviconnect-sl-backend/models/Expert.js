const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { SL_DISTRICTS } = require('./User');

const timeSlotSchema = new mongoose.Schema(
  {
    start: { type: String, required: true }, // "09:00"
    end: { type: String, required: true },   // "10:00"
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    day: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true,
    },
    slots: [timeSlotSchema],
  },
  { _id: false }
);

const expertSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 6,
      select: false,
    },
    district: {
      type: String,
      enum: SL_DISTRICTS,
    },
    specialty: {
      type: String,
      required: true,
    },
    specialtySi: {
      type: String,
    },
    avatar: {
      type: String,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalConsultations: {
      type: Number,
      default: 0,
    },
    farmersHelped: {
      type: Number,
      default: 0,
    },
    yearsExperience: {
      type: Number,
      default: 0,
    },
    qualifications: [String],
    specializations: [String],
    bio: String,
    bioSi: String,
    languages: {
      type: [String],
      default: ['English', 'Sinhala'],
    },
    availability: [availabilitySchema],
    settings: {
      notifications: { type: Boolean, default: true },
      language: { type: String, default: 'en', enum: ['en', 'si'] },
    },
    expoPushToken: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
expertSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
expertSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('Expert', expertSchema);
