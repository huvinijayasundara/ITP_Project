const express = require("express");
const router = express.Router();

// Controller
const UserCController = require("../Controllers/UserCController");

// Middleware
const { adminOnly, authenticatedUser } = require("../Middleware/auth");

// === Current logged-in user (profile) routes ===
router.get("/me/profile", authenticatedUser, UserCController.getMyProfile);
router.put("/me/profile", authenticatedUser, UserCController.updateMyProfile);
router.patch("/me/change-password", authenticatedUser, UserCController.changeMyPassword);
router.delete("/me/profile", authenticatedUser, UserCController.deleteMyProfile);

// === Other static/specific routes ===
router.get("/role/:role", authenticatedUser, UserCController.getUsersByRole);

// === Admin / general CRUD operations ===
router.get("/", authenticatedUser, UserCController.getAllUserC);
router.post("/", adminOnly, UserCController.addUserC);
router.put("/:id/change-password", authenticatedUser, UserCController.changePassword);
router.get("/:id", authenticatedUser, UserCController.getById);
router.put("/:id", authenticatedUser, UserCController.updateUserC);
router.delete("/:id", adminOnly, UserCController.deleteUserC);

module.exports = router;