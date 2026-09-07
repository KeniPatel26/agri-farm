const express = require('express');
const router = express.Router();
const {
  getMyPriceAlerts,
  createPriceAlert,
  togglePriceAlert,
  deletePriceAlert,
} = require('../controller/priceAlertController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getMyPriceAlerts)
  .post(authorize('Farmer', 'Admin'), createPriceAlert);

router
  .route('/:id/toggle')
  .put(authorize('Farmer', 'Admin'), togglePriceAlert);

router
  .route('/:id')
  .delete(authorize('Farmer', 'Admin'), deletePriceAlert);

module.exports = router;
