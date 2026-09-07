const Review = require('../models/Review');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Post a review/rating
// @route   POST /api/v1/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { targetId, targetType, rating, comment } = req.body;

    if (!targetId || !targetType || !rating || !comment) {
      return errorResponse(res, 'Please provide all required review fields', 400);
    }

    if (rating < 1 || rating > 5) {
      return errorResponse(res, 'Rating must be an integer between 1 and 5', 400);
    }

    // Check if user already reviewed this target
    const existing = await Review.findOne({ reviewerId: req.user.id, targetId });
    if (existing) {
      return errorResponse(res, 'You have already reviewed this item/user', 400);
    }

    const review = await Review.create({
      reviewerId: req.user.id,
      targetId,
      targetType,
      rating: Number(rating),
      comment
    });

    // Populate user name of reviewer
    const populated = await review.populate('reviewerId', 'name role');

    return successResponse(res, populated, 'Review added successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all reviews and metrics for a specific target
// @route   GET /api/v1/reviews/:targetId
// @access  Public
const getTargetReviews = async (req, res, next) => {
  try {
    const { targetId } = req.params;

    const reviews = await Review.find({ targetId })
      .populate('reviewerId', 'name role')
      .sort({ createdAt: -1 });

    // Calculate rating metrics
    const totalReviews = reviews.length;
    const averageRating = totalReviews > 0
      ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 0;

    return successResponse(res, {
      reviews,
      totalReviews,
      averageRating
    }, 'Reviews fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addReview,
  getTargetReviews,
};
