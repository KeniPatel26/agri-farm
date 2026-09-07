const mongoose = require('mongoose');

const priceHistorySchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  traderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('PriceHistory', priceHistorySchema);
