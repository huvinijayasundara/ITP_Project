// Controllers/PaymentControler.js (or Controller/PaymentControler.js)
const Payment = require("../models/Payment");
const Order = require("../models/OrderModel");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// ==================== HELPER: GENERATE RECEIPT PDF ====================
const generateReceiptPDF = async (payment, order) => {
  return new Promise((resolve, reject) => {
    try {
      // Create receipts directory if it doesn't exist
      const receiptsDir = path.join(__dirname, "../receipts");
      if (!fs.existsSync(receiptsDir)) {
        fs.mkdirSync(receiptsDir, { recursive: true });
        console.log("✅ Created receipts directory");
      }

      // Generate filename
      const filename = `receipt-${payment.orderId}-${Date.now()}.pdf`;
      const filepath = path.join(receiptsDir, filename);

      // Create PDF document
      const doc = new PDFDocument({ margin: 50 });
      const stream = fs.createWriteStream(filepath);

      doc.pipe(stream);

      // Header
      doc.fontSize(20).text("PAYMENT RECEIPT", { align: "center" });
      doc.moveDown();
      doc.fontSize(10).text("CraftLink Store", { align: "center" });
      doc.text("Thank you for your purchase!", { align: "center" });
      doc.moveDown(2);

      // Receipt details
      doc.fontSize(12).text(`Receipt #: ${payment._id}`);
      doc.text(`Order ID: ${payment.orderId}`);
      doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
      doc.text(`Payment Method: ${payment.method}`);
      
      if (payment.referenceNumber) {
        doc.text(`Reference Number: ${payment.referenceNumber}`);
      }
      
      doc.moveDown();

      // Order items
      if (order && order.items) {
        doc.fontSize(14).text("Order Items:", { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(10);

        order.items.forEach((item, index) => {
          doc.text(
            `${index + 1}. ${item.name} x ${item.quantity} @ Rs. ${item.price.toFixed(2)} = Rs. ${(item.price * item.quantity).toFixed(2)}`
          );
        });
        doc.moveDown();
      }

      // Pricing breakdown
      doc.fontSize(12);
      doc.text(`Subtotal: Rs. ${order.subtotal.toFixed(2)}`, { align: "right" });
      
      if (order.discountAmount > 0) {
        doc.text(
          `Discount (${order.discountCode || "Applied"}): - Rs. ${order.discountAmount.toFixed(2)}`,
          { align: "right" }
        );
      }
      
      doc.text(`Tax (10%): Rs. ${order.tax.toFixed(2)}`, { align: "right" });
      doc.text(`Shipping Fee: Rs. ${order.shippingFee.toFixed(2)}`, { align: "right" });
      doc.moveDown();
      doc.fontSize(14).text(`Total Amount: Rs. ${payment.amount.toFixed(2)}`, { 
        align: "right",
        underline: true 
      });

      doc.moveDown(2);

      // Payment status
      doc.fontSize(10);
      doc.text(`Payment Status: ${payment.status}`, { align: "center" });
      
      doc.moveDown();
      doc.fontSize(8).text(
        "This is a computer-generated receipt. For queries, contact support@craftlink.com",
        { align: "center", color: "gray" }
      );

      // Finalize PDF
      doc.end();

      stream.on("finish", () => {
        console.log("✅ Receipt PDF generated:", filename);
        resolve(`receipts/${filename}`);
      });

      stream.on("error", (err) => {
        console.error("❌ Error generating receipt:", err);
        reject(err);
      });

    } catch (error) {
      console.error("❌ Receipt generation error:", error);
      reject(error);
    }
  });
};

// ==================== CREATE PAYMENT WITH RECEIPT ====================
const addPayment = async (req, res) => {
  try {
    const { orderId, userId, method, amount, referenceNumber, status } = req.body;

    console.log("\n💳 ========== PROCESS PAYMENT ==========");
    console.log("📝 Payment details:", {
      orderId,
      userId,
      method,
      amount,
      referenceNumber,
      status,
      hasFile: !!req.file
    });

    // Validation
    if (!orderId || !userId || !method || !amount) {
      console.error("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Order ID, User ID, Method, and Amount are required"
      });
    }

    // Validate ObjectIds
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    // Fetch order to get details for receipt
    let order = null;
    try {
      order = await Order.findById(orderId);
      if (!order) {
        console.warn("⚠️ Order not found:", orderId);
      } else {
        console.log("✅ Order found:", order._id);
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch order:", err.message);
    }

    // Create payment object
    const paymentData = {
      orderId,
      userId: new mongoose.Types.ObjectId(userId),
      method,
      amount: parseFloat(amount),
      status: status || (method === "COD" ? "Pending" : "Completed")
    };

    // Add bank slip details if provided
    if (method === "BankSlip") {
      if (referenceNumber) {
        paymentData.referenceNumber = referenceNumber;
      }
      if (req.file) {
        paymentData.slipImage = `uploads/slips/${req.file.filename}`;
        console.log("📎 Bank slip uploaded:", paymentData.slipImage);
      }
    }

    // Save payment
    const payment = new Payment(paymentData);
    await payment.save();

    console.log("✅ Payment saved:", payment._id);

    // Generate receipt PDF
    let receiptPath = null;
    if (order) {
      try {
        receiptPath = await generateReceiptPDF(payment, order);
        console.log("📄 Receipt generated:", receiptPath);
      } catch (err) {
        console.error("⚠️ Receipt generation failed (non-critical):", err.message);
      }
    }

    // Update order status if needed
    if (order && method !== "COD") {
      order.status = "Processing";
      await order.save();
      console.log("✅ Order status updated to Processing");
    }

    return res.status(201).json({
      success: true,
      message: "Payment processed successfully",
      payment: payment,
      receipt: receiptPath
    });

  } catch (err) {
    console.error("❌ Payment processing error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process payment",
      error: err.message
    });
  }
};

// ==================== GET ALL PAYMENTS ====================
const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate("userId", "name gmail")
      .sort({ createdAt: -1 });

    console.log(`📋 Fetched ${payments.length} payments`);

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments
    });
  } catch (err) {
    console.error("❌ Error fetching payments:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payments",
      error: err.message
    });
  }
};

