const MarketPrice = require('../models/MarketPrice');
const PriceHistory = require('../models/PriceHistory');
const PriceAlert = require('../models/PriceAlert');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// Helper to trigger price alerts for farmers
const checkAndTriggerPriceAlerts = async (cropName, price, marketName) => {
  try {
    const alerts = await PriceAlert.find({
      cropName: new RegExp(`^${cropName}$`, 'i'),
      active: true,
      targetPrice: { $lte: Number(price) },
    });

    for (const alert of alerts) {
      await Notification.create({
        userId: alert.farmerId,
        title: `🌾 Price Alert: ${cropName} Reached Target!`,
        message: `Great news! ${cropName} is now trading at ₹${price}/${alert.unit} at ${marketName}, reaching or exceeding your target price of ₹${alert.targetPrice}/${alert.unit}.`,
        type: 'PRICE_ALERT',
        data: { cropName, price, marketName, targetPrice: alert.targetPrice },
      });

      alert.lastTriggeredAt = new Date();
      await alert.save();
    }
  } catch (err) {
    console.error('Error triggering price alerts:', err.message);
  }
};

// @desc    Get all market prices posted by logged-in trader
// @route   GET /api/v1/prices
// @access  Private (Trader/Admin)
const getMyPrices = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { traderId: req.user._id };
    const prices = await MarketPrice.find(filter)
      .populate('marketId', 'marketName address district state')
      .sort({ createdAt: -1 });
    return successResponse(res, prices, "Trader's posted prices fetched successfully");
  } catch (error) {
    next(error);
  }
};

// @desc    Get all market prices (public / farmer browse with filters)
// @route   GET /api/v1/prices/all
// @access  Private
const getAllPrices = async (req, res, next) => {
  try {
    const { cropName, search, district, state, sort } = req.query;
    const query = {};

    if (cropName && cropName !== 'All') {
      query.cropName = { $regex: cropName, $options: 'i' };
    }
    if (district) {
      query.marketName = { $regex: district, $options: 'i' };
    }
    if (search) {
      query.$or = [
        { cropName: { $regex: search, $options: 'i' } },
        { marketName: { $regex: search, $options: 'i' } },
        { variety: { $regex: search, $options: 'i' } },
      ];
    }

    let sortOption = { date: -1 };
    if (sort === 'price-low') sortOption = { price: 1 };
    if (sort === 'price-high') sortOption = { price: -1 };

    const prices = await MarketPrice.find(query)
      .populate('traderId', 'name mobileNumber verificationStatus location')
      .populate('marketId')
      .sort(sortOption);

    return successResponse(res, prices, 'All market prices fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Add a market price entry
// @route   POST /api/v1/prices
// @access  Private (Trader)
const addPrice = async (req, res, next) => {
  try {
    const { cropName, marketName, marketId, price, quantity, unit, variety, grade, location, notes } = req.body;

    if (!cropName || !marketName || price === undefined) {
      return errorResponse(res, 'Please provide crop name, market name, and price', 400);
    }

    const priceEntry = await MarketPrice.create({
      traderId: req.user._id,
      marketId: marketId || null,
      cropName: cropName.trim(),
      variety: variety || 'Standard',
      grade: grade || 'Grade A (Premium)',
      marketName: marketName.trim(),
      price: Number(price),
      quantity: quantity ? Number(quantity) : 0,
      unit: unit || 'Quintal',
      location: location || { type: 'Point', coordinates: [72.5714, 23.0225] },
      notes: notes || '',
      date: new Date(),
    });

    // Record in price history for trend analytics
    await PriceHistory.create({
      cropName: cropName.trim(),
      price: Number(price),
      traderId: req.user._id,
      date: new Date(),
    });

    // Asynchronously trigger automated notifications to subscribed farmers
    checkAndTriggerPriceAlerts(cropName.trim(), Number(price), marketName.trim());

    return successResponse(res, priceEntry, 'Price entry added successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Update a market price
// @route   PUT /api/v1/prices/:id
// @access  Private (Trader)
const updatePrice = async (req, res, next) => {
  try {
    const priceEntry = await MarketPrice.findById(req.params.id);

    if (!priceEntry) {
      return errorResponse(res, 'Price entry not found', 404);
    }

    if (priceEntry.traderId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    const updated = await MarketPrice.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    // If price increased, check alerts
    if (req.body.price && Number(req.body.price) > priceEntry.price) {
      checkAndTriggerPriceAlerts(updated.cropName, Number(updated.price), updated.marketName);
    }

    return successResponse(res, updated, 'Price entry updated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a market price
// @route   DELETE /api/v1/prices/:id
// @access  Private (Trader)
const deletePrice = async (req, res, next) => {
  try {
    const priceEntry = await MarketPrice.findById(req.params.id);

    if (!priceEntry) {
      return errorResponse(res, 'Price entry not found', 404);
    }

    if (priceEntry.traderId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    await priceEntry.deleteOne();
    return successResponse(res, { id: req.params.id }, 'Price entry deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyPrices,
  getAllPrices,
  addPrice,
  updatePrice,
  deletePrice,
};
