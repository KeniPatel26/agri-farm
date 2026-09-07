const express = require('express');
const router = express.Router();
const { getCrops, getCropById, addCrop, updateCrop, deleteCrop } = require('../controller/cropController');
const {
  addDiaryEntry,
  getDiaryEntries,
  deleteDiaryEntry,
  updateCropExpenses,
} = require('../controller/cropDiaryController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Apply protection to all crop routes
router.use(protect);

router.route('/')
  .get(getCrops)
  .post(authorize('Farmer', 'Admin'), addCrop);

router.route('/:id')
  .get(getCropById)
  .put(authorize('Farmer', 'Admin'), updateCrop)
  .delete(authorize('Farmer', 'Admin'), deleteCrop);

// Diary & Expense Tracking routes
router.route('/:cropId/diary')
  .post(authorize('Farmer', 'Admin'), addDiaryEntry)
  .get(getDiaryEntries);

router.route('/diary/:id')
  .delete(authorize('Farmer', 'Admin'), deleteDiaryEntry);

router.route('/:cropId/expenses')
  .put(authorize('Farmer', 'Admin'), updateCropExpenses);

module.exports = router;
