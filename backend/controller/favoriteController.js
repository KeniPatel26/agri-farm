const Favorite = require('../models/Favorite');
const User = require('../models/User');
const Product = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Add a bookmark
// @route   POST /api/v1/favorites
// @access  Private
const addFavorite = async (req, res, next) => {
  try {
    const { targetId, targetType } = req.body;

    if (!targetId || !targetType) {
      return errorResponse(res, 'Please provide targetId and targetType', 400);
    }

    const existing = await Favorite.findOne({ userId: req.user.id, targetId });
    if (existing) {
      return errorResponse(res, 'Item is already bookmarked', 400);
    }

    const fav = await Favorite.create({
      userId: req.user.id,
      targetId,
      targetType
    });

    return successResponse(res, fav, 'Bookmarked successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's favorites
// @route   GET /api/v1/favorites
// @access  Private
const getFavorites = async (req, res, next) => {
  try {
    const favorites = await Favorite.find({ userId: req.user.id });

    // Populate actual details based on targetType
    const populated = await Promise.all(favorites.map(async (fav) => {
      let details = null;
      if (fav.targetType === 'User') {
        details = await User.findById(fav.targetId).select('name email role location');
      } else if (fav.targetType === 'Product') {
        details = await Product.findById(fav.targetId).populate('retailerId', 'name');
      }
      return {
        _id: fav._id,
        targetId: fav.targetId,
        targetType: fav.targetType,
        details,
        createdAt: fav.createdAt
      };
    }));

    // Filter out favorites whose targets might have been deleted from DB
    const activeFavorites = populated.filter(f => f.details !== null);

    return successResponse(res, activeFavorites, 'Bookmarks fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Remove a bookmark
// @route   DELETE /api/v1/favorites/:targetId
// @access  Private
const deleteFavorite = async (req, res, next) => {
  try {
    const { targetId } = req.params;

    const fav = await Favorite.findOne({ userId: req.user.id, targetId });
    if (!fav) {
      return errorResponse(res, 'Bookmark not found', 404);
    }

    await fav.deleteOne();
    return successResponse(res, { targetId }, 'Bookmark removed successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addFavorite,
  getFavorites,
  deleteFavorite,
};
