const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema(
  {
    customerName: { 
        type: String, 
        required: [true, 'Customer name is required'],
        trim: true,
        maxlength: [100, 'Customer name cannot exceed 100 characters']
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'],
        lowercase: true,
        trim: true,
        validate: {
            validator: function(email) {
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
            },
            message: 'Please provide a valid email address'
        }
    },
    phoneNumber: {
        type: String,
        trim: true
    },
    message: { 
        type: String, 
        required: [true, 'Feedback message is required'],
        trim: true,
        maxlength: [1000, 'Message cannot exceed 1000 characters']
    },
    category: { 
        type: String,
        enum: {
            values: ["product", "service", "delivery", "website", "general"],
            message: 'Category must be one of: product, service, delivery, website, general'
        },
        default: "general" 
    },
    rating: { 
        type: Number, 
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot exceed 5'],
        required: [true, 'Rating is required']
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order'
    },
    // THIS IS THE KEY FIX - Store who created the feedback
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    isVerifiedPurchase: {
        type: Boolean,
        default: false
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
            maxlength: [500, 'Admin response cannot exceed 500 characters']
        },
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        respondedAt: Date
    },
    helpfulVotes: {
        type: Number,
        default: 0,
        min: 0
    },
    // THIS IS THE KEY FIX - Track who voted
    helpfulVoters: [{
        type: mongoose.Schema.Types.Mixed, // Can store ObjectId or String (email)
        default: []
    }],
    reportCount: {
        type: Number,
        default: 0,
        min: 0
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Add indexes for better performance
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ rating: 1 });
feedbackSchema.index({ productId: 1 });
feedbackSchema.index({ isPublic: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });
feedbackSchema.index({ email: 1 }); // For ownership checks
feedbackSchema.index({ userId: 1 }); // For ownership checks
feedbackSchema.index({ createdBy: 1 }); // For ownership checks

// Static methods
feedbackSchema.statics.getPublicFeedbacks = function() {
    return this.find({ isPublic: true, status: 'approved' }).sort({ createdAt: -1 });
};

feedbackSchema.statics.getAverageRating = function() {
    return this.aggregate([
        { $match: { status: 'approved' } },
        { $group: { _id: null, avgRating: { $avg: '$rating' }, totalCount: { $sum: 1 } } }
    ]);
};

module.exports = mongoose.model("Feedback", feedbackSchema);