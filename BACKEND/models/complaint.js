const mongoose = require("mongoose");

// Function to generate ticket reference like CMP-20250920-XYZ12
function generateTicketRef() {
  const date = new Date();
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  // Generate random 5-character code
  const random = Math.random().toString(36).substring(2, 7).toUpperCase();

  return `CMP-${yyyy}${mm}${dd}-${random}`;
}

const complaintSchema = new mongoose.Schema(
  {
    ticketRef: { 
      type: String, 
      default: generateTicketRef, 
      unique: true,
      required: true
    },
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
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please enter a valid email address'
      ]
    },
    issue: { 
      type: String, 
      required: [true, 'Issue description is required'],
      trim: true,
      maxlength: [1000, 'Issue description cannot exceed 1000 characters']
    },
    category: {
      type: String,
      enum: {
        values: [
          "product-quality", 
          "shipping", 
          "customer-service", 
          "billing", 
          "website", 
          "refund-exchange", 
          "general", 
          "other"
        ],
        message: 'Invalid category selected'
      },
      default: "general"
    },
    status: {
      type: String,
      enum: {
        values: ["open", "in-progress", "resolved"],
        message: 'Status must be either open, in-progress, or resolved'
      },
      default: "open"
    },
    priority: {
      type: String,
      enum: {
        values: ["low", "medium", "high", "urgent"],
        message: 'Priority must be low, medium, high, or urgent'
      },
      default: "medium"
    },
    assignedTo: {
      type: String,
      trim: true,
      default: null,
      maxlength: [100, 'Assigned to field cannot exceed 100 characters']
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [500, 'Resolution cannot exceed 500 characters'],
      default: null
    },
    resolvedAt: {
      type: Date,
      default: null
    },
    customerNotified: {
      type: Boolean,
      default: false
    },
    internalNotes: {
      type: String,
      trim: true,
      maxlength: [1000, 'Internal notes cannot exceed 1000 characters'],
      default: null
    },
    attachments: [{
      filename: String,
      url: String,
      uploadedAt: { type: Date, default: Date.now }
    }],
    followUpRequired: {
      type: Boolean,
      default: false
    },
    followUpDate: {
      type: Date,
      default: null
    },
    tags: [{
      type: String,
      trim: true
    }],
    escalated: {
      type: Boolean,
      default: false
    },
    escalatedAt: {
      type: Date,
      default: null
    },
    escalatedTo: {
      type: String,
      trim: true,
      default: null
    },
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5,
        default: null
      },
      feedback: {
        type: String,
        trim: true,
        maxlength: [500, 'Feedback cannot exceed 500 characters'],
        default: null
      },
      submittedAt: {
        type: Date,
        default: null
      }
    }
  },
  { 
    timestamps: true, // This adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for complaint age in days
complaintSchema.virtual('ageInDays').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60 * 24));
});

// Virtual for complaint age in hours
complaintSchema.virtual('ageInHours').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60 * 60));
});

// Virtual for complaint age in minutes
complaintSchema.virtual('ageInMinutes').get(function() {
  return Math.floor((Date.now() - this.createdAt) / (1000 * 60));
});

// Virtual for display category
complaintSchema.virtual('categoryDisplay').get(function() {
  const categoryMap = {
    "product-quality": "Product Quality",
    "shipping": "Shipping & Delivery",
    "customer-service": "Customer Service",
    "billing": "Billing & Payment",
    "website": "Website Issues",
    "refund-exchange": "Refund/Exchange",
    "general": "General",
    "other": "Other"
  };
  return categoryMap[this.category] || this.category;
});

// Virtual for priority display
complaintSchema.virtual('priorityDisplay').get(function() {
  const priorityMap = {
    "low": "Low Priority",
    "medium": "Medium Priority",
    "high": "High Priority",
    "urgent": "Urgent Priority"
  };
  return priorityMap[this.priority] || this.priority;
});

// Virtual for status display
complaintSchema.virtual('statusDisplay').get(function() {
  const statusMap = {
    "open": "Open",
    "in-progress": "In Progress",
    "resolved": "Resolved"
  };
  return statusMap[this.status] || this.status;
});

// Virtual for resolution time (if resolved)
complaintSchema.virtual('resolutionTimeHours').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60));
  }
  return null;
});

// Virtual for resolution time in days
complaintSchema.virtual('resolutionTimeDays').get(function() {
  if (this.resolvedAt && this.createdAt) {
    return Math.floor((this.resolvedAt - this.createdAt) / (1000 * 60 * 60 * 24));
  }
  return null;
});

