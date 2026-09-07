const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  category: {
    type: String,
  },
  price: {
    type: Number,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit: {
    type: String,
    default: 'kg',
  },
  imageUrl: {
    type: String,
    default: '',
  },
});

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    items: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'Processing', 'Ready', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
    paymentMethod: {
      type: String,
      enum: ['Cash on Delivery', 'Direct Pay / UPI', 'Bank Transfer'],
      default: 'Cash on Delivery',
    },
    deliveryAddress: {
      address: { type: String, required: true },
      village: { type: String, default: '' },
      district: { type: String, default: '' },
      state: { type: String, default: '' },
      phone: { type: String, required: true },
    },
    notes: {
      type: String,
      default: '',
    },
    cancelledReason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Generate unique order number before validation
orderSchema.pre('validate', function (next) {
  if (!this.orderNumber) {
    this.orderNumber = `ORD-${Date.now().toString().slice(-6)}-${Math.floor(100 + Math.random() * 900)}`;
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);
