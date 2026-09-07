const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    enum: ['Fertilizer', 'Pesticide', 'Seeds', 'Equipment', 'Other'],
    default: 'Other',
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: 0,
    default: 0,
  },
  description: {
    type: String,
    trim: true,
  },
  unit: {
    type: String,
    default: 'kg',
  },
  available: {
    type: Boolean,
    default: true,
  },
  imageUrl: {
    type: String,
    required: false,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Product', productSchema);