// Virtual to check if complaint is overdue (more than 72 hours for urgent, 7 days for others)
complaintSchema.virtual('isOverdue').get(function() {
  const now = new Date();
  const ageInHours = (now - this.createdAt) / (1000 * 60 * 60);
  
  if (this.status === 'resolved') return false;
  
  if (this.priority === 'urgent' && ageInHours > 72) return true;
  if (this.priority === 'high' && ageInHours > 120) return true;
  if (['medium', 'low'].includes(this.priority) && ageInHours > 168) return true;
  
  return false;
});

// Pre-save middleware to set resolvedAt when status changes to resolved
complaintSchema.pre('save', function(next) {
  if (this.isModified('status')) {
    if (this.status === 'resolved' && !this.resolvedAt) {
      this.resolvedAt = new Date();
    } else if (this.status !== 'resolved') {
      this.resolvedAt = null;
    }
  }
  
  // Auto-escalate urgent complaints after 24 hours
  if (this.priority === 'urgent' && !this.escalated && this.ageInHours > 24) {
    this.escalated = true;
    this.escalatedAt = new Date();
  }
  
  next();
});

// Pre-save middleware to validate email format more strictly
complaintSchema.pre('save', function(next) {
  if (this.email) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(this.email)) {
      return next(new Error('Please enter a valid email address'));
    }
  }
  next();
});

// Static method to find complaints by status
complaintSchema.statics.findByStatus = function(status) {
  return this.find({ status: status }).sort({ createdAt: -1 });
};

// Static method to find complaints by category
complaintSchema.statics.findByCategory = function(category) {
  return this.find({ category: category }).sort({ createdAt: -1 });
};

// Static method to find complaints by priority
complaintSchema.statics.findByPriority = function(priority) {
  return this.find({ priority: priority }).sort({ createdAt: -1 });
};

// Static method to find overdue complaints
complaintSchema.statics.findOverdue = function() {
  const now = new Date();
  const urgentCutoff = new Date(now.getTime() - (72 * 60 * 60 * 1000)); // 72 hours ago
  const highCutoff = new Date(now.getTime() - (120 * 60 * 60 * 1000)); // 5 days ago
  const normalCutoff = new Date(now.getTime() - (168 * 60 * 60 * 1000)); // 7 days ago

  return this.find({
    status: { $ne: 'resolved' },
    $or: [
      { priority: 'urgent', createdAt: { $lt: urgentCutoff } },
      { priority: 'high', createdAt: { $lt: highCutoff } },
      { priority: { $in: ['medium', 'low'] }, createdAt: { $lt: normalCutoff } }
    ]
  }).sort({ createdAt: 1 });
};

// Static method to find complaints needing follow-up
complaintSchema.statics.findNeedingFollowUp = function() {
  return this.find({ 
    followUpRequired: true, 
    followUpDate: { $lte: new Date() } 
  }).sort({ followUpDate: 1 });
};

// Static method to get complaint statistics
complaintSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Static method to get detailed statistics
complaintSchema.statics.getDetailedStatistics = function() {
  return this.aggregate([
    {
      $facet: {
        byStatus: [
          { $group: { _id: '$status', count: { $sum: 1 } } }
        ],
        byPriority: [
          { $group: { _id: '$priority', count: { $sum: 1 } } }
        ],
        byCategory: [
          { $group: { _id: '$category', count: { $sum: 1 } } }
        ],
        averageResolutionTime: [
          {
            $match: { 
              status: 'resolved', 
              resolvedAt: { $exists: true }, 
              createdAt: { $exists: true } 
            }
          },
          {
            $project: {
              resolutionTimeHours: {
                $divide: [
                  { $subtract: ['$resolvedAt', '$createdAt'] },
                  1000 * 60 * 60
                ]
              }
            }
          },
          {
            $group: {
              _id: null,
              avgHours: { $avg: '$resolutionTimeHours' },
              count: { $sum: 1 }
            }
          }
        ],
        overdueComplaints: [
          {
            $match: { status: { $ne: 'resolved' } }
          },
          {
            $project: {
              ageInHours: {
                $divide: [
                  { $subtract: [new Date(), '$createdAt'] },
                  1000 * 60 * 60
                ]
              },
              priority: 1,
              isOverdue: {
                $or: [
                  { 
                    $and: [
                      { $eq: ['$priority', 'urgent'] },
                      { $gt: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60] }, 72] }
                    ]
                  },
                  { 
                    $and: [
                      { $eq: ['$priority', 'high'] },
                      { $gt: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60] }, 120] }
                    ]
                  },
                  { 
                    $and: [
                      { $in: ['$priority', ['medium', 'low']] },
                      { $gt: [{ $divide: [{ $subtract: [new Date(), '$createdAt'] }, 1000 * 60 * 60] }, 168] }
                    ]
                  }
                ]
              }
            }
          },
          {
            $match: { isOverdue: true }
          },
          {
            $group: {
              _id: null,
              count: { $sum: 1 }
            }
          }
        ]
      }
    }
  ]);
};

