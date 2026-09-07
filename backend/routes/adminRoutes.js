const express = require('express');
const router = express.Router();
const {
  getSystemStats,
  getUsers,
  verifyUser,
  updateUserStatus,
  broadcastNotification,
  getAuditLogs,
  deleteUser,
} = require('../controller/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All admin routes strictly require authentication and Admin role
router.use(protect);
router.use(authorize('Admin'));

router.get('/stats', getSystemStats);
router.get('/users', getUsers);
router.put('/users/:id/verify', verifyUser);
router.put('/users/:id/status', updateUserStatus);
router.delete('/users/:id', deleteUser);
router.post('/broadcast', broadcastNotification);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
