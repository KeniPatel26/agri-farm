const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['Bug', 'Complaint', 'Suggestion', 'Report User', 'Report Product', 'Other'],
      default: 'Complaint',
    },
    subject: {
      type: String,
      required: [true, 'Please add a subject / title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide details for this feedback/complaint'],
    },
    targetUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    targetProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Rejected'],
      default: 'Open',
    },
    adminNotes: {
      type: String,
      default: '',
    },
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    resolvedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
