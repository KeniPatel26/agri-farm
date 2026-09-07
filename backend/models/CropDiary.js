const mongoose = require('mongoose');

const cropDiarySchema = new mongoose.Schema(
  {
    cropId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Crop',
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    entryDate: {
      type: Date,
      default: Date.now,
    },
    activityType: {
      type: String,
      enum: ['Irrigation', 'Fertilizer', 'Pesticide', 'Disease Observation', 'Growth Note', 'Harvest', 'Field Activity', 'General'],
      default: 'General',
    },
    notes: {
      type: String,
      required: [true, 'Please add diary notes'],
    },
    irrigationLogged: {
      type: Boolean,
      default: false,
    },
    fertilizerApplied: {
      type: String,
      default: '',
    },
    pesticideApplied: {
      type: String,
      default: '',
    },
    diseasesObserved: {
      type: String,
      default: '',
    },
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },
    photoUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CropDiary', cropDiarySchema);
