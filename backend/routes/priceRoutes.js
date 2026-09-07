const express = require('express');
const router = express.Router();
const {
  getMyPrices,
  getAllPrices,
  addPrice,
  updatePrice,
  deletePrice,
} = require('../controller/priceController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

// All authenticated users can browse prices
router.get('/all', getAllPrices);

// Trader-only price management
router.route('/')
  .get(authorize('Trader'), getMyPrices)
  .post(authorize('Trader'), addPrice);

router.route('/:id')
  .put(authorize('Trader'), updatePrice)
  .delete(authorize('Trader'), deletePrice);

module.exports = router;
