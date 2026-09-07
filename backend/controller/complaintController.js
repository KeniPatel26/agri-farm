const Complaint = require('../models/Complaint');
const { logAudit } = require('../utils/auditLogger');
const { successResponse, errorResponse } = require('../utils/responseHandler');

// @desc    Submit new complaint / bug / feedback
// @route   POST /api/v1/complaints
// @access  Private
const createComplaint = async (req, res, next) => {
  try {
    const { type, subject, description, targetUserId, targetProductId } = req.body;

    if (!subject || !description) {
      return errorResponse(res, 'Please provide subject and description', 400);
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      type: type || 'Complaint',
      subject: subject.trim(),
      description: description.trim(),
      targetUserId: targetUserId || null,
      targetProductId: targetProductId || null,
      status: 'Open',
    });

    return successResponse(res, complaint, 'Feedback/Complaint submitted successfully', 201);
  } catch (error) {
    next(error);
  }
};

// @desc    Get complaints (User sees their own, Admin sees all)
// @route   GET /api/v1/complaints
// @access  Private
const getComplaints = async (req, res, next) => {
  try {
    const filter = req.user.role === 'Admin' ? {} : { userId: req.user._id };
    if (req.query.status && req.user.role === 'Admin') {
      filter.status = req.query.status;
    }

    const complaints = await Complaint.find(filter)
      .populate('userId', 'name email role mobileNumber')
      .populate('targetUserId', 'name role')
      .populate('targetProductId', 'name')
      .sort({ createdAt: -1 });

    return successResponse(res, complaints, 'Complaints retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// @desc    Admin updates complaint status and resolution notes
// @route   PUT /api/v1/complaints/:id
// @access  Private (Admin only)
const updateComplaint = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return errorResponse(res, 'Complaint not found', 404);
    }

    if (status) complaint.status = status;
    if (adminNotes !== undefined) complaint.adminNotes = adminNotes;
    if (status === 'Resolved' || status === 'Rejected') {
      complaint.resolvedBy = req.user._id;
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    await logAudit({
      req,
      action: `Updated Complaint #${complaint._id} status to ${status}`,
      entity: 'Complaint',
      entityId: complaint._id,
      details: adminNotes || '',
    });

    return successResponse(res, complaint, `Complaint marked as ${status}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getComplaints,
  updateComplaint,
};
