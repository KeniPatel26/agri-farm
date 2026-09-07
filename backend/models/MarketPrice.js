const mongoose = require('mongoose');

const marketPriceSchema = new mongoose.Schema(
  {
    traderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    marketId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Market',
    },
    cropName: {
      type: String,
      required: [true, 'Please add a crop name'],
      trim: true,
    },
    variety: {
      type: String,
      default: 'Standard',
      trim: true,
    },
    grade: {
      type: String,
      enum: ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair)', 'FAQ (Fair Average Quality)'],
      default: 'Grade A (Premium)',
    },
    marketName: {
      type: String,
      required: [true, 'Please add the market name'],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, 'Please add the price'],
      min: 0,
    },
    quantity: {
      type: Number,
      default: 0,
      min: 0,
    },
    unit: {
      type: String,
      default: 'Quintal',
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
      address: {
        type: String,
        default: '',
      },
    },
    date: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

marketPriceSchema.index({ location: '2dsphere' });
marketPriceSchema.index({ cropName: 1, date: -1 });

module.exports = mongoose.model('MarketPrice', marketPriceSchema);
