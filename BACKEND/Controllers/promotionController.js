const Promotion = require('../models/Promotion');

// Get all promotions
const getAllPromotions = async (req, res) => {
  try {
    const { 
      type, 
      platform, 
      status, 
      page = 1, 
      limit = 10, 
      sortBy = 'createdAt', 
      sortOrder = 'desc' 
    } = req.query;
    
    // Build filter object
    const filter = {};
    if (type) filter.type = type;
    if (platform) filter.platform = platform;
    if (status) filter.status = status;

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Calculate skip value for pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const promotions = await Promotion.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit))
      .select('-__v');

    const total = await Promotion.countDocuments(filter);

    console.log(`📢 GET /api/promotions - returning ${promotions.length} promotions`);
    
    res.json({
      success: true,
      data: promotions,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalPromotions: total,
        hasNext: skip + parseInt(limit) < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error getting promotions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch promotions',
      message: error.message
    });
  }
};

// Get single promotion by ID
const getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id).select('-__v');
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }

    console.log(`📢 GET /api/promotions/${id} - returning promotion: ${promotion.title}`);
    
    res.json({
      success: true,
      data: promotion
    });
  } catch (error) {
    console.error('Error getting promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch promotion',
      message: error.message
    });
  }
};

// Create new promotion
const createPromotion = async (req, res) => {
  try {
    const promotionData = req.body;
    
    // Validate required fields
    if (!promotionData.title || !promotionData.description || !promotionData.platform || !promotionData.discountValue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields',
        required: ['title', 'description', 'platform', 'discountValue']
      });
    }

    // Additional date validation
    if (!promotionData.startDate || !promotionData.endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const startDate = new Date(promotionData.startDate);
    const endDate = new Date(promotionData.endDate);
    const now = new Date();

    // Set time for proper comparison
    startDate.setHours(0, 0, 0, 0);
    endDate.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    // Manual date validation
    if (startDate < now) {
      return res.status(400).json({
        success: false,
        error: 'Start date cannot be in the past'
      });
    }

    if (endDate <= startDate) {
      return res.status(400).json({
        success: false,
        error: 'End date must be after start date'
      });
    }

    // Validate end date is not too far in future
    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (endDate > maxEndDate) {
      return res.status(400).json({
        success: false,
        error: 'End date cannot be more than 1 year in the future'
      });
    }

    // Update dates with proper time
    promotionData.startDate = startDate;
    promotionData.endDate = endDate;

    const newPromotion = new Promotion(promotionData);
    const savedPromotion = await newPromotion.save();
    
    console.log(`✅ Created new promotion: ${savedPromotion.title}`);
    
    res.status(201).json({
      success: true,
      message: 'Promotion created successfully',
      data: savedPromotion
    });
  } catch (error) {
    console.error('Error creating promotion:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Promotion code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to create promotion',
      message: error.message
    });
  }
};

// Update promotion
const updatePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Remove fields that shouldn't be updated
    delete updates.createdAt;
    delete updates.updatedAt;
    
    // Date validation for updates
    if (updates.startDate || updates.endDate) {
      const promotion = await Promotion.findById(id);
      if (!promotion) {
        return res.status(404).json({
          success: false,
          error: 'Promotion not found'
        });
      }

      const startDate = updates.startDate ? new Date(updates.startDate) : new Date(promotion.startDate);
      const endDate = updates.endDate ? new Date(updates.endDate) : new Date(promotion.endDate);
      const now = new Date();

      // Set time for proper comparison
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
      now.setHours(0, 0, 0, 0);

      if (endDate <= startDate) {
        return res.status(400).json({
          success: false,
          error: 'End date must be after start date'
        });
      }

      // Validate end date is not too far in future
      const maxEndDate = new Date();
      maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
      if (endDate > maxEndDate) {
        return res.status(400).json({
          success: false,
          error: 'End date cannot be more than 1 year in the future'
        });
      }

      // Update dates in updates object
      if (updates.startDate) updates.startDate = startDate;
      if (updates.endDate) updates.endDate = endDate;
    }

    const promotion = await Promotion.findByIdAndUpdate(
      id,
      updates,
      { 
        new: true, 
        runValidators: true 
      }
    ).select('-__v');
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }
    
    console.log(`✅ Updated promotion: ${promotion.title}`);
    
    res.json({
      success: true,
      message: 'Promotion updated successfully',
      data: promotion
    });
  } catch (error) {
    console.error('Error updating promotion:', error);
    
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: validationErrors
      });
    }
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Promotion code already exists'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to update promotion',
      message: error.message
    });
  }
};

// Delete promotion
const deletePromotion = async (req, res) => {
  try {
    const { id } = req.params;
    
    const promotion = await Promotion.findByIdAndDelete(id);
    
    if (!promotion) {
      return res.status(404).json({
        success: false,
        error: 'Promotion not found'
      });
    }
    
    console.log(`🗑️ Deleted promotion: ${promotion.title}`);
    
    res.json({
      success: true,
      message: 'Promotion deleted successfully',
      data: promotion
    });
  } catch (error) {
    console.error('Error deleting promotion:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete promotion',
      message: error.message
    });
  }
};

// Get active promotions
const getActivePromotions = async (req, res) => {
  try {
    const currentDate = new Date();
    
    const activePromotions = await Promotion.find({
      status: 'active',
      startDate: { $lte: currentDate },
      endDate: { $gte: currentDate }
    })
    .sort({ createdAt: -1 })
    .select('-__v');

    console.log(`📢 GET /api/promotions/active - returning ${activePromotions.length} active promotions`);
    
    res.json({
      success: true,
      data: activePromotions
    });
  } catch (error) {
    console.error('Error getting active promotions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch active promotions',
      message: error.message
    });
  }
};

// Get promotions by platform
const getPromotionsByPlatform = async (req, res) => {
  try {
    const { platform } = req.params;
    
    const promotions = await Promotion.find({ platform })
      .sort({ createdAt: -1 })
      .select('-__v');

    console.log(`📢 GET /api/promotions/platform/${platform} - returning ${promotions.length} promotions`);
    
    res.json({
      success: true,
      data: promotions,
      platform
    });
  } catch (error) {
    console.error('Error getting promotions by platform:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch promotions by platform',
      message: error.message
    });
  }
};

// Validate promotion dates
const validatePromotionDates = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        error: 'Start date and end date are required'
      });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const now = new Date();

    // Set time for proper comparison
    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);
    now.setHours(0, 0, 0, 0);

    const errors = [];

    if (start < now) {
      errors.push('Start date cannot be in the past');
    }

    if (end <= start) {
      errors.push('End date must be after start date');
    }

    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (end > maxEndDate) {
      errors.push('End date cannot be more than 1 year in the future');
    }

    res.json({
      success: true,
      isValid: errors.length === 0,
      errors: errors
    });
  } catch (error) {
    console.error('Error validating dates:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate dates',
      message: error.message
    });
  }
};

module.exports = {
  getAllPromotions,
  getPromotionById,
  createPromotion,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  getPromotionsByPlatform,
  validatePromotionDates
};