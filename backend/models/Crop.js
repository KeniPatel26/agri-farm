const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    farmId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Farm',
      required: false,
    },
    cropName: {
      type: String,
      required: [true, 'Please add a crop name'],
      trim: true,
    },
    variety: {
      type: String,
      default: '',
      trim: true,
    },
    stage: {
      type: String,
      enum: ['Planned', 'Growing', 'Harvest Ready', 'Harvested', 'Sold'],
      default: 'Growing',
    },
    area: {
      type: Number,
      default: 1,
    },
    areaUnit: {
      type: String,
      enum: ['Acres', 'Hectares', 'Bigha', 'Guntha'],
      default: 'Acres',
    },
    quantity: {
      type: Number,
      required: [true, 'Please add the estimated quantity'],
      min: 0,
    },
    unit: {
      type: String,
      default: 'kg',
    },
    sowingDate: {
      type: Date,
      default: Date.now,
    },
    expectedHarvestDate: {
      type: Date,
    },
    harvestDate: {
      type: Date,
    },
    irrigationMethod: {
      type: String,
      enum: ['Drip Irrigation', 'Sprinkler', 'Canal / Flood', 'Borewell / Tube Well', 'Rainfed', 'Other'],
      default: 'Drip Irrigation',
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Black', 'Red & Yellow', 'Laterite', 'Arid / Desert', 'Saline', 'Clayey / Loamy', 'Other'],
      default: 'Alluvial',
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
        default: 'Farm Location',
      },
    },
    imageUrl: {
      type: String,
      default: '',
    },
    expenses: {
      seeds: { type: Number, default: 0 },
      fertilizer: { type: Number, default: 0 },
      pesticides: { type: Number, default: 0 },
      labor: { type: Number, default: 0 },
      irrigation: { type: Number, default: 0 },
      transport: { type: Number, default: 0 },
      machinery: { type: Number, default: 0 },
      other: { type: Number, default: 0 },
    },
    harvestEstimate: {
      estHarvestDate: { type: Date },
      estProduction: { type: Number, default: 0 },
      actualProduction: { type: Number, default: 0 },
      estRevenue: { type: Number, default: 0 },
      actualRevenue: { type: Number, default: 0 },
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

cropSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Crop', cropSchema);
