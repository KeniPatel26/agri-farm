const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      default: 'AgriConnect Alert',
    },
    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['PRICE_ALERT', 'WEATHER_ALERT', 'ORDER_UPDATE', 'LOW_STOCK', 'SYSTEM', 'ANNOUNCEMENT', 'VERIFICATION_ALERT'],
      default: 'SYSTEM',
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

notificationSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
