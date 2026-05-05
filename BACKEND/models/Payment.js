const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = new Schema({
  orderId: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "Register", required: true },
  method: { type: String, enum: ["COD", "BankSlip"], required: true },
  amount: { type: Number, required: true },
  referenceNumber: { type: String },
  slipImage: { type: String },
  status: {
    type: String,
    enum: ["Pending", "Verified", "Completed", "RefundRequested", "RefundApproved", "Refunded", "RefundRejected"],
    default: "Completed",
  },
  refund: {
    status: {
      type: String,
      enum: ["NotRequested", "Requested", "Approved", "Rejected", "Processed"],
      default: "NotRequested",
    },
    reason: { type: String },
    adminNotes: { type: String },
    requestedAt: { type: Date },
    respondedAt: { type: Date },
    processedAt: { type: Date },
    refundAmount: { type: Number },
  },
  createdAt: { type: Date, default: Date.now },
});


module.exports = mongoose.model("Payment", paymentSchema);
