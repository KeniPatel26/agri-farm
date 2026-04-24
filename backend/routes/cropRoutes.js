const express = require('express');
const router = express.Router();
const { getCrops, addCrop, updateCrop, deleteCrop } = require('../controller/cropController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protection and Farmer role authorization to all crop routes
router.use(protect);
router.use(authorize('Farmer'));

router.route('/')
  .get(getCrops)
  .post(addCrop);

router.route('/:id')
  .put(updateCrop)
  .delete(deleteCrop);

module.exports = router;
