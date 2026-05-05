const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const mongoose = require("mongoose");

// Request a refund
router.post("/request", async (req, res) => {
  const { paymentId, reason } = req.body;

  try {
    if (!paymentId || !reason || reason.trim().length < 10) {
      return res.status(400).json({
        success: false,
        message: "Payment ID and reason (min 10 chars) are required"
      });
    }

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID format"
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    // Check if refund already requested
    if (payment.refund && payment.refund.status !== "NotRequested") {
      return res.status(400).json({
        success: false,
        message: "Refund already requested for this payment"
      });
    }

    // Check refund eligibility (7-day window)
    const refundWindowDays = 7;
    const diffDays = (new Date() - new Date(payment.createdAt)) / (1000 * 60 * 60 * 24);
    if (diffDays > refundWindowDays) {
      return res.status(400).json({
        success: false,
        message: "Refund period expired (7 days)"
      });
    }

    // Update payment with refund request
    payment.status = "RefundRequested";
    payment.refund = {
      status: "Requested",
      reason: reason.trim(),
      requestedAt: new Date(),
    };

    await payment.save();

    return res.status(200).json({
      success: true,
      message: "Refund request submitted successfully",
      payment: payment
    });

  } catch (err) {
    console.error("Error requesting refund:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to request refund",
      error: err.message
    });
  }
});

// Get refund requests for a user
router.get("/user/:userId", async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const refundRequests = await Payment.find({
      userId: userId,
      "refund.status": { $in: ["Requested", "Approved", "Rejected", "Processed"] }
    }).sort({ "refund.requestedAt": -1 });

    return res.status(200).json({
      success: true,
      count: refundRequests.length,
      refundRequests: refundRequests
    });

  } catch (err) {
    console.error("Error fetching user refund requests:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch refund requests",
      error: err.message
    });
  }
});

module.exports = router;