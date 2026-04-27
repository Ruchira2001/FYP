const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  cropId: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  nameSi: String,
  scientificName: String,
  category: {
    type: String,
    required: true,
    enum: ['vegetables', 'fruits', 'tea', 'paddy', 'spices'],
  },
  icon: String,
  color: String,
});

module.exports = mongoose.model('Crop', cropSchema);
