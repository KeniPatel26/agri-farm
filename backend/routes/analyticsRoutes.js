const express = require('express');
const router = express.Router();
const {
  addPriceHistory,
  getPriceHistory,
  getFarmerAnalytics,
  getTraderAnalytics,
  getRetailerAnalytics,
} = require('../controller/analyticsController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/price', protect, addPriceHistory);
router.get('/price/:cropName', protect, getPriceHistory);
router.get('/farmer', protect, authorize('Farmer', 'Admin'), getFarmerAnalytics);
router.get('/trader', protect, authorize('Trader', 'Admin'), getTraderAnalytics);
router.get('/retailer', protect, authorize('Retailer', 'Admin'), getRetailerAnalytics);

module.exports = router;
