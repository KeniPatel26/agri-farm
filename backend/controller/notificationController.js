const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Get user notifications
// @route   GET /api/v1/notifications
// @access  Private
const getNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    return successResponse(res, notifications, 'Notifications fetched successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Create a notification
// @route   POST /api/v1/notifications
// @access  Private
const createNotification = async (req, res, next) => {
  try {
    const { title, message, type, userId, data } = req.body;

    if (!message) {
      return errorResponse(res, 'Please provide notification message', 400);
    }

    const notification = await Notification.create({
      userId: userId || req.user._id,
      title: title || 'AgriConnect Alert',
      message,
      type: type || 'SYSTEM',
      data: data || {},
    });

    return successResponse(res, notification, 'Notification created successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Mark notification as read
// @route   PUT /api/v1/notifications/:id/read
// @access  Private
const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return errorResponse(res, 'Notification not found', 404);
    }

    if (notification.userId.toString() !== req.user._id.toString() && req.user.role !== 'Admin') {
      return errorResponse(res, 'Not authorized', 403);
    }

    notification.read = true;
    await notification.save();

    return successResponse(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

// @desc    Mark all notifications as read
// @route   PUT /api/v1/notifications/read-all
// @access  Private
const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ userId: req.user._id, read: false }, { $set: { read: true } });
    return successResponse(res, null, 'All notifications marked as read');
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all notifications
// @route   DELETE /api/v1/notifications/clear-all
// @access  Private
const clearAllNotifications = async (req, res, next) => {
  try {
    await Notification.deleteMany({ userId: req.user._id });
    return successResponse(res, null, 'All notifications cleared');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
};
