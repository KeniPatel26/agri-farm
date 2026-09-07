const User = require('../models/User');
const Market = require('../models/Market');
const Farm = require('../models/Farm');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Helper to calculate Haversine distance in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
};

// @desc    Update user location
// @route   PUT /api/v1/location/update
// @access  Private
const updateLocation = async (req, res, next) => {
  try {
    const { coordinates, address, village, district, state } = req.body;

    if (!coordinates || coordinates.length !== 2) {
      return errorResponse(res, 'Please provide valid coordinates [lng, lat]', 400);
    }

    const user = await User.findById(req.user._id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.location = {
      type: 'Point',
      coordinates: [Number(coordinates[0]), Number(coordinates[1])],
      address: address || user.location?.address || '',
    };
    if (village) user.village = village;
    if (district) user.district = district;
    if (state) user.state = state;

    const updatedUser = await user.save();

    return successResponse(
      res,
      {
        _id: updatedUser._id,
        name: updatedUser.name,
        location: updatedUser.location,
      },
      'Location updated successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby users (Traders/Retailers/Farmers) with distance calculation
// @route   GET /api/v1/location/nearby
// @access  Private
const getNearbyUsers = async (req, res, next) => {
  try {
    const { lng, lat, role, maxDistance = 100000 } = req.query; // maxDistance in meters, default 100km

    const centerLng = lng ? parseFloat(lng) : req.user.location?.coordinates?.[0] || 72.5714;
    const centerLat = lat ? parseFloat(lat) : req.user.location?.coordinates?.[1] || 23.0225;

    const query = {
      _id: { $ne: req.user._id },
    };

    if (role && role !== 'All') {
      query.role = role;
    }

    const users = await User.find(query).select('-password');

    // Calculate distance and sort by closest
    const withDistance = users.map((u) => {
      const uLng = u.location?.coordinates?.[0] || 72.5714;
      const uLat = u.location?.coordinates?.[1] || 23.0225;
      const dist = calculateDistance(centerLat, centerLng, uLat, uLng);
      return {
        ...u.toObject(),
        distanceKm: dist,
      };
    });

    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    return successResponse(res, withDistance, 'Nearby users fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get nearby markets/mandis
// @route   GET /api/v1/location/nearby-markets
// @access  Private
const getNearbyMarkets = async (req, res, next) => {
  try {
    const { lng, lat } = req.query;
    const centerLng = lng ? parseFloat(lng) : req.user.location?.coordinates?.[0] || 72.5714;
    const centerLat = lat ? parseFloat(lat) : req.user.location?.coordinates?.[1] || 23.0225;

    const markets = await Market.find().populate('traderId', 'name mobileNumber verificationStatus');

    const withDistance = markets.map((m) => {
      const mLng = m.location?.coordinates?.[0] || 72.5714;
      const mLat = m.location?.coordinates?.[1] || 23.0225;
      const dist = calculateDistance(centerLat, centerLng, mLat, mLng);
      return {
        ...m.toObject(),
        distanceKm: dist,
      };
    });

    withDistance.sort((a, b) => a.distanceKm - b.distanceKm);

    return successResponse(res, withDistance, 'Nearby markets fetched successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  updateLocation,
  getNearbyUsers,
  getNearbyMarkets,
};