// ==================== GET PAYMENT BY ID ====================
const getPaymentById = async (req, res) => {
  try {
    const paymentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID format"
      });
    }

    const payment = await Payment.findById(paymentId).populate("userId", "name gmail");

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    console.log("✅ Payment found:", payment._id);

    return res.status(200).json({
      success: true,
      payment: payment
    });
  } catch (err) {
    console.error("❌ Error fetching payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch payment",
      error: err.message
    });
  }
};

// ==================== GET PAYMENTS BY USER ====================
const getPaymentsByUser = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID format"
      });
    }

    const payments = await Payment.find({ userId })
      .sort({ createdAt: -1 });

    console.log(`✅ Found ${payments.length} payments for user ${userId}`);

    return res.status(200).json({
      success: true,
      count: payments.length,
      payments: payments
    });
  } catch (err) {
    console.error("❌ Error fetching user payments:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user payments",
      error: err.message
    });
  }
};

// ==================== UPDATE PAYMENT ====================
const updatePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;
    const updateData = req.body;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID format"
      });
    }

    const payment = await Payment.findByIdAndUpdate(
      paymentId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    console.log("✅ Payment updated:", payment._id);

    return res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment: payment
    });
  } catch (err) {
    console.error("❌ Error updating payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to update payment",
      error: err.message
    });
  }
};

// ==================== DELETE PAYMENT ====================
const deletePayment = async (req, res) => {
  try {
    const paymentId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(paymentId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment ID format"
      });
    }

    const payment = await Payment.findByIdAndDelete(paymentId);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found"
      });
    }

    console.log("✅ Payment deleted:", paymentId);

    return res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
      payment: payment
    });
  } catch (err) {
    console.error("❌ Error deleting payment:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to delete payment",
      error: err.message
    });
  }
};

// ==================== GET REFUND REQUESTS ====================
// ==================== GET REFUND REQUESTS ====================
const getAllRefundRequests = async (req, res) => {
  try {
    const refundRequests = await Payment.find({
      "refund.status": { $in: ["Requested", "Approved", "Rejected"] }
    })
    .populate("userId", "name gmail")
    .sort({ "refund.requestedAt": -1 });

    console.log(`✅ Found ${refundRequests.length} refund requests`);

    return res.status(200).json({
      success: true,
      count: refundRequests.length,
      refundRequests: refundRequests
    });
  } catch (err) {
    console.error("❌ Error fetching refund requests:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch refund requests",
      error: err.message
    });
  }
};

module.exports = {
  addPayment,
  getAllPayments,
  getPaymentById,
  getPaymentsByUser,
  updatePayment,
  deletePayment,
  getAllRefundRequests
};