// Static method to get complaints by date range
complaintSchema.statics.findByDateRange = function(startDate, endDate) {
  return this.find({
    createdAt: {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    }
  }).sort({ createdAt: -1 });
};

// Static method to search complaints
complaintSchema.statics.searchComplaints = function(searchTerm) {
  const regex = new RegExp(searchTerm, 'i');
  return this.find({
    $or: [
      { ticketRef: regex },
      { customerName: regex },
      { email: regex },
      { issue: regex },
      { resolution: regex }
    ]
  }).sort({ createdAt: -1 });
};

// Instance method to resolve complaint
complaintSchema.methods.resolve = function(resolution, notifyCustomer = true) {
  this.status = 'resolved';
  this.resolution = resolution;
  this.resolvedAt = new Date();
  this.customerNotified = notifyCustomer;
  return this.save();
};

// Instance method to assign complaint
complaintSchema.methods.assignTo = function(staffMember) {
  this.assignedTo = staffMember;
  if (this.status === 'open') {
    this.status = 'in-progress';
  }
  return this.save();
};

// Instance method to escalate complaint
complaintSchema.methods.escalate = function(escalatedTo, reason) {
  this.escalated = true;
  this.escalatedAt = new Date();
  this.escalatedTo = escalatedTo;
  if (reason) {
    this.internalNotes = this.internalNotes ? 
      this.internalNotes + '\n--- ESCALATION ---\n' + reason : 
      '--- ESCALATION ---\n' + reason;
  }
  return this.save();
};

// Instance method to add internal note
complaintSchema.methods.addInternalNote = function(note) {
  const timestamp = new Date().toISOString();
  const noteWithTimestamp = `[${timestamp}] ${note}`;
  this.internalNotes = this.internalNotes ? 
    this.internalNotes + '\n' + noteWithTimestamp : 
    noteWithTimestamp;
  return this.save();
};

// Instance method to set follow-up
complaintSchema.methods.setFollowUp = function(followUpDate, reason) {
  this.followUpRequired = true;
  this.followUpDate = followUpDate;
  if (reason) {
    this.addInternalNote(`Follow-up scheduled for ${followUpDate.toDateString()}: ${reason}`);
  }
  return this.save();
};

// Instance method to add customer satisfaction
complaintSchema.methods.addSatisfactionRating = function(rating, feedback) {
  this.customerSatisfaction = {
    rating: rating,
    feedback: feedback,
    submittedAt: new Date()
  };
  return this.save();
};

// Instance method to add attachment
complaintSchema.methods.addAttachment = function(filename, url) {
  this.attachments.push({
    filename: filename,
    url: url,
    uploadedAt: new Date()
  });
  return this.save();
};

// Instance method to add tag
complaintSchema.methods.addTag = function(tag) {
  if (!this.tags.includes(tag)) {
    this.tags.push(tag);
    return this.save();
  }
  return Promise.resolve(this);
};

// Instance method to remove tag
complaintSchema.methods.removeTag = function(tag) {
  this.tags = this.tags.filter(t => t !== tag);
  return this.save();
};

// Add indexes for better query performance
complaintSchema.index({ ticketRef: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ createdAt: -1 });
complaintSchema.index({ email: 1 });
complaintSchema.index({ priority: 1 });
complaintSchema.index({ category: 1 });
complaintSchema.index({ assignedTo: 1 });
complaintSchema.index({ escalated: 1 });
complaintSchema.index({ followUpRequired: 1, followUpDate: 1 });
complaintSchema.index({ tags: 1 });

// Text search index
complaintSchema.index({ 
  ticketRef: 'text', 
  customerName: 'text', 
  email: 'text', 
  issue: 'text',
  resolution: 'text'
});

// Compound indexes for common queries
complaintSchema.index({ status: 1, priority: -1 });
complaintSchema.index({ category: 1, status: 1 });
complaintSchema.index({ assignedTo: 1, status: 1 });
complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ priority: 1, createdAt: 1 });

module.exports = mongoose.model("Complaint", complaintSchema);