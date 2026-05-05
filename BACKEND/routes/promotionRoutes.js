const express = require("express");
const router = express.Router();
const {
  createPromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
  deletePromotion,
  getActivePromotions,
  validatePromotionDates
} = require("../Controllers/promotionController");

// Import your existing authentication middleware
const { adminOnly } = require("../Middleware/auth");

// Public routes - anyone can view promotions (no auth required)
router.get("/", getAllPromotions);
router.get("/active", getActivePromotions);
router.get("/:id", getPromotionById);

// Protected routes - only authenticated admins can create, update, delete
router.post("/", adminOnly, createPromotion);
router.put("/:id", adminOnly, updatePromotion);
router.delete("/:id", adminOnly, deletePromotion);

// Utility routes - can be protected if needed
router.post("/validate-dates", validatePromotionDates);

module.exports = router;