const express = require('express');
const router = express.Router();
const { getAllCropGuides, getCropGuide, createOrUpdateCropGuide } = require('../controller/advisoryController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getAllCropGuides);
router.get('/:cropName', protect, getCropGuide);
router.post('/', protect, createOrUpdateCropGuide);

module.exports = router;
