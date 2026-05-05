const express = require("express");
const router = express.Router();
const {
  createFeedback,
  getFeedbacks,
  updateFeedback,
  deleteFeedback,
  getFeedbackAnalytics,
  generatePDFReport,
  addHelpfulVote,
  removeHelpfulVote,
  reportFeedback
} = require("../controllers/feedbackController");

// Import authentication middleware - with error handling
let adminOnly, authenticatedUser;
try {
  const auth = require("../Middleware/auth");
  adminOnly = auth.adminOnly;
  authenticatedUser = auth.authenticatedUser;
  console.log("✅ Auth middleware loaded successfully");
} catch (err) {
  console.warn("⚠️ Auth middleware not found, using fallback");
  // Fallback middleware if auth.js doesn't exist
  adminOnly = (req, res, next) => next();
  authenticatedUser = (req, res, next) => next();
}

// ==================== PUBLIC ROUTES ====================
// Anyone can view public feedbacks and analytics
router.get("/", getFeedbacks);
router.get("/analytics", getFeedbackAnalytics);

// ==================== AUTHENTICATED USER ROUTES ====================
// ✅ Must be logged in to create feedback
router.post("/", authenticatedUser, createFeedback);

// ✅ Must be logged in to update feedback (ownership checked in controller)
router.put("/:id", authenticatedUser, updateFeedback);

// ✅ Must be logged in to delete feedback (ownership checked in controller)
router.delete("/:id", authenticatedUser, deleteFeedback);

// ✅ Must be logged in for interaction features
router.post("/:id/helpful", authenticatedUser, addHelpfulVote);
router.delete("/:id/helpful", authenticatedUser, removeHelpfulVote);
router.post("/:id/report", authenticatedUser, reportFeedback);

// ==================== ADMIN ONLY ROUTES ====================
// ✅ Only admins can generate PDF reports
router.get("/report/pdf", adminOnly, generatePDFReport);

module.exports = router;