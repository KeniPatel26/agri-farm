const CropDiary = require('../models/CropDiary');
const Crop = require('../models/Crop');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Add a diary entry for a crop
// @route   POST /api/v1/crops/:cropId/diary
// @access  Private (Farmer only)
const addDiaryEntry = async (req, res, next) => {
  try {
    const {
      notes,
      activityType,
      entryDate,
      irrigationLogged,
      fertilizerApplied,
      pesticideApplied,
      diseasesObserved,
      cost,
      photoUrl,
    } = req.body;

    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return errorResponse(res, 'Crop not found', 404);
    }

    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to log activities for this crop', 403);
    }

    if (!notes) {
      return errorResponse(res, 'Please add notes for this entry', 400);
    }

    const entry = await CropDiary.create({
      cropId: req.params.cropId,
      farmerId: req.user._id,
      activityType: activityType || 'General',
      entryDate: entryDate || Date.now(),
      notes,
      irrigationLogged: !!irrigationLogged,
      fertilizerApplied: fertilizerApplied || '',
      pesticideApplied: pesticideApplied || '',
      diseasesObserved: diseasesObserved || '',
      cost: cost ? Number(cost) : 0,
      photoUrl: photoUrl || '',
    });

    return successResponse(res, entry, 'Diary entry added successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get all diary entries for a crop
// @route   GET /api/v1/crops/:cropId/diary
// @access  Private
const getDiaryEntries = async (req, res, next) => {
  try {
    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return errorResponse(res, 'Crop not found', 404);
    }

    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to view logs for this crop', 403);
    }

    const entries = await CropDiary.find({ cropId: req.params.cropId }).sort({ entryDate: -1 });
    return successResponse(res, entries, 'Crop diary entries fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a diary entry
// @route   DELETE /api/v1/crops/diary/:id
// @access  Private (Farmer only)
const deleteDiaryEntry = async (req, res, next) => {
  try {
    const entry = await CropDiary.findById(req.params.id);
    if (!entry) {
      return errorResponse(res, 'Diary entry not found', 404);
    }

    if (entry.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to delete this diary entry', 403);
    }

    await entry.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Diary entry deleted successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update crop expenses, revenue, and harvest estimates
// @route   PUT /api/v1/crops/:cropId/expenses
// @access  Private (Farmer only)
const updateCropExpenses = async (req, res, next) => {
  try {
    const { expenses, harvestEstimate } = req.body;
    const crop = await Crop.findById(req.params.cropId);

    if (!crop) {
      return errorResponse(res, 'Crop not found', 404);
    }

    if (crop.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized to modify this crop', 403);
    }

    if (expenses) {
      crop.expenses = {
        seeds: Number(expenses.seeds) || 0,
        fertilizer: Number(expenses.fertilizer) || 0,
        pesticides: Number(expenses.pesticides) || 0,
        labor: Number(expenses.labor) || 0,
        irrigation: Number(expenses.irrigation) || 0,
        transport: Number(expenses.transport) || 0,
        machinery: Number(expenses.machinery) || 0,
        other: Number(expenses.other) || 0,
      };
    }

    if (harvestEstimate) {
      crop.harvestEstimate = {
        estHarvestDate: harvestEstimate.estHarvestDate || crop.harvestEstimate?.estHarvestDate,
        estProduction: Number(harvestEstimate.estProduction) || 0,
        actualProduction: Number(harvestEstimate.actualProduction) || 0,
        estRevenue: Number(harvestEstimate.estRevenue) || 0,
        actualRevenue: Number(harvestEstimate.actualRevenue) || 0,
      };
    }

    const updated = await crop.save();
    return successResponse(res, updated, 'Crop expenses and forecasts updated successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addDiaryEntry,
  getDiaryEntries,
  deleteDiaryEntry,
  updateCropExpenses,
};
