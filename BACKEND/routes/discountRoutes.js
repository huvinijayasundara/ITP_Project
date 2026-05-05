const express = require("express");
const router = express.Router();
const {
  getAllDiscount,
  addDiscount,
  getById,
  updateDiscount,
  deleteDiscount,
  validateDiscountCode
} = require("../Controllers/DiscountController");

// GET all discounts
router.get("/", getAllDiscount);

// GET discount by ID
router.get("/:id", getById);

// POST - Create new discount
router.post("/", addDiscount);

// PUT - Update discount
router.put("/:id", updateDiscount);

// DELETE - Delete discount
router.delete("/:id", deleteDiscount);

// POST - Validate promo code (checks both discounts and promotions)
router.post("/validate", validateDiscountCode);

module.exports = router;