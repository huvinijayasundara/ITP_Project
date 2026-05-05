const mongoose = require("mongoose");

const promotionSchema = new mongoose.Schema(
  {
    title: { 
        type: String, 
        required: [true, 'Promotion title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: { 
        type: String,
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    type: {
        type: String,
        enum: {
            values: ["social_media", "email", "sms", "welcome", "seasonal", "flash_sale", "loyalty", "general"],
            message: 'Type must be one of the predefined options'
        },
        default: "general"
    },
    platform: {
        type: String,
        required: [true, 'Platform is required'],
        trim: true,
        maxlength: [50, 'Platform name cannot exceed 50 characters']
    },
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0.01, 'Discount value must be greater than 0']
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed_amount', 'buy_x_get_y'],
        default: 'percentage'
    },
    promotionCode: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Promotion code cannot exceed 20 characters']
    },
    startDate: { 
        type: Date, 
        required: [true, 'Start date is required'],
        validate: {
            validator: function(value) {
                // Start date should not be in the past when creating new promotion
                if (this.isNew && value < new Date().setHours(0, 0, 0, 0)) {
                    return false;
                }
                return true;
            },
            message: 'Start date cannot be in the past for new promotions'
        }
    },
    endDate: { 
        type: Date, 
        required: [true, 'End date is required'],
        validate: {
            validator: function(value) {
                // End date should be after start date
                if (this.startDate && value <= this.startDate) {
                    return false;
                }
                // End date should not be more than 1 year in the future
                const oneYearFromNow = new Date();
                oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
                if (value > oneYearFromNow) {
                    return false;
                }
                return true;
            },
            message: 'End date must be after start date and within 1 year from now'
        }
    },
    status: {
        type: String,
        enum: ["active", "paused", "expired", "scheduled"],
        default: "scheduled"
    },
    targetAudience: {
        type: String,
        enum: ["all", "new_customers", "existing_customers", "vip_customers", "social_media_followers", "email_subscribers", "sms_subscribers"],
        default: "all"
    },
    usageLimit: {
        type: Number,
        min: 0,
        default: null
    },
    usedCount: {
        type: Number,
        default: 0,
        min: 0
    },
    minimumOrderAmount: {
        type: Number,
        min: 0,
        default: 0
    },
    applicableProducts: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    }],
    applicableCategories: [{
        type: String,
        enum: ["Home Decor", "Accessories", "Clothing", "Art", "Jewelry", "Pottery", "Textiles", "Wood Craft", "General"]
    }],
    bannerImage: {
        type: String,
        validate: {
            validator: function(url) {
                if (!url) return true;
                const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
                return urlRegex.test(url);
            },
            message: 'Please provide a valid URL for the banner image'
        }
    },
    socialMediaLinks: {
        facebook: String,
        instagram: String,
        twitter: String,
        whatsapp: String
    },
    analytics: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 },
        conversions: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for checking if promotion is currently active
promotionSchema.virtual('isCurrentlyActive').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           this.startDate <= now && 
           this.endDate >= now &&
           this.isActive &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

// Virtual for days remaining
promotionSchema.virtual('daysRemaining').get(function() {
    const now = new Date();
    const end = new Date(this.endDate);
    if (end < now) return 0;
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Virtual for conversion rate
promotionSchema.virtual('conversionRate').get(function() {
    if (this.analytics.clicks === 0) return 0;
    return Math.round((this.analytics.conversions / this.analytics.clicks) * 100 * 100) / 100;
});

// Pre-save middleware to auto-activate/expire based on dates and validate date logic
promotionSchema.pre('save', function(next) {
    const now = new Date();
    
    // Enhanced date validation
    if (this.endDate <= this.startDate) {
        const error = new Error('End date must be after start date');
        error.name = 'ValidationError';
        return next(error);
    }
    
    // Validate that end date is not too far in the future
    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
    if (this.endDate > maxEndDate) {
        const error = new Error('End date cannot be more than 1 year in the future');
        error.name = 'ValidationError';
        return next(error);
    }
    
    // Auto-update status based on dates
    if (this.startDate <= now && this.endDate >= now && this.status === 'scheduled') {
        this.status = 'active';
    } else if (this.endDate < now && (this.status === 'active' || this.status === 'scheduled')) {
        this.status = 'expired';
    } else if (this.startDate > now && this.status === 'active') {
        this.status = 'scheduled';
    }
    
    // Auto-generate promotion code if not provided
    if (!this.promotionCode && this.isNew) {
        const timestamp = Date.now().toString(36).slice(-4);
        const random = Math.random().toString(36).substring(2, 6);
        this.promotionCode = `PROMO${timestamp.toUpperCase()}${random.toUpperCase()}`;
    }
    
    next();
});

// Pre-update middleware for findOneAndUpdate operations
promotionSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    const now = new Date();
    
    // Handle date validation for updates
    if (update.startDate || update.endDate) {
        const startDate = update.startDate ? new Date(update.startDate) : null;
        const endDate = update.endDate ? new Date(update.endDate) : null;
        
        if (startDate && endDate && endDate <= startDate) {
            const error = new Error('End date must be after start date');
            error.name = 'ValidationError';
            return next(error);
        }
        
        // Validate that end date is not too far in the future
        const maxEndDate = new Date();
        maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);
        if (endDate && endDate > maxEndDate) {
            const error = new Error('End date cannot be more than 1 year in the future');
            error.name = 'ValidationError';
            return next(error);
        }
    }
    
    next();
});

// Indexes
promotionSchema.index({ status: 1 });
promotionSchema.index({ type: 1 });
promotionSchema.index({ startDate: 1, endDate: 1 });
promotionSchema.index({ promotionCode: 1 });
promotionSchema.index({ targetAudience: 1 });
promotionSchema.index({ createdAt: -1 });
promotionSchema.index({ isActive: 1 });

// Static methods
promotionSchema.statics.getActivePromotions = function() {
    const now = new Date();
    return this.find({
        status: 'active',
        isActive: true,
        startDate: { $lte: now },
        endDate: { $gte: now }
    });
};

promotionSchema.statics.getPromotionsByPlatform = function(platform) {
    return this.find({ 
        platform: { $regex: platform, $options: 'i' },
        isActive: true
    }).sort({ createdAt: -1 });
};

// Static method to validate dates
promotionSchema.statics.validateDates = function(startDate, endDate) {
    const errors = [];
    const now = new Date();
    const maxEndDate = new Date();
    maxEndDate.setFullYear(maxEndDate.getFullYear() + 1);

    if (startDate < now.setHours(0, 0, 0, 0)) {
        errors.push('Start date cannot be in the past');
    }

    if (endDate <= startDate) {
        errors.push('End date must be after start date');
    }

    if (endDate > maxEndDate) {
        errors.push('End date cannot be more than 1 year in the future');
    }

    return errors;
};

// Instance methods
promotionSchema.methods.use = function() {
    this.usedCount += 1;
    this.analytics.conversions += 1;
    
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        this.status = 'expired';
    }
    
    return this.save();
};

promotionSchema.methods.trackView = function() {
    this.analytics.views += 1;
    return this.save();
};

promotionSchema.methods.trackClick = function() {
    this.analytics.clicks += 1;
    return this.save();
};

promotionSchema.methods.addRevenue = function(amount) {
    this.analytics.revenue += amount;
    return this.save();
};

// Method to check if promotion is valid
promotionSchema.methods.isValid = function() {
    const now = new Date();
    return this.isActive && 
           this.status === 'active' && 
           this.startDate <= now && 
           this.endDate >= now &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
};

module.exports = mongoose.models.Promotion || mongoose.model("Promotion", promotionSchema);