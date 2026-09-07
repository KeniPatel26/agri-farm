const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} = require('../controller/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getOrders)
  .post(authorize('Farmer', 'Admin'), createOrder);

router
  .route('/:id')
  .get(getOrderById);

router
  .route('/:id/status')
  .put(authorize('Retailer', 'Admin'), updateOrderStatus);

module.exports = router;
