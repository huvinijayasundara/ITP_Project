const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Transaction = require("../models/TransactionModel");
const Order = require("../models/OrderModel");

// ✅ Request a refund (Customer)
const requestRefund = async (req, res) => {
  const { paymentId, reason } = req.body;

  try {
    // Validate inputs
    if (!paymentId || !reason || reason.trim().length < 10) {
      return res.status(400).json({
        message: "paymentId and reason (min 10 chars) required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({ message: "Invalid paymentId" });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({ message: "Payment not found" });
    }

    if (!payment.refund) {
      payment.refund = { status: "NotRequested" };
    }

    if (payment.refund.status !== "NotRequested") {
      return res.status(400).json({ message: "Refund already requested" });
    }

    // Check refund eligibility (e.g. 7-day window)
    const refundWindowDays = 7;
    const diffDays = (new Date() - new Date(payment.createdAt)) / (1000 * 60 * 60 * 24);
    if (diffDays > refundWindowDays) {
      return res.status(400).json({ message: "Refund period expired" });
    }

    // Update refund info
    payment.status = "RefundRequested";
    payment.refund = {
      status: "Requested",
      reason: reason.trim(),
      requestedAt: new Date(),
    };

    await payment.save();

    return res.status(200).json({
      message: "Refund request submitted",
      payment,
    });
  } catch (err) {
    console.error("Error requesting refund:", err);
    return res.status(500).json({
      message: "Failed to request refund",
      error: err.message,
    });
  }
};

// ✅ Review refund (Admin: Approve or Reject)
const reviewRefund = async (req, res) => {
  const { paymentId, action, adminNotes } = req.body;

  try {
    // Validate input
    if (
      !paymentId ||
      !["Approve", "Reject"].includes(action) ||
      !adminNotes ||
      adminNotes.trim().length < 5
    ) {
      return res.status(400).json({
        message: "Invalid input for refund review",
      });
    }

    const payment = await Payment.findById(paymentId);
    if (!payment || !payment.refund || payment.refund.status !== "Requested") {
      return res.status(404).json({ message: "No pending refund request" });
    }

    if (action === "Approve") {
      payment.status = "RefundApproved";
      payment.refund.status = "Approved";
    } else {
      payment.status = "Completed";
      payment.refund.status = "Rejected";
    }

    payment.refund.adminNotes = adminNotes.trim();
    payment.refund.respondedAt = new Date();

    await payment.save();

    return res.status(200).json({
      message: `Refund ${action.toLowerCase()}d`,
      payment,
    });
  } catch (err) {
    console.error("Error reviewing refund:", err);
    return res.status(500).json({
      message: "Server error",
      error: err.message,
    });
  }
};

// ✅ Process refund (Admin)
const processRefund = async (req, res) => {
  const { paymentId, refundAmount } = req.body;
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    if (!paymentId || !refundAmount || refundAmount <= 0) {
      throw new Error("paymentId + positive refundAmount required");
    }

    const payment = await Payment.findById(paymentId).session(session);
    if (!payment) {
      throw new Error("Payment not found");
    }

    if (!payment.refund || payment.refund.status !== "Approved") {
      throw new Error("Refund not approved");
    }

    if (refundAmount > payment.amount) {
      throw new Error("Refund amount too big");
    }

    // ✅ Create refund transaction
    const refundTransaction = new Transaction({
      transaction_ID: `REF-${Date.now()}`,
      order_ID: payment.orderId,
      user_type: "Customer",
      amount: -refundAmount, // Negative value for refund
      date: new Date(),
      status: "Completed",
      type: "Refund",
    });

    await refundTransaction.save({ session });

    // ✅ Update payment
    payment.status = "Refunded";
    payment.refund.status = "Processed";
    payment.refund.refundAmount = refundAmount;
    payment.refund.processedAt = new Date();

    await payment.save({ session });

    // ✅ Update order status
    await Order.findByIdAndUpdate(payment.orderId, { status: "Refunded" }, { session });

    await session.commitTransaction();

    return res.status(200).json({
      message: "Refund processed",
      payment,
      refundTransaction,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Error processing refund:", err);
    return res.status(500).json({
      message: "Failed to process refund",
      error: err.message,
    });
  } finally {
    session.endSession();
  }
};

module.exports = {
  requestRefund,
  reviewRefund,
  processRefund,
};
