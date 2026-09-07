const AuditLog = require('../models/AuditLog');

/**
 * Helper to record administrative operations
 */
const logAudit = async ({ req, action, entity, entityId = '', details = '', status = 'SUCCESS' }) => {
  try {
    const adminId = req.user?._id;
    const adminName = req.user?.name || 'Admin';
    const ipAddress = req.ip || req.connection?.remoteAddress || req.headers['x-forwarded-for'] || '127.0.0.1';

    await AuditLog.create({
      adminId,
      adminName,
      action,
      entity,
      entityId: String(entityId),
      details,
      ipAddress,
      status,
    });
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
};

module.exports = { logAudit };
