const Complaint = require("../models/complaint");

// Get all complaints
const getAllComplaints = async (req, res) => {
  try {
    const { status, priority, category, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get complaints with pagination and filtering
    const complaints = await Complaint.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    // Get total count for pagination
    const total = await Complaint.countDocuments(filter);

    console.log(`📋 GET /api/complaints - returning ${complaints.length} complaints`);
    
    res.json({
      success: true,
      data: complaints,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalComplaints: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error getting complaints:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaints',
      message: error.message
    });
  }
};

// Get single complaint by ID
const getComplaintById = async (req, res) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findById(id).select('-__v');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }

    console.log(`📋 GET /api/complaints/${id} - returning complaint: ${complaint.ticketRef}`);
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error getting complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaint',
      message: error.message
    });
  }
};

// Get complaint by ticket reference - THIS WAS MISSING!
const getComplaintByTicketRef = async (req, res) => {
  try {
    const { ticketRef } = req.params;
    const complaint = await Complaint.findOne({ ticketRef }).select('-__v');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found with this ticket reference'
      });
    }

    console.log(`📋 GET /api/complaints/ticket/${ticketRef} - found complaint`);
    
    res.json({
      success: true,
      data: complaint
    });
  } catch (error) {
    console.error('Error getting complaint by ticket ref:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaint',
      message: error.message
    });
  }
};

// Create new complaint
const createComplaint = async (req, res) => {
  try {
    const { customerName, email, issue, category, priority } = req.body;
    
    // Validate required fields
    if (!customerName || !email || !issue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['customerName', 'email', 'issue']
      });
    }

    // Create new complaint
    const newComplaint = new Complaint({
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      issue: issue.trim(),
      category: category || 'general',
      priority: priority || 'medium'
    });
    
    const savedComplaint = await newComplaint.save();
    
    console.log(`✅ Created new complaint: ${savedComplaint.ticketRef}`);
    
    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      data: savedComplaint
    });
  } catch (error) {
    console.error('Error creating complaint:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create complaint',
      message: error.message
    });
  }
};

// Update complaint
const updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated by users
    delete updates.ticketRef;
    delete updates.createdAt;
    delete updates.updatedAt;
    
    // Handle status change to resolved - auto-set resolvedAt
    if (updates.status === 'resolved' && !updates.resolvedAt) {
      updates.resolvedAt = new Date();
    } else if (updates.status !== 'resolved') {
      updates.resolvedAt = null;
    }
    
    // Validate assignedTo field (admin name)
    if (updates.assignedTo) {
      updates.assignedTo = updates.assignedTo.trim();
      if (updates.assignedTo.length > 100) {
        return res.status(400).json({
          success: false,
          error: 'Admin name cannot exceed 100 characters'
        });
      }
    }
    
    // Validate resolution field (admin solution)
    if (updates.resolution) {
      updates.resolution = updates.resolution.trim();
      if (updates.resolution.length > 500) {
        return res.status(400).json({
          success: false,
          error: 'Resolution cannot exceed 500 characters'
        });
      }
    }
    
    const complaint = await Complaint.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-__v');
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }
    
    console.log(`✅ Updated complaint: ${complaint.ticketRef}`);
    console.log(`📝 Updates applied:`, {
      status: updates.status,
      assignedTo: updates.assignedTo,
      resolution: updates.resolution ? 'Resolution added' : 'No resolution',
      resolvedAt: updates.resolvedAt ? 'Auto-set' : 'Not resolved'
    });
    
    res.json({
      success: true,
      message: 'Complaint updated successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error updating complaint:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update complaint',
      message: error.message
    });
  }
};

