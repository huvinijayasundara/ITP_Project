const express = require("express");
const router = express.Router();

// Controller for artisans
const UserController = require("../Controllers/UserController");

// Middleware
const { adminOnly, authenticatedUser } = require("../Middleware/auth");

// Get all artisans
router.get("/", authenticatedUser, UserController.getAllUser);

// Create artisan (admin only)
router.post("/", adminOnly, UserController.addUsers);

// Get artisan by ID
router.get("/:id", authenticatedUser, UserController.getById);

// Update artisan
router.put("/:id", authenticatedUser, UserController.updateUser);

// Delete artisan (admin only)
router.delete("/:id", adminOnly, UserController.deleteUser);

module.exports = router;