const Market = require('../models/Market');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all markets or markets belonging to logged-in trader
// @route   GET /api/v1/markets
// @access  Public / Private
const getMarkets = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.myOnly && req.user) {
      filter.traderId = req.user._id;
    }
    if (req.query.crop) {
      filter.supportedCrops = { $in: [new RegExp(req.query.crop, 'i')] };
    }

    const markets = await Market.find(filter)
      .populate('traderId', 'name mobileNumber verificationStatus')
      .sort({ createdAt: -1 });

    return successResponse(res, markets, 'Markets retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single market by ID
// @route   GET /api/v1/markets/:id
// @access  Public
const getMarketById = async (req, res, next) => {
  try {
    const market = await Market.findById(req.params.id).populate('traderId', 'name mobileNumber verificationStatus');
    if (!market) {
      return errorResponse(res, 'Market not found', 404);
    }
    return successResponse(res, market, 'Market details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new market listing
// @route   POST /api/v1/markets
// @access  Private (Trader/Admin)
const createMarket = async (req, res, next) => {
  try {
    const { marketName, address, district, state, location, supportedCrops, workingHours, contactNumber } = req.body;

    if (!marketName || !address) {
      return errorResponse(res, 'Please provide market name and address', 400);
    }

    let marketLocation = {
      type: 'Point',
      coordinates: [72.5714, 23.0225],
    };

    if (location && location.coordinates && Array.isArray(location.coordinates)) {
      marketLocation = {
        type: 'Point',
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
      };
    }

    const market = await Market.create({
      traderId: req.user._id,
      marketName,
      address,
      district: district || '',
      state: state || '',
      location: marketLocation,
      supportedCrops: supportedCrops || ['Wheat', 'Rice', 'Cotton', 'Mustard', 'Soybean'],
      workingHours: workingHours || '8:00 AM - 6:00 PM',
      contactNumber: contactNumber || req.user.mobileNumber || '',
    });

    return successResponse(res, market, 'Market created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update market
// @route   PUT /api/v1/markets/:id
// @access  Private (Trader owner/Admin)
const updateMarket = async (req, res, next) => {
  try {
    let market = await Market.findById(req.params.id);
    if (!market) {
      return errorResponse(res, 'Market not found', 404);
    }

    if (market.traderId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to update this market', 403);
    }

    market = await Market.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, market, 'Market updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete market
// @route   DELETE /api/v1/markets/:id
// @access  Private (Trader owner/Admin)
const deleteMarket = async (req, res, next) => {
  try {
    const market = await Market.findById(req.params.id);
    if (!market) {
      return errorResponse(res, 'Market not found', 404);
    }

    if (market.traderId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to delete this market', 403);
    }

    await market.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Market deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarkets,
  getMarketById,
  createMarket,
  updateMarket,
  deleteMarket,
};