// Resolve complaint with solution
const resolveComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution, assignedTo } = req.body;
    
    if (!resolution || resolution.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resolution/solution description is required'
      });
    }
    
    const complaint = await Complaint.findById(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }
    
    // Update complaint with resolution
    complaint.status = 'resolved';
    complaint.resolution = resolution.trim();
    complaint.resolvedAt = new Date();
    
    if (assignedTo && assignedTo.trim()) {
      complaint.assignedTo = assignedTo.trim();
    }
    
    const resolvedComplaint = await complaint.save();
    
    console.log(`✅ Resolved complaint: ${resolvedComplaint.ticketRef}`);
    console.log(`👨‍💼 Assigned to: ${resolvedComplaint.assignedTo || 'Not assigned'}`);
    console.log(`📝 Solution provided: ${resolution.substring(0, 50)}...`);
    
    res.json({
      success: true,
      message: 'Complaint resolved successfully',
      data: resolvedComplaint
    });
  } catch (error) {
    console.error('Error resolving complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to resolve complaint',
      message: error.message
    });
  }
};

// Delete complaint
const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    
    const complaint = await Complaint.findByIdAndDelete(id);
    
    if (!complaint) {
      return res.status(404).json({
        success: false,
        error: 'Complaint not found'
      });
    }
    
    console.log(`🗑️ Deleted complaint: ${complaint.ticketRef}`);
    console.log(`📊 Complaint details:`, {
      customer: complaint.customerName,
      email: complaint.email,
      status: complaint.status,
      assignedTo: complaint.assignedTo || 'Not assigned',
      resolvedAt: complaint.resolvedAt || 'Not resolved'
    });
    
    res.json({
      success: true,
      message: 'Complaint deleted successfully',
      data: complaint
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete complaint',
      message: error.message
    });
  }
};

// Get complaint statistics
const getComplaintStatistics = async (req, res) => {
  try {
    // Calculate basic statistics
    const totalComplaints = await Complaint.countDocuments();
    const openComplaints = await Complaint.countDocuments({ status: 'open' });
    const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
    const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });
    const assignedComplaints = await Complaint.countDocuments({ assignedTo: { $exists: true, $ne: null } });
    const unassignedComplaints = await Complaint.countDocuments({ 
      $or: [
        { assignedTo: { $exists: false } },
        { assignedTo: null },
        { assignedTo: '' }
      ]
    });
    
    // Calculate average resolution time for resolved complaints
    const resolvedWithTime = await Complaint.find({
      status: 'resolved',
      resolvedAt: { $exists: true },
      createdAt: { $exists: true }
    });
    
    let averageResolutionDays = 0;
    if (resolvedWithTime.length > 0) {
      const totalDays = resolvedWithTime.reduce((sum, complaint) => {
        const days = (complaint.resolvedAt - complaint.createdAt) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0);
      averageResolutionDays = Math.round((totalDays / resolvedWithTime.length) * 10) / 10;
    }
    
    console.log('📊 Generated complaint statistics');
    console.log(`📈 Total: ${totalComplaints}, Resolved: ${resolvedComplaints}, Assigned: ${assignedComplaints}`);
    
    res.json({
      success: true,
      data: {
        total: totalComplaints,
        byStatus: {
          open: openComplaints,
          'in-progress': inProgressComplaints,
          resolved: resolvedComplaints
        },
        byAssignment: {
          assigned: assignedComplaints,
          unassigned: unassignedComplaints
        },
        averageResolutionDays
      }
    });
  } catch (error) {
    console.error('Error getting complaint statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get statistics',
      message: error.message
    });
  }
};

// Get complaints assigned to specific admin
const getComplaintsByAdmin = async (req, res) => {
  try {
    const { adminName } = req.params;
    
    const complaints = await Complaint.find({ 
      assignedTo: adminName 
    })
    .sort({ createdAt: -1 })
    .select('-__v');
    
    console.log(`👨‍💼 GET complaints for admin: ${adminName} - found ${complaints.length} complaints`);
    
    res.json({
      success: true,
      data: complaints,
      assignedTo: adminName,
      count: complaints.length
    });
  } catch (error) {
    console.error('Error getting complaints by admin:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch complaints by admin',
      message: error.message
    });
  }
};

// IMPORTANT: Export ALL functions including getComplaintByTicketRef
module.exports = {
  getAllComplaints,
  getComplaintById,
  getComplaintByTicketRef,  // This was missing in your controller!
  createComplaint,
  updateComplaint,
  resolveComplaint,
  deleteComplaint,
  getComplaintStatistics,
  getComplaintsByAdmin
};