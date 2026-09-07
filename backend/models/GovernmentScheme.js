const mongoose = require('mongoose');

const governmentSchemeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please add a scheme title'],
      unique: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Direct Income Support', 'Crop Insurance', 'Irrigation Subsidy', 'Organic Farming', 'Machinery Subsidy', 'Credit & Loans', 'Seeds & Fertilizers', 'General'],
      default: 'General',
    },
    coverage: {
      type: String,
      enum: ['Central (All India)', 'State Specific'],
      default: 'Central (All India)',
    },
    state: {
      type: String,
      default: 'All',
    },
    description: {
      type: String,
      required: [true, 'Please add a description'],
    },
    eligibility: {
      type: String,
      required: [true, 'Please add eligibility details'],
    },
    benefits: {
      type: String,
      required: [true, 'Please add benefit details'],
    },
    link: {
      type: String,
      required: [true, 'Please add an external link URL'],
    },
    deadline: {
      type: String,
      default: 'Ongoing / Open Throughout Year',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('GovernmentScheme', governmentSchemeSchema);
