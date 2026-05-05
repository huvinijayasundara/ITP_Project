// routes/cart_route.js - ALTERNATIVE IMPORT METHOD
const express = require("express");
const path = require("path");

const { 
  addToCart, 
  removeFromCart, 
  getCart, 
  updateCartItem, 
  clearCart 
} = require("../Controllers/Cart");

// Try loading auth middleware with explicit path resolution
let authenticatedUser;
try {
  const authModule = require(path.join(__dirname, "..", "Middleware", "auth"));
  authenticatedUser = authModule.authenticatedUser;
  console.log("✅ Auth middleware loaded successfully");
} catch (error) {
  console.error("❌ Failed to load auth middleware:", error.message);
  console.error("Looking for file at:", path.join(__dirname, "..", "Middleware", "auth.js"));
  throw error;
}

const router = express.Router();

// All cart routes require authentication
router.post("/add", authenticatedUser, addToCart);
router.post("/remove", authenticatedUser, removeFromCart);
router.put("/update", authenticatedUser, updateCartItem);
router.get("/my-cart", authenticatedUser, getCart);
router.post("/clear", authenticatedUser, clearCart);

// Legacy route for backward compatibility
router.get("/:userId", getCart);

module.exports = router;