const express = require('express');
const router = express.Router();
const {
  getMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
} = require('../controller/marketController');
const { protect, authorize } = require('../middleware/authMiddleware');

router
  .route('/')
  .get(getMarkets)
  .post(protect, authorize('Trader', 'Admin'), createMarket);

router
  .route('/:id')
  .get(getMarketById)
  .put(protect, authorize('Trader', 'Admin'), updateMarket)
  .delete(protect, authorize('Trader', 'Admin'), deleteMarket);

module.exports = router;
