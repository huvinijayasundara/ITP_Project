const mongoose = require("mongoose");

const ratingSchema = new mongoose.Schema({
    productId: { 
        type: String, // Changed from ObjectId to String since we're using string IDs
        required: [true, 'Product ID is required'],
        index: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    customerName: { 
        type: String, 
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    customerEmail: {
        type: String,
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email) {
                if (!email) return true;
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Please provide a valid email address'
        }
    },
    rating: { 
        type: Number, 
        required: [true, 'Rating is required'], 
        min: [1, 'Rating must be at least 1'], 
        max: [5, 'Rating cannot exceed 5']
    },
    comment: { 
        type: String,
        trim: true,
        maxlength: [500, 'Comment cannot exceed 500 characters']
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Order"
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
    },
    images: [{
        url: {
            type: String,
            validate: {
                validator: function(url) {
                    if (!url) return true;
                    const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
                    return urlRegex.test(url);
                },
                message: 'Please provide a valid URL for the image'
            }
        },
        caption: {
            type: String,
            trim: true,
            maxlength: [100, 'Image caption cannot exceed 100 characters']
        }
    }],
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    reportCount: {
        type: Number,
        default: 0,
        min: 0
    },
    isPublic: {
        type: Boolean,
        default: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'approved'
    },
    adminResponse: {
        message: {
            type: String,
            trim: true,
            maxlength: [300, 'Admin response cannot exceed 300 characters']
        },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
ratingSchema.index({ productId: 1, createdAt: -1 });
ratingSchema.index({ productId: 1, rating: -1 });
ratingSchema.index({ customerId: 1, productId: 1 }, { sparse: true }); // Removed unique constraint
ratingSchema.index({ isVerifiedPurchase: 1 });
ratingSchema.index({ status: 1 });

// Static methods
ratingSchema.statics.getProductRatings = function(productId) {
    return this.find({ 
        productId, 
        status: 'approved',
        isPublic: true 
    }).sort({ createdAt: -1 });
};

ratingSchema.statics.calculateProductRating = function(productId) {
    return this.aggregate([
        { 
            $match: { 
                productId: productId, // No need to convert to ObjectId since it's a string
                status: 'approved'
            }
        },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: 1 },
                ratingBreakdown: {
                    $push: '$rating'
                }
            }
        }
    ]);
};

// Instance methods
ratingSchema.methods.markHelpful = function() {
    this.helpfulVotes += 1;
    return this.save();
};

ratingSchema.methods.report = function() {
    this.reportCount += 1;
    if (this.reportCount >= 5) {
        this.status = 'pending';
    }
    return this.save();
};

module.exports = mongoose.model("Rating", ratingSchema);