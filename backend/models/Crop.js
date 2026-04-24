const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  farmerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  cropName: {
    type: String,
    required: [true, 'Please add a crop name'],
  },
  stage: {
    type: String,
    enum: ['Planting', 'Growing', 'Harvesting', 'Sold'],
    default: 'Growing',
    required: true,
  },
  quantity: {
    type: Number,
    required: [true, 'Please add the estimated quantity (e.g., in kg)'],
  },
  location: {
    type: String,
    required: [true, 'Please add the farm location'],
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Crop', cropSchema);
