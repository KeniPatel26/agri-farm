const mongoose = require('mongoose');

const marketSchema = new mongoose.Schema(
  {
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    marketName: {
      type: String,
      required: [true, 'Please add the market / mandi name'],
      trim: true,
    },
    address: {
      type: String,
      required: [true, 'Please add the market address'],
    },
    district: {
      type: String,
      default: '',
    },
    state: {
      type: String,
      default: '',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        default: [72.5714, 23.0225],
      },
    },
    supportedCrops: {
      type: [String],
      default: ['Wheat', 'Rice', 'Cotton', 'Mustard', 'Soybean', 'Corn'],
    },
    workingHours: {
      type: String,
      default: '8:00 AM - 6:00 PM',
    },
    contactNumber: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

marketSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Market', marketSchema);
