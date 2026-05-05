const Feedback = require("../models/feedback");

// Helper function to extract user ID reliably
function getUserId(req) {
  // Priority 1: From JWT token (req.user)
  if (req.user?.id) return req.user.id;
  
  // Priority 2: From headers (fallback)
  const userId = req.headers['x-user-id'];
  if (userId) return userId;
  
  // Priority 3: From localStorage (if sent in body for debugging)
  if (req.body?.userId) return req.body.userId;
  
  return null;
}

// Helper function to extract user email
function getUserEmail(req) {
  if (req.user?.email) return req.user.email.toLowerCase().trim();
  if (req.user?.gmail) return req.user.gmail.toLowerCase().trim();
  if (req.headers['x-user-email']) return req.headers['x-user-email'].toLowerCase().trim();
  return null;
}

// Create feedback
exports.createFeedback = async (req, res) => {
  try {
    console.log("📝 Creating feedback with data:", req.body);
    console.log("👤 Authenticated user:", req.user);
    console.log("🔑 Headers:", {
      auth: req.headers['authorization'] ? 'Present' : 'Missing',
      userId: req.headers['x-user-id'] || 'None'
    });
    
    const { customerName, email, message, category, rating, phoneNumber } = req.body;
    
    // Validation
    if (!customerName || !email || !message) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["customerName", "email", "message"] 
      });
    }

    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email address" });
    }

    // ✅ FIX: Extract user ID with multiple fallbacks
    const userId = getUserId(req);
    const userEmail = getUserEmail(req);
    
    console.log("🆔 Extracted user info:", { userId, userEmail });

    const newFeedback = new Feedback({
      customerName: customerName.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
      category: category || "general",
      rating: rating || 5,
      phoneNumber: phoneNumber?.trim(),
      status: 'approved',
      isPublic: true,
      // ✅ Store both ID and email for ownership tracking
      userId: userId,
      createdBy: userId,
      // Store the email from feedback for cross-reference
      userEmail: userEmail || email.trim().toLowerCase()
    });
    
    const savedFeedback = await newFeedback.save();
    console.log("✅ Created feedback:", savedFeedback._id, "by user:", userId);
    
    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      data: savedFeedback
    });
  } catch (err) {
    console.error("❌ Error creating feedback:", err);
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ 
      error: err.message || "Failed to create feedback"
    });
  }
};

// Get all feedbacks (with filters)
exports.getFeedbacks = async (req, res) => {
  try {
    console.log("📥 Fetching feedbacks with query:", req.query);
    
    const { category, from, to, rating, status, showAll } = req.query;
    let filter = {};
    
    if (showAll === 'true') {
      filter = {};
    } else {
      filter = { isPublic: true, status: 'approved' };
    }
    
    if (category && category !== '') {
      filter.category = category;
    }
    
    if (rating && rating !== '') {
      filter.rating = parseInt(rating);
    }
    
    if (status && status !== '') {
      filter.status = status;
    }
    
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }
    
    const feedbacks = await Feedback.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    
    console.log(`✅ Retrieved ${feedbacks.length} feedbacks`);
    
    res.json({
      success: true,
      count: feedbacks.length,
      data: feedbacks
    });
  } catch (err) {
    console.error("❌ Error getting feedbacks:", err);
    res.status(500).json({ 
      error: "Failed to fetch feedbacks",
      details: err.message
    });
  }
};

// Update feedback - WITH IMPROVED OWNERSHIP CHECK
exports.updateFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;

    console.log("📝 Update request for feedback:", id);
    console.log("👤 Requesting user:", req.user);

    // Get existing feedback
    const existingFeedback = await Feedback.findById(id);
    
    if (!existingFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    console.log("📋 Existing feedback data:", {
      email: existingFeedback.email,
      userId: existingFeedback.userId,
      createdBy: existingFeedback.createdBy
    });

    // ✅ Extract current user info with fallbacks
    const currentUserId = getUserId(req);
    const currentUserEmail = getUserEmail(req);
    const userRole = req.user?.role?.toLowerCase() || 'user';
    const isAdmin = userRole === 'admin';

    console.log("🔍 Current user info:", { 
      currentUserId, 
      currentUserEmail, 
      userRole, 
      isAdmin 
    });

    // Check ownership - user can only edit their own feedback (unless admin)
    if (!isAdmin) {
      const feedbackEmail = existingFeedback.email?.toLowerCase().trim();
      const feedbackUserId = (existingFeedback.userId || existingFeedback.createdBy)?.toString();

      console.log("🔐 Ownership check:", {
        currentUserEmail,
        feedbackEmail,
        emailMatch: currentUserEmail === feedbackEmail,
        currentUserId,
        feedbackUserId,
        userIdMatch: currentUserId && feedbackUserId && currentUserId.toString() === feedbackUserId
      });

      // Check if user owns this feedback by email OR user ID
      const ownsEmail = currentUserEmail && feedbackEmail && currentUserEmail === feedbackEmail;
      const ownsUserId = currentUserId && feedbackUserId && currentUserId.toString() === feedbackUserId;

      if (!ownsEmail && !ownsUserId) {
        console.log("❌ ACCESS DENIED - Not owner");
        return res.status(403).json({ 
          error: "Access denied. You can only edit your own feedback.",
          debug: {
            yourEmail: currentUserEmail,
            feedbackEmail: feedbackEmail,
            yourId: currentUserId,
            feedbackUserId: feedbackUserId,
            hint: "Make sure you're logged in with the same account that created this feedback"
          }
        });
      }

      console.log("✅ Ownership verified");
    } else {
      console.log("✅ Admin access granted");
    }

    // Validate updates
    if (update.rating && (update.rating < 1 || update.rating > 5)) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    if (update.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(update.email)) {
        return res.status(400).json({ error: "Please provide a valid email address" });
      }
    }

    // Sanitize updates
    if (update.customerName) update.customerName = update.customerName.trim();
    if (update.email) update.email = update.email.trim().toLowerCase();
    if (update.message) update.message = update.message.trim();
    if (update.phoneNumber) update.phoneNumber = update.phoneNumber.trim();

    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id, 
      { ...update, updatedAt: new Date() }, 
      { new: true, runValidators: true }
    );

    console.log("✅ Feedback updated successfully");
    
    res.json({
      success: true,
      message: "Feedback updated successfully",
      data: updatedFeedback
    });
  } catch (err) {
    console.error("❌ Error updating feedback:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid feedback ID format" });
    }
    
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: validationErrors 
      });
    }
    
    res.status(500).json({ 
      error: "Failed to update feedback",
      details: err.message
    });
  }
};

