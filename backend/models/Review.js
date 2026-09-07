const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  reviewerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  targetType: {
    type: String,
    required: true,
    enum: ['User', 'Product'],
  },
  rating: {
    type: Number,
    required: [true, 'Please add a rating (1-5)'],
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
  }
}, {
  timestamps: true,
});

// Compound index so a user can review a specific target only once
reviewSchema.index({ reviewerId: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
