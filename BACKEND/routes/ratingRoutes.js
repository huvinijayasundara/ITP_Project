const express = require("express");
const router = express.Router();

// Import rating controller
const {
  createRating,
  getRatings,
  updateRating,
  deleteRating,
  getProductStats
} = require("../controllers/ratingController");

// Middleware to log requests (for debugging)
router.use((req, res, next) => {
  console.log(`⭐ ${req.method} ${req.originalUrl}`, req.body || req.query);
  next();
});

// Routes
router.post("/", createRating);                    // Create new rating
router.get("/", getRatings);                       // Get all ratings with filters
router.put("/:id", updateRating);                  // Update rating (admin)
router.delete("/:id", deleteRating);               // Delete rating (admin)
router.get("/product/:id/stats", getProductStats); // Get product statistics

module.exports = router;