const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const discountSchema = new Schema({
    discountCode: { 
        type: String,
        required: [true, 'Discount code is required'],
        unique: true,
        trim: true,
        uppercase: true,
        maxlength: [20, 'Discount code cannot exceed 20 characters'],
        validate: {
            validator: function(code) {
                return /^[A-Z0-9]+$/.test(code);
            },
            message: 'Discount code must contain only letters and numbers'
        }
    }, 
    title: {
        type: String,
        required: [true, 'Title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    }, 
    discountValue: {
        type: Number,
        required: [true, 'Discount value is required'],
        min: [0.01, 'Discount value must be greater than 0'],
        validate: {
            validator: function(value) {
                if (this.discountType === 'percentage') {
                    return value <= 100;
                }
                return true;
            },
            message: 'Percentage discount cannot exceed 100%'
        }
    }, 
    discountType: {
        type: String,
        enum: ['percentage', 'fixed_amount'],
        default: 'percentage'
    },
    validFrom: {
        type: Date,
        required: [true, 'Valid from date is required']
    }, 
    validTo: {
        type: Date,
        required: [true, 'Valid to date is required']
    }, 
    status: { 
        type: String,
        enum: ["active", "expired", "paused"],
        default: "active" 
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
    applicableCategories: [{
        type: String,
        enum: ["Home Decor", "Accessories", "Clothing", "Art", "Jewelry", "Pottery", "Textiles", "Wood Craft", "General"]
    }],
    excludedCategories: [{
        type: String,
        enum: ["Home Decor", "Accessories", "Clothing", "Art", "Jewelry", "Pottery", "Textiles", "Wood Craft", "General"]
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

discountSchema.virtual('isCurrentlyValid').get(function() {
    const now = new Date();
    return this.status === 'active' && 
           this.validFrom <= now && 
           this.validTo >= now &&
           this.isActive &&
           (this.usageLimit === null || this.usedCount < this.usageLimit);
});

discountSchema.virtual('remainingUses').get(function() {
    if (this.usageLimit === null) return 'Unlimited';
    return Math.max(0, this.usageLimit - this.usedCount);
});

discountSchema.pre('save', function(next) {
    const now = new Date();
    if (this.validTo < now && this.status === 'active') {
        this.status = 'expired';
    }
    next();
});

discountSchema.statics.getValidDiscounts = function() {
    const now = new Date();
    return this.find({
        status: 'active',
        isActive: true,
        validFrom: { $lte: now },
        validTo: { $gte: now },
        $or: [
            { usageLimit: null },
            { $expr: { $lt: ['$usedCount', '$usageLimit'] } }
        ]
    });
};

discountSchema.methods.use = function() {
    this.usedCount += 1;
    if (this.usageLimit && this.usedCount >= this.usageLimit) {
        this.status = 'expired';
    }
    return this.save();
};

module.exports = mongoose.model("Discount", discountSchema);