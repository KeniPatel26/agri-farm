const mongoose = require('mongoose');

const cropGuideSchema = new mongoose.Schema(
  {
    cropName: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    scientificName: {
      type: String,
      default: '',
    },
    soilRequirement: {
      type: String,
      default: 'Well-drained loamy or clay loam soil with rich organic content.',
    },
    temperature: {
      type: String, // e.g. "15°C - 30°C"
      default: '20°C - 30°C',
    },
    waterRequirement: {
      type: String,
      default: 'Moderate water requirement. Regular irrigation at critical growth stages.',
    },
    irrigation: {
      type: String,
      required: true,
    },
    fertilizers: {
      type: [String],
      required: true,
    },
    pestManagement: {
      type: [String],
      default: ['Regular scouting', 'Neem oil spray (1500 ppm)', 'Recommended biological controls'],
    },
    diseasePrevention: {
      type: [String],
      default: ['Use certified disease-free seeds', 'Crop rotation', 'Avoid waterlogging'],
    },
    harvestInformation: {
      type: String,
      default: 'Harvest when the crop matures and moisture level reaches optimal standards.',
    },
    precautions: {
      type: [String],
      default: [],
    },
    imageUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CropGuide', cropGuideSchema);
