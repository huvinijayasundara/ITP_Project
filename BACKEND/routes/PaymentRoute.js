// Route/PaymentRoute.js
// Save this EXACT file in: backend/Route/PaymentRoute.js

const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Import Payment Controller
const {
  getAllPayments,
  addPayment,
  getPaymentById,
  updatePayment,
  deletePayment,
  getPaymentsByUser,
  getAllRefundRequests
} = require("../Controllers/PaymentControler");

console.log("📦 PaymentRoute.js loaded");

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, "../uploads/slips");
    
    // Create directory if doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
      console.log("✅ Created uploads/slips directory");
    }
    
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, "slip-" + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  },
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error("Only images (jpeg, jpg, png, gif) or PDF files are allowed!"));
    }
  }
});

// ==================== PAYMENT ROUTES ====================

// CREATE PAYMENT (with optional file upload)
router.post("/", upload.single("slipImage"), (req, res) => {
  console.log("💳 POST /payments - Payment submission received");
  console.log("   Body:", req.body);
  console.log("   File:", req.file ? req.file.filename : "No file");
  addPayment(req, res);
});

// GET ALL PAYMENTS
router.get("/", (req, res) => {
  console.log("📋 GET /payments - Fetch all payments");
  getAllPayments(req, res);
});

// GET PAYMENT BY ID
router.get("/:id", (req, res) => {
  console.log("🔍 GET /payments/:id -", req.params.id);
  getPaymentById(req, res);
});

// GET PAYMENTS BY USER
router.get("/user/:userId", (req, res) => {
  console.log("👤 GET /payments/user/:userId -", req.params.userId);
  getPaymentsByUser(req, res);
});

// UPDATE PAYMENT
router.put("/:id", (req, res) => {
  console.log("📝 PUT /payments/:id -", req.params.id);
  updatePayment(req, res);
});

// DELETE PAYMENT
router.delete("/:id", (req, res) => {
  console.log("🗑️ DELETE /payments/:id -", req.params.id);
  deletePayment(req, res);
});

// GET REFUND REQUESTS
router.get("/refunds/all", (req, res) => {
  console.log("💰 GET /payments/refunds/all");
  getAllRefundRequests(req, res);
});

// Error handling middleware
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    console.error("❌ Multer Error:", error.message);
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "Error",
        message: "File too large. Maximum size is 5MB"
      });
    }
    return res.status(400).json({
      status: "Error",
      message: error.message
    });
  } else if (error) {
    console.error("❌ Route Error:", error.message);
    return res.status(400).json({
      status: "Error",
      message: error.message
    });
  }
  next();
});

console.log("✅ Payment routes configured");

module.exports = router;