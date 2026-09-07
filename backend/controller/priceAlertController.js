const PriceAlert = require('../models/PriceAlert');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get all price alerts for logged in farmer
// @route   GET /api/v1/price-alerts
// @access  Private (Farmer)
const getMyPriceAlerts = async (req, res, next) => {
  try {
    const alerts = await PriceAlert.find({ farmerId: req.user._id }).sort({ createdAt: -1 });
    return successResponse(res, alerts, 'Price alerts retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new price alert subscription
// @route   POST /api/v1/price-alerts
// @access  Private (Farmer)
const createPriceAlert = async (req, res, next) => {
  try {
    const { cropName, targetPrice, unit, condition } = req.body;

    if (!cropName || !targetPrice) {
      return errorResponse(res, 'Please provide crop name and target price', 400);
    }

    // Check if alert already exists for this crop
    let alert = await PriceAlert.findOne({
      farmerId: req.user._id,
      cropName: new RegExp(`^${cropName.trim()}$`, 'i'),
    });

    if (alert) {
      alert.targetPrice = Number(targetPrice);
      alert.active = true;
      if (unit) alert.unit = unit;
      await alert.save();
      return successResponse(res, alert, 'Price alert updated successfully');
    }

    alert = await PriceAlert.create({
      farmerId: req.user._id,
      cropName: cropName.trim(),
      targetPrice: Number(targetPrice),
      unit: unit || 'Quintal',
      condition: condition || 'GREATER_THAN_EQUAL',
      active: true,
    });

    return successResponse(res, alert, 'Price alert created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle alert status (active/inactive)
// @route   PUT /api/v1/price-alerts/:id/toggle
// @access  Private (Farmer)
const togglePriceAlert = async (req, res, next) => {
  try {
    const alert = await PriceAlert.findById(req.params.id);
    if (!alert) {
      return errorResponse(res, 'Price alert not found', 404);
    }

    if (alert.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    alert.active = !alert.active;
    await alert.save();

    return successResponse(res, alert, `Price alert ${alert.active ? 'activated' : 'paused'}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete price alert
// @route   DELETE /api/v1/price-alerts/:id
// @access  Private (Farmer)
const deletePriceAlert = async (req, res, next) => {
  try {
    const alert = await PriceAlert.findById(req.params.id);
    if (!alert) {
      return errorResponse(res, 'Price alert not found', 404);
    }

    if (alert.farmerId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    await alert.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Price alert deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPriceAlerts,
  createPriceAlert,
  togglePriceAlert,
  deletePriceAlert,
};
