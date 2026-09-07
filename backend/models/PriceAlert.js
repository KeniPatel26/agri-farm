const mongoose = require('mongoose');

const priceAlertSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    cropName: {
      type: String,
      required: [true, 'Please specify the crop name for the alert'],
      trim: true,
    },
    targetPrice: {
      type: Number,
      required: [true, 'Please specify the target price threshold'],
      min: 1,
    },
    condition: {
      type: String,
      enum: ['GREATER_THAN_EQUAL', 'LESS_THAN_EQUAL'],
      default: 'GREATER_THAN_EQUAL',
    },
    unit: {
      type: String,
      default: 'Quintal',
    },
    active: {
      type: Boolean,
      default: true,
    },
    lastTriggeredAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

priceAlertSchema.index({ farmerId: 1, cropName: 1 });

module.exports = mongoose.model('PriceAlert', priceAlertSchema);