// Delete feedback - WITH IMPROVED OWNERSHIP CHECK
exports.deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    console.log("🗑️ Delete request for feedback:", id);
    console.log("👤 Requesting user:", req.user);
    
    // Get existing feedback
    const existingFeedback = await Feedback.findById(id);
    
    if (!existingFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    console.log("📋 Existing feedback data:", {
      email: existingFeedback.email,
      userId: existingFeedback.userId,
      createdBy: existingFeedback.createdBy
    });

    // ✅ Extract current user info with fallbacks
    const currentUserId = getUserId(req);
    const currentUserEmail = getUserEmail(req);
    const userRole = req.user?.role?.toLowerCase() || 'user';
    const isAdmin = userRole === 'admin';

    console.log("🔍 Current user info:", { 
      currentUserId, 
      currentUserEmail, 
      userRole, 
      isAdmin 
    });

    // Check ownership
    if (!isAdmin) {
      const feedbackEmail = existingFeedback.email?.toLowerCase().trim();
      const feedbackUserId = (existingFeedback.userId || existingFeedback.createdBy)?.toString();

      console.log("🔐 Ownership check:", {
        currentUserEmail,
        feedbackEmail,
        emailMatch: currentUserEmail === feedbackEmail,
        currentUserId,
        feedbackUserId,
        userIdMatch: currentUserId && feedbackUserId && currentUserId.toString() === feedbackUserId
      });

      const ownsEmail = currentUserEmail && feedbackEmail && currentUserEmail === feedbackEmail;
      const ownsUserId = currentUserId && feedbackUserId && currentUserId.toString() === feedbackUserId;

      if (!ownsEmail && !ownsUserId) {
        console.log("❌ ACCESS DENIED - Not owner");
        return res.status(403).json({ 
          error: "Access denied. You can only delete your own feedback.",
          debug: {
            yourEmail: currentUserEmail,
            feedbackEmail: feedbackEmail,
            yourId: currentUserId,
            feedbackUserId: feedbackUserId,
            hint: "Make sure you're logged in with the same account that created this feedback"
          }
        });
      }

      console.log("✅ Ownership verified");
    } else {
      console.log("✅ Admin access granted");
    }
    
    const deletedFeedback = await Feedback.findByIdAndDelete(id);
    
    console.log("✅ Feedback deleted successfully");
    
    res.json({
      success: true,
      message: "Feedback deleted successfully",
      data: deletedFeedback
    });
  } catch (err) {
    console.error("❌ Error deleting feedback:", err);
    
    if (err.name === 'CastError') {
      return res.status(400).json({ error: "Invalid feedback ID format" });
    }
    
    res.status(500).json({ 
      error: "Failed to delete feedback",
      details: err.message
    });
  }
};

// Analytics
exports.getFeedbackAnalytics = async (req, res) => {
  try {
    const totalFeedbacks = await Feedback.countDocuments({ isPublic: true });
    
    const ratingStats = await Feedback.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: "$rating", count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    const categoryStats = await Feedback.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: "$category", count: { $sum: 1 }, averageRating: { $avg: "$rating" } } }
    ]);

    const averageRating = await Feedback.aggregate([
      { $match: { isPublic: true } },
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);

    const recentFeedbacks = await Feedback.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('customerName rating category createdAt helpfulVotes')
      .lean();

    const report = {
      totalFeedbacks,
      averageRating: Math.round((averageRating[0]?.avgRating || 0) * 100) / 100,
      ratingDistribution: ratingStats,
      categoryBreakdown: categoryStats,
      recentFeedbacks
    };
    
    res.json({
      success: true,
      message: "Analytics generated successfully",
      data: report
    });
  } catch (err) {
    console.error("❌ Error generating analytics:", err);
    res.status(500).json({ 
      error: "Failed to generate analytics",
      details: err.message
    });
  }
};

