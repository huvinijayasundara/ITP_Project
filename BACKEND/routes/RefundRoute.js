const express = require("express");
const router = express.Router();
const RefundRequest = require("../models/RefundRequest");

// Create a refund request
router.post("/", async (req, res) => {
  const { paymentId } = req.body;

  if (!paymentId) {
    return res.status(400).json({ error: "Payment ID is required" });
  }

  try {
    // Check if refund request already exists for paymentId
    const existing = await RefundRequest.findOne({ paymentId });
    if (existing) {
      return res.status(400).json({ error: "Refund request already submitted" });
    }

    const refundRequest = new RefundRequest({ paymentId });
    await refundRequest.save();

    res.status(200).json({ message: "Refund request received" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get all refund requests (for admin)
router.get("/", async (req, res) => {
  try {
    const refundRequests = await RefundRequest.find().sort({ requestedAt: -1 });
    res.status(200).json(refundRequests);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Approve or Reject refund request
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["Approved", "Rejected"].includes(status)) {
    return res.status(400).json({ error: "Invalid status" });
  }

  try {
    const refundRequest = await RefundRequest.findById(id);
    if (!refundRequest) {
      return res.status(404).json({ error: "Refund request not found" });
    }

    refundRequest.status = status;
    refundRequest.respondedAt = new Date();

    await refundRequest.save();

    res.status(200).json({ message: `Refund request ${status.toLowerCase()}` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
