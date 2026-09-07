const Farm = require('../models/Farm');
const Crop = require('../models/Crop');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all farms for the logged-in farmer
// @route   GET /api/v1/farms
// @access  Private (Farmer/Admin)
const getMyFarms = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { farmerId: req.user._id };
    const farms = await Farm.find(filter).sort({ createdAt: -1 });
    return successResponse(res, farms, 'Farms retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single farm details with associated crops
// @route   GET /api/v1/farms/:id
// @access  Private
const getFarmById = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return errorResponse(res, 'Farm not found', 404);
    }
    // Security check: only the farm owner or admin
    if (farm.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to view this farm', 403);
    }

    const crops = await Crop.find({ farmId: farm._id });
    return successResponse(res, { farm, crops }, 'Farm details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Create new farm with GPS / Google Maps coordinates
// @route   POST /api/v1/farms
// @access  Private (Farmer)
const createFarm = async (req, res, next) => {
  try {
    const { name, area, unit, soilType, irrigationType, location, notes } = req.body;

    if (!name || !area) {
      return errorResponse(res, 'Please provide farm name and total area', 400);
    }

    // Default coordinates if not explicitly passed
    let farmLocation = {
      type: 'Point',
      coordinates: [72.5714, 23.0225],
      address: 'Farm Location',
    };

    if (location && location.coordinates && Array.isArray(location.coordinates)) {
      farmLocation = {
        type: 'Point',
        coordinates: [Number(location.coordinates[0]), Number(location.coordinates[1])],
        address: location.address || 'Selected Location',
        village: location.village || '',
        district: location.district || '',
        state: location.state || '',
      };
    }

    const farm = await Farm.create({
      farmerId: req.user._id,
      name,
      area: Number(area),
      unit: unit || 'Acres',
      soilType: soilType || 'Alluvial',
      irrigationType: irrigationType || 'Drip Irrigation',
      location: farmLocation,
      notes: notes || '',
    });

    return successResponse(res, farm, 'Farm created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update farm
// @route   PUT /api/v1/farms/:id
// @access  Private (Farmer owner/Admin)
const updateFarm = async (req, res, next) => {
  try {
    let farm = await Farm.findById(req.params.id);
    if (!farm) {
      return errorResponse(res, 'Farm not found', 404);
    }

    if (farm.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to update this farm', 403);
    }

    farm = await Farm.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    return successResponse(res, farm, 'Farm updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete farm
// @route   DELETE /api/v1/farms/:id
// @access  Private (Farmer owner/Admin)
const deleteFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id);
    if (!farm) {
      return errorResponse(res, 'Farm not found', 404);
    }

    if (farm.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to delete this farm', 403);
    }

    await farm.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Farm deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyFarms,
  getFarmById,
  createFarm,
  updateFarm,
  deleteFarm,
};
