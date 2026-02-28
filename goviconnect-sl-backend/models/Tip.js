const mongoose = require('mongoose');

const tipSchema = new mongoose.Schema(
  {
    tipId: {
      type: String,
      unique: true,
    },
    type: {
      type: String,
      default: 'tip',
    },
    title: {
      type: String,
      required: true,
    },
    titleSi: String,
    content: {
      type: String,
      required: true,
    },
    contentSi: String,
    category: {
      type: String,
      enum: ['general', 'watering', 'planting', 'pest_control', 'fertilizing', 'seasonal', 'market', 'technique'],
    },
    crop: String, // null means applies to all
    icon: String,
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Tip', tipSchema);
