const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please add a farm name'],
      trim: true,
    },
    area: {
      type: Number,
      required: [true, 'Please specify the farm area'],
      min: 0,
    },
    unit: {
      type: String,
      enum: ['Acres', 'Hectares', 'Bigha', 'Guntha', 'Sq. Meters'],
      default: 'Acres',
    },
    soilType: {
      type: String,
      enum: ['Alluvial', 'Black', 'Red & Yellow', 'Laterite', 'Arid / Desert', 'Saline', 'Clayey / Loamy', 'Other'],
      default: 'Alluvial',
    },
    irrigationType: {
      type: String,
      enum: ['Drip Irrigation', 'Sprinkler', 'Canal / Flood', 'Borewell / Tube Well', 'Rainfed', 'Other'],
      default: 'Drip Irrigation',
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
        default: [72.5714, 23.0225], // Default sample coordinates (e.g. Gujarat/Ahmedabad)
      },
      address: {
        type: String,
        required: [true, 'Please add the farm address / location name'],
      },
      village: {
        type: String,
        default: '',
      },
      district: {
        type: String,
        default: '',
      },
      state: {
        type: String,
        default: '',
      },
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

farmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', farmSchema);
