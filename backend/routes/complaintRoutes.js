const express = require('express');
const router = express.Router();
const {
  createComplaint,
  getComplaints,
  updateComplaint,
} = require('../controller/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .post(createComplaint)
  .get(getComplaints);

router
  .route('/:id')
  .put(authorize('Admin'), updateComplaint);

module.exports = router;
