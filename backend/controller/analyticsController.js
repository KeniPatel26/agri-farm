const mongoose = require('mongoose');
const PriceHistory = require('../models/PriceHistory');
const Crop = require('../models/Crop');
const MarketPrice = require('../models/MarketPrice');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Farm = require('../models/Farm');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Add price history record
// @route   POST /api/v1/analytics/price
// @access  Private (Trader only)
const addPriceHistory = async (req, res, next) => {
  try {
    const { cropName, price } = req.body;

    if (req.user.role !== 'Trader' && req.user.role !== 'Admin') {
      return errorResponse(res, 'Only traders can add price history', 403);
    }

    const newPrice = await PriceHistory.create({
      cropName: cropName.trim(),
      price: Number(price),
      traderId: req.user._id,
      date: new Date(),
    });

    return successResponse(res, newPrice, 'Price history added successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get price history for a crop (with 7d / 30d trend)
// @route   GET /api/v1/analytics/price/:cropName
// @access  Private
const getPriceHistory = async (req, res, next) => {
  try {
    const { cropName } = req.params;

    const history = await PriceHistory.find({
      cropName: { $regex: new RegExp(`^${cropName}$`, 'i') },
    }).sort({ date: 1 });

    return successResponse(res, history, `Price history for ${cropName} fetched successfully`);
  } catch (error) {
    next(error);
  }
};

// @desc    Get comprehensive farmer expense & crop analytics
// @route   GET /api/v1/analytics/farmer
// @access  Private (Farmer)
const getFarmerAnalytics = async (req, res, next) => {
  try {
    const farmerId = new mongoose.Types.ObjectId(req.user._id);

    const crops = await Crop.find({ farmerId }).populate('farmId', 'name area');
    const farmsCount = await Farm.countDocuments({ farmerId });

    // Calculate aggregated expenses and revenues
    let totalExpense = 0;
    const expenseBreakdown = {
      seeds: 0,
      fertilizer: 0,
      pesticides: 0,
      labor: 0,
      irrigation: 0,
      transport: 0,
      machinery: 0,
      other: 0,
    };

    let totalEstRevenue = 0;
    let totalActualRevenue = 0;
    let totalQuantity = 0;

    const byStage = {
      Planned: 0,
      Growing: 0,
      'Harvest Ready': 0,
      Harvested: 0,
      Sold: 0,
    };

    const cropDistribution = {};

    crops.forEach((c) => {
      const stage = c.stage || 'Growing';
      byStage[stage] = (byStage[stage] || 0) + 1;
      totalQuantity += c.quantity || 0;

      const name = c.cropName || 'Other';
      cropDistribution[name] = (cropDistribution[name] || 0) + 1;

      if (c.expenses) {
        Object.keys(expenseBreakdown).forEach((key) => {
          const val = Number(c.expenses[key]) || 0;
          expenseBreakdown[key] += val;
          totalExpense += val;
        });
      }

      if (c.harvestEstimate) {
        totalEstRevenue += Number(c.harvestEstimate.estRevenue) || 0;
        totalActualRevenue += Number(c.harvestEstimate.actualRevenue) || 0;
      }
    });

    const netProfitEst = totalEstRevenue - totalExpense;
    const netProfitActual = totalActualRevenue - totalExpense;
    const roiPercentage = totalExpense > 0 ? Math.round((netProfitEst / totalExpense) * 100) : 0;

    const summary = {
      totalFarms: farmsCount,
      totalCrops: crops.length,
      totalQuantity,
      byStage,
      cropDistribution: Object.entries(cropDistribution).map(([name, count]) => ({ name, count })),
      financials: {
        totalExpense,
        expenseBreakdown,
        totalEstRevenue,
        totalActualRevenue,
        netProfitEst,
        netProfitActual,
        roiPercentage,
      },
    };

    return successResponse(res, summary, 'Farmer analytics calculated successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get trader analytics
// @route   GET /api/v1/analytics/trader
// @access  Private (Trader)
const getTraderAnalytics = async (req, res, next) => {
  try {
    const traderId = new mongoose.Types.ObjectId(req.user._id);

    const stats = await MarketPrice.aggregate([
      { $match: { traderId } },
      {
        $group: {
          _id: '$cropName',
          count: { $sum: 1 },
          latestPrice: { $last: '$price' },
          avgPrice: { $avg: '$price' },
          totalQuantity: { $sum: '$quantity' },
        },
      },
    ]);

    const latestPrices = await MarketPrice.find({ traderId }).sort({ date: -1 }).limit(8);

    const summary = {
      totalListings: 0,
      cropBreakdown: stats.map((s) => ({
        cropName: s._id,
        count: s.count,
        latestPrice: s.latestPrice,
        avgPrice: Math.round(s.avgPrice),
        totalQuantity: s.totalQuantity,
      })),
      latestPrices,
    };

    stats.forEach((item) => {
      summary.totalListings += item.count;
    });

    return successResponse(res, summary, 'Trader analytics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Get retailer analytics
// @route   GET /api/v1/analytics/retailer
// @access  Private (Retailer)
const getRetailerAnalytics = async (req, res, next) => {
  try {
    const retailerId = new mongoose.Types.ObjectId(req.user._id);

    const products = await Product.find({ retailerId });
    const orders = await Order.find({ retailerId });

    let totalStock = 0;
    let inventoryValue = 0;
    const categoryBreakdown = {};

    products.forEach((p) => {
      totalStock += p.stock || 0;
      inventoryValue += (p.price || 0) * (p.stock || 0);
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });

    let totalRevenue = 0;
    let deliveredOrdersCount = 0;

    orders.forEach((o) => {
      if (o.status === 'Delivered') {
        totalRevenue += o.totalAmount || 0;
        deliveredOrdersCount += 1;
      }
    });

    return successResponse(
      res,
      {
        totalProducts: products.length,
        totalStock,
        inventoryValue,
        totalOrders: orders.length,
        deliveredOrdersCount,
        totalRevenue,
        categoryBreakdown: Object.entries(categoryBreakdown).map(([name, count]) => ({ name, count })),
      },
      'Retailer analytics calculated successfully'
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addPriceHistory,
  getPriceHistory,
  getFarmerAnalytics,
  getTraderAnalytics,
  getRetailerAnalytics,
};