// PDF Report
exports.generatePDFReport = async (req, res) => {
  try {
    const allFeedbacks = await Feedback.find({ isPublic: true }).sort({ createdAt: -1 }).lean();

    const summary = {
      total: allFeedbacks.length,
      ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categories: { product: 0, service: 0, delivery: 0, website: 0, general: 0 },
      averageRating: 0,
      totalHelpfulVotes: 0
    };

    allFeedbacks.forEach(feedback => {
      summary.ratings[feedback.rating] = (summary.ratings[feedback.rating] || 0) + 1;
      summary.categories[feedback.category] = (summary.categories[feedback.category] || 0) + 1;
      summary.totalHelpfulVotes += feedback.helpfulVotes || 0;
    });

    if (allFeedbacks.length > 0) {
      const totalRating = allFeedbacks.reduce((sum, feedback) => sum + feedback.rating, 0);
      summary.averageRating = Math.round((totalRating / allFeedbacks.length) * 100) / 100;
    }

    const recentDetailedFeedbacks = allFeedbacks.slice(0, 20).map(feedback => ({
      customerName: feedback.customerName,
      email: feedback.email,
      category: feedback.category,
      rating: feedback.rating,
      message: feedback.message,
      helpfulVotes: feedback.helpfulVotes || 0,
      createdAt: feedback.createdAt
    }));

    const reportData = {
      summary,
      feedbacks: recentDetailedFeedbacks,
      generatedAt: new Date(),
      generatedBy: "Admin"
    };
    
    res.json({
      success: true,
      message: "PDF report data generated successfully",
      ...reportData
    });
  } catch (err) {
    console.error("❌ Error generating PDF report:", err);
    res.status(500).json({ 
      error: "Failed to generate PDF report",
      details: err.message
    });
  }
};

// Helpful votes
exports.addHelpfulVote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || getUserEmail(req);
    
    if (!userId) {
      return res.status(401).json({ error: "User identification required" });
    }
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    if (!feedback.helpfulVoters) {
      feedback.helpfulVoters = [];
    }
    
    if (feedback.helpfulVoters.some(voter => voter.toString() === userId.toString())) {
      return res.status(400).json({ 
        message: "You have already marked this feedback as helpful" 
      });
    }

    feedback.helpfulVoters.push(userId);
    feedback.helpfulVotes = (feedback.helpfulVotes || 0) + 1;
    await feedback.save();
    
    res.json({
      success: true,
      message: "Helpful vote added",
      data: {
        feedbackId: feedback._id,
        helpfulVotes: feedback.helpfulVotes
      }
    });
  } catch (err) {
    console.error("❌ Error adding helpful vote:", err);
    res.status(500).json({ error: "Failed to add helpful vote", details: err.message });
  }
};

exports.removeHelpfulVote = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = getUserId(req) || getUserEmail(req);
    
    if (!userId) {
      return res.status(401).json({ error: "User identification required" });
    }
    
    const feedback = await Feedback.findById(id);
    
    if (!feedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }

    if (!feedback.helpfulVoters || !feedback.helpfulVoters.some(voter => voter.toString() === userId.toString())) {
      return res.status(400).json({ 
        message: "You haven't voted on this feedback yet" 
      });
    }

    feedback.helpfulVoters = feedback.helpfulVoters.filter(voter => voter.toString() !== userId.toString());
    feedback.helpfulVotes = Math.max(0, (feedback.helpfulVotes || 1) - 1);
    await feedback.save();
    
    res.json({
      success: true,
      message: "Helpful vote removed",
      data: {
        feedbackId: feedback._id,
        helpfulVotes: feedback.helpfulVotes
      }
    });
  } catch (err) {
    console.error("❌ Error removing helpful vote:", err);
    res.status(500).json({ error: "Failed to remove helpful vote", details: err.message });
  }
};

exports.reportFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    
    const updatedFeedback = await Feedback.findByIdAndUpdate(
      id,
      { $inc: { reportCount: 1 } },
      { new: true, runValidators: true }
    );

    if (!updatedFeedback) {
      return res.status(404).json({ error: "Feedback not found" });
    }
    
    if (updatedFeedback.reportCount >= 5) {
      updatedFeedback.isPublic = false;
      await updatedFeedback.save();
    }
    
    res.json({
      success: true,
      message: "Feedback reported successfully",
      data: {
        feedbackId: updatedFeedback._id,
        reportCount: updatedFeedback.reportCount,
        isPublic: updatedFeedback.isPublic
      }
    });
  } catch (err) {
    console.error("❌ Error reporting feedback:", err);
    res.status(500).json({ error: "Failed to report feedback", details: err.message });
  }
};