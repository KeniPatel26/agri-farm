const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get crops for logged in farmer (optionally filtered by farmId)
// @route   GET /api/v1/crops
// @access  Private
const getCrops = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { farmerId: req.user._id };
    if (req.query.farmId) {
      filter.farmId = req.query.farmId;
    }

    const crops = await Crop.find(filter)
      .populate('farmId', 'name area unit location')
      .sort({ createdAt: -1 });

    return successResponse(res, crops, 'Crops fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get single crop
// @route   GET /api/v1/crops/:id
// @access  Private
const getCropById = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id).populate('farmId');
    if (!crop) {
      return errorResponse(res, 'Crop not found', 404);
    }
    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to view this crop', 403);
    }
    return successResponse(res, crop, 'Crop details retrieved');
  } catch (error) {
    next(error);
  }
};

// @desc    Add a new crop
// @route   POST /api/v1/crops
// @access  Private (Farmer)
const addCrop = async (req, res, next) => {
  try {
    const {
      cropName,
      variety,
      farmId,
      stage,
      area,
      areaUnit,
      quantity,
      unit,
      sowingDate,
      expectedHarvestDate,
      irrigationMethod,
      soilType,
      location,
      imageUrl,
      expenses,
      harvestEstimate,
      notes,
    } = req.body;

    if (!cropName || !quantity) {
      return errorResponse(res, 'Please provide crop name and quantity', 400);
    }

    // If farmId is provided, pull location & soil info from Farm if not explicitly passed
    let cropLocation = location;
    let cropSoil = soilType;
    let cropIrrigation = irrigationMethod;

    if (farmId) {
      const farm = await Farm.findById(farmId);
      if (farm) {
        if (!cropLocation || !cropLocation.coordinates) {
          cropLocation = farm.location;
        }
        if (!cropSoil) cropSoil = farm.soilType;
        if (!cropIrrigation) cropIrrigation = farm.irrigationType;
      }
    }

    // Default fallback coordinates if needed
    if (!cropLocation || !cropLocation.coordinates) {
      cropLocation = {
        type: 'Point',
        coordinates: [72.5714, 23.0225],
        address: 'Farm Field',
      };
    }

    const crop = await Crop.create({
      farmerId: req.user._id,
      farmId: farmId || null,
      cropName,
      variety: variety || '',
      stage: stage || 'Growing',
      area: area ? Number(area) : 1,
      areaUnit: areaUnit || 'Acres',
      quantity: Number(quantity),
      unit: unit || 'kg',
      sowingDate: sowingDate || Date.now(),
      expectedHarvestDate: expectedHarvestDate || null,
      irrigationMethod: cropIrrigation || 'Drip Irrigation',
      soilType: cropSoil || 'Alluvial',
      location: cropLocation,
      imageUrl: imageUrl || '',
      expenses: expenses || {},
      harvestEstimate: harvestEstimate || {},
      notes: notes || '',
    });

    const populated = await Crop.findById(crop._id).populate('farmId', 'name area unit');
    return successResponse(res, populated, 'Crop added successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update crop (status, lifecycle, expenses, notes)
// @route   PUT /api/v1/crops/:id
// @access  Private
const updateCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return errorResponse(res, 'Crop not found', 404);
    }

    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'User not authorized', 403);
    }

    const updatedCrop = await Crop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('farmId', 'name area unit');

    return successResponse(res, updatedCrop, 'Crop updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete crop
// @route   DELETE /api/v1/crops/:id
// @access  Private
const deleteCrop = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return errorResponse(res, 'Crop not found', 404);
    }

    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'User not authorized', 403);
    }

    await crop.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Crop deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCrops,
  getCropById,
  addCrop,
  updateCrop,
  deleteCrop,
};
