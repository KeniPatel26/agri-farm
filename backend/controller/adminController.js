const User = require('../models/User');
const Crop = require('../models/Crop');
const Farm = require('../models/Farm');
const Product = require('../models/Product');
const MarketPrice = require('../models/MarketPrice');
const Order = require('../models/Order');
const Notification = require('../models/Notification');
const Complaint = require('../models/Complaint');
const AuditLog = require('../models/AuditLog');
const { logAudit } = require('../utils/auditLogger');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get system-wide overview statistics
// @route   GET /api/v1/admin/stats
// @access  Private (Admin only)
const getSystemStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const farmersCount = await User.countDocuments({ role: { $in: ['farmer', 'Farmer'] } });
    const tradersCount = await User.countDocuments({ role: { $in: ['trader', 'Trader'] } });
    const retailersCount = await User.countDocuments({ role: { $in: ['retailer', 'Retailer'] } });
    const pendingVerifications = await User.countDocuments({
      role: { $in: ['trader', 'Trader', 'retailer', 'Retailer'] },
      verificationStatus: 'pending',
    });

    const totalFarms = await Farm.countDocuments();
    const totalCrops = await Crop.countDocuments();
    const totalProducts = await Product.countDocuments();
    const totalListings = await MarketPrice.countDocuments();
    const totalOrders = await Order.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'Open' });

    return successResponse(
      res,
      {
        users: {
          total: totalUsers,
          farmers: farmersCount,
          traders: tradersCount,
          retailers: retailersCount,
          pendingVerifications,
        },
        farms: totalFarms,
        crops: totalCrops,
        products: totalProducts,
        listings: totalListings,
        orders: totalOrders,
        complaints: openComplaints,
      },
      'System statistics fetched successfully'
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list with search & filters
// @route   GET /api/v1/admin/users
// @access  Private (Admin only)
const getUsers = async (req, res, next) => {
  try {
    const { role, search, verificationStatus, accountStatus } = req.query;
    const query = {};

    if (role && role !== 'All') {
      query.role = new RegExp(`^${role}$`, 'i');
    }
    if (verificationStatus && verificationStatus !== 'All') {
      query.verificationStatus = verificationStatus;
    }
    if (accountStatus && accountStatus !== 'All') {
      query.accountStatus = accountStatus;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return successResponse(res, users, 'Users list fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Update user verification status (Approve / Reject Trader or Retailer)
// @route   PUT /api/v1/admin/users/:id/verify
// @access  Private (Admin only)
const verifyUser = async (req, res, next) => {
  try {
    const { verificationStatus } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(verificationStatus)) {
      return errorResponse(res, 'Invalid verification status', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    user.verificationStatus = verificationStatus;
    await user.save();

    // Send notification to user
    await Notification.create({
      userId: user._id,
      title: verificationStatus === 'approved' ? '✅ Account Verified!' : '⚠️ Verification Update',
      message:
        verificationStatus === 'approved'
          ? 'Congratulations! Your business profile has been approved and verified by the AgriConnect administration.'
          : 'Your account verification was reviewed and not approved at this time. Please contact support.',
      type: 'VERIFICATION_ALERT',
    });

    await logAudit({
      req,
      action: `Set verification status to ${verificationStatus} for ${user.role} "${user.name}"`,
      entity: 'User',
      entityId: user._id,
      details: `User email: ${user.email}`,
    });

    return successResponse(res, user, `User verification status updated to ${verificationStatus}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Update user account status (active, suspended, blocked)
// @route   PUT /api/v1/admin/users/:id/status
// @access  Private (Admin only)
const updateUserStatus = async (req, res, next) => {
  try {
    const { accountStatus } = req.body;
    if (!['active', 'suspended', 'blocked'].includes(accountStatus)) {
      return errorResponse(res, 'Invalid account status', 400);
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if ((user.role || '').toLowerCase() === 'admin') {
      return errorResponse(res, 'Cannot change status of an Administrator account', 400);
    }

    user.accountStatus = accountStatus;
    await user.save();

    await logAudit({
      req,
      action: `Updated account status to ${accountStatus} for user "${user.name}"`,
      entity: 'User',
      entityId: user._id,
    });

    return successResponse(res, user, `Account status updated to ${accountStatus}`);
  } catch (error) {
    next(error);
  }
};

// @desc    Broadcast notification to users
// @route   POST /api/v1/admin/broadcast
// @access  Private (Admin only)
const broadcastNotification = async (req, res, next) => {
  try {
    const { targetRole, targetUserId, title, message, type } = req.body;

    if (!message) {
      return errorResponse(res, 'Please provide notification message', 400);
    }

    let targetUsers = [];
    if (targetUserId) {
      targetUsers = await User.find({ _id: targetUserId });
    } else if (targetRole && targetRole !== 'All') {
      targetUsers = await User.find({ role: new RegExp(`^${targetRole}$`, 'i') });
    } else {
      targetUsers = await User.find({});
    }

    const notifications = targetUsers.map((u) => ({
      userId: u._id,
      title: title || '📢 Announcement from AgriConnect Admin',
      message,
      type: type || 'ANNOUNCEMENT',
    }));

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await logAudit({
      req,
      action: `Broadcasted notification to ${targetRole || (targetUserId ? 'Single User' : 'All Users')} (${notifications.length} recipients)`,
      entity: 'Notification',
      details: message,
    });

    return successResponse(
      res,
      { count: notifications.length },
      `Notification broadcasted successfully to ${notifications.length} users`
    );
  } catch (error) {
    next(error);
  }
};

// @desc    Get administrative audit logs
// @route   GET /api/v1/admin/audit-logs
// @access  Private (Admin only)
const getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return successResponse(res, logs, 'Audit logs fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Delete user and associated records
// @route   DELETE /api/v1/admin/users/:id
// @access  Private (Admin only)
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(res, 'Cannot delete currently logged in admin user', 400);
    }

    const userRole = (user.role || '').toLowerCase();

    if (userRole === 'admin') {
      return errorResponse(res, 'Cannot delete another admin account', 400);
    }

    // Delete associated data based on role
    if (userRole === 'farmer') {
      await Crop.deleteMany({ farmerId: user._id });
      await Farm.deleteMany({ farmerId: user._id });
      await Order.deleteMany({ farmerId: user._id });
    } else if (userRole === 'trader') {
      await MarketPrice.deleteMany({ traderId: user._id });
    } else if (userRole === 'retailer') {
      await Product.deleteMany({ retailerId: user._id });
      await Order.deleteMany({ retailerId: user._id });
    }

    await user.deleteOne();

    await logAudit({
      req,
      action: `Deleted user "${user.name}" (${user.role}) and associated records`,
      entity: 'User',
      entityId: user._id,
      details: `User email: ${user.email}`,
    });

    return successResponse(res, { id: req.params.id }, 'User and associated records deleted successfully');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSystemStats,
  getUsers,
  verifyUser,
  updateUserStatus,
  broadcastNotification,
  getAuditLogs,
  deleteUser,
};
