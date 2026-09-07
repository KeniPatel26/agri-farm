const express = require('express');
const router = express.Router();
const { getSchemes, createScheme } = require('../controller/schemeController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/', getSchemes);
router.post('/', protect, authorize('Admin'), createScheme);

module.exports = router;
