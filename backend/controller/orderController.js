const Order = require('../models/Order');
const Product = require('../models/Product');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Place a new marketplace order (Farmer -> Retailer)
// @route   POST /api/v1/orders
// @access  Private (Farmer)
const createOrder = async (req, res, next) => {
  try {
    const { retailerId, items, deliveryAddress, paymentMethod, notes } = req.body;

    if (!retailerId || !items || !items.length) {
      return errorResponse(res, 'Please provide retailer and ordered items', 400);
    }

    if (!deliveryAddress || !deliveryAddress.address || !deliveryAddress.phone) {
      return errorResponse(res, 'Please provide complete delivery address and contact phone', 400);
    }

    let totalAmount = 0;
    const validatedItems = [];

    // Verify stock and calculate total
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        return errorResponse(res, `Product not found: ${item.name || item.productId}`, 404);
      }

      if (product.stock < item.quantity) {
        return errorResponse(
          res,
          `Insufficient stock for ${product.name}. Available: ${product.stock} ${product.unit}`,
          400
        );
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      validatedItems.push({
        productId: product._id,
        name: product.name,
        category: product.category,
        price: product.price,
        quantity: item.quantity,
        unit: product.unit,
        imageUrl: product.imageUrl || '',
      });

      // Reserve / deduct stock
      product.stock -= item.quantity;
      if (product.stock === 0) {
        product.available = false;
      }
      await product.save();
    }

    const order = await Order.create({
      farmerId: req.user._id,
      retailerId,
      items: validatedItems,
      totalAmount,
      deliveryAddress,
      paymentMethod: paymentMethod || 'Cash on Delivery',
      notes: notes || '',
      status: 'Pending',
    });

    // Notify the retailer of new incoming order
    await Notification.create({
      userId: retailerId,
      title: '📦 New Order Received!',
      message: `Farmer ${req.user.name} placed a new order #${order.orderNumber} worth ₹${totalAmount}.`,
      type: 'ORDER_UPDATE',
      data: { orderId: order._id, orderNumber: order.orderNumber },
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('farmerId', 'name mobile mobileNumber email')
      .populate('retailerId', 'name mobile mobileNumber email address');

    return successResponse(res, populatedOrder, 'Order placed successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get order history for current logged in user (Farmer: their orders, Retailer: their sales)
// @route   GET /api/v1/orders
// @access  Private
const getOrders = async (req, res, next) => {
  try {
    const userRole = (req.user?.role || '').toLowerCase();
    let filter = {};
    if (userRole === 'farmer') {
      filter.farmerId = req.user._id;
    } else if (userRole === 'retailer') {
      filter.retailerId = req.user._id;
    } else if (userRole === 'admin') {
      // Admin sees all
    } else {
      return successResponse(res, [], 'No orders found');
    }

    if (req.query.status) {
      filter.status = req.query.status;
    }

    const orders = await Order.find(filter)
      .populate('farmerId', 'name mobile mobileNumber email')
      .populate('retailerId', 'name mobile mobileNumber email')
      .sort({ createdAt: -1 });

    return successResponse(res, orders, 'Orders retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/v1/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('farmerId', 'name mobile mobileNumber email')
      .populate('retailerId', 'name mobile mobileNumber email');

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    // Auth check
    const isFarmer = order.farmerId._id.toString() === req.user._id.toString();
    const isRetailer = order.retailerId._id.toString() === req.user._id.toString();
    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';

    if (!isFarmer && !isRetailer && !isAdmin) {
      return errorResponse(res, 'Not authorized to view this order', 403);
    }

    return successResponse(res, order, 'Order details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status (Retailer accepts, processes, delivers or rejects)
// @route   PUT /api/v1/orders/:id/status
// @access  Private (Retailer/Admin)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { status, cancelledReason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return errorResponse(res, 'Order not found', 404);
    }

    const isAdmin = (req.user?.role || '').toLowerCase() === 'admin';
    if (order.retailerId.toString() !== req.user._id.toString() && !isAdmin) {
      return errorResponse(res, 'Not authorized to update this order', 403);
    }

    const previousStatus = order.status;
    order.status = status;

    if (status === 'Cancelled' && cancelledReason) {
      order.cancelledReason = cancelledReason;

      // Restore stock on cancellation if not previously cancelled
      if (previousStatus !== 'Cancelled') {
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
            available: true,
          });
        }
      }
    }

    await order.save();

    // Send notification to the Farmer
    const statusMessages = {
      Confirmed: `Your order #${order.orderNumber} has been confirmed by the retailer!`,
      Processing: `Your order #${order.orderNumber} is now being processed and packaged.`,
      Ready: `Your order #${order.orderNumber} is ready for delivery / pickup!`,
      Delivered: `Your order #${order.orderNumber} has been marked as delivered. Thank you!`,
      Cancelled: `Your order #${order.orderNumber} was cancelled. ${cancelledReason ? `Reason: ${cancelledReason}` : ''}`,
    };

    if (statusMessages[status]) {
      await Notification.create({
        userId: order.farmerId,
        title: `Order Status: ${status}`,
        message: statusMessages[status],
        type: 'ORDER_UPDATE',
        data: { orderId: order._id, orderNumber: order.orderNumber, status },
      });
    }

    return successResponse(res, order, `Order status updated to ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
};
