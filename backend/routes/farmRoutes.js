const express = require('express');
const router = express.Router();
const {
  getMyFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
} = require('../controller/farmController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getMyFarms)
  .post(authorize('Farmer', 'Admin'), createFarm);

router
  .route('/:id')
  .get(getFarmById)
  .put(authorize('Farmer', 'Admin'), updateFarm)
  .delete(authorize('Farmer', 'Admin'), deleteFarm);

module.exports = router;
