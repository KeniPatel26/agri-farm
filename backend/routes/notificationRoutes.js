const express = require('express');
const router = express.Router();
const {
  getNotifications,
  createNotification,
  markAsRead,
  markAllAsRead,
  clearAllNotifications,
} = require('../controller/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router
  .route('/')
  .get(getNotifications)
  .post(createNotification);

router.put('/read-all', markAllAsRead);
router.delete('/clear-all', clearAllNotifications);
router.put('/:id/read', markAsRead);

module.exports = router;
