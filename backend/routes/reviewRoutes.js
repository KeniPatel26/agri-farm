const express = require('express');
const router = express.Router();
const { addReview, getTargetReviews } = require('../controller/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public read reviews, protected write review
router.get('/:targetId', getTargetReviews);
router.post('/', protect, addReview);

module.exports = router;
