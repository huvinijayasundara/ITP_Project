const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const QRCode = require("qrcode");
const Order = require("../models/OrderModel"); // Required to fetch item details

const generateReceipt = async (payment) => {
  try {
    const receiptDir = path.join(__dirname, "../uploads/receipts");
    if (!fs.existsSync(receiptDir)) {
      fs.mkdirSync(receiptDir, { recursive: true });
    }

    const receiptPath = path.join(receiptDir, `receipt-${payment._id}.pdf`);
    const doc = new PDFDocument({ margin: 50 });

    const logoPath = path.join(__dirname, "../assets/logo.png");
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, doc.page.width / 2 - 40, 30, { width: 80 });
      doc.moveDown(3);
    } else {
      doc.fontSize(16).text("[Logo Missing]", { align: "center" });
    }

    doc.pipe(fs.createWriteStream(receiptPath));

    // Header
    doc.fontSize(16).text("CraftLink", { align: "center" });
    doc.moveDown(0.5);
    doc
      .fontSize(10)
      .text("123 Main Street, Colombo, Sri Lanka", { align: "center" });
    doc.text("Phone: (011) 234-5678 | Email: info@craftlink.com", {
      align: "center",
    });
    doc.text("GSTIN: 27AAECR1234R1Z5", { align: "center" });

    doc.moveDown(1);
    doc
      .font("Helvetica-Bold")
      .fontSize(14)
      .text("--------------------------------------------------", { align: "center" });
    doc.text("PAYMENT RECEIPT", { align: "center" });
    doc.text("--------------------------------------------------", { align: "center" });
    doc.moveDown(1);

    // Payment Info
    doc.font("Helvetica").fontSize(11);
    doc.text(`Receipt #: ${payment._id}`);
    doc.text(`Order ID: ${payment.orderId}`);
    doc.text(`Customer ID: ${payment.userId}`);
    doc.text(`Date: ${new Date(payment.createdAt).toLocaleDateString()}`);
    doc.text(`Payment Method: ${payment.method}`);
    doc.text(`Status: ${payment.status}`);
    if (payment.referenceNumber) {
      doc.text(`Reference #: ${payment.referenceNumber}`);
    }

    // Get Order Details
    let order;
    try {
      if (payment.orderId && orderIdLooksValid(payment.orderId)) {
        order = await Order.findById(payment.orderId);
      }
    } catch (err) {
      console.warn("⚠️ Could not fetch order details for receipt:", err.message);
    }

    doc.moveDown(1);
    doc.text("--------------------------------------------------");
    doc.font("Helvetica-Bold").text("ORDER SUMMARY");
    doc.font("Helvetica").text("--------------------------------------------------");

    let subtotal = 0;
    let shipping = 0;
    let totalAmount = 0;

    if (order && order.items?.length) {
      // Table Header
      doc
        .font("Courier-Bold")
        .text("Item                                 Qty   Price        Total");

      doc.font("Courier");

      // Table Rows
      order.items.forEach((item) => {
        const name = item.name.length > 33 ? item.name.slice(0, 30) + "..." : item.name;
        const qty = item.quantity.toString().padEnd(5);
        const price = `LKR ${item.price.toFixed(2)}`.padEnd(12);
        const total = `LKR ${(item.price * item.quantity).toFixed(2)}`;
        doc.text(`${name.padEnd(35)} ${qty} ${price} ${total}`);
      });

      // Payment Summary
      subtotal = order.items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      shipping = order.shippingFee || 0;
      totalAmount = order.totalAmount || subtotal + shipping;

      doc.text("--------------------------------------------------");
      doc.font("Courier-Bold").text("PAYMENT SUMMARY");
      doc.font("Courier").text(`Subtotal:                 LKR ${subtotal.toFixed(2)}`);
      doc.text(`Shipping Fee:             LKR ${shipping.toFixed(2)}`);
      doc.text(`Total Amount:             LKR ${totalAmount.toFixed(2)}`);
    } else {
      doc.moveDown(1);
      doc.font("Courier").text("⚠️ Order details not available.");
    }

    doc.text("--------------------------------------------------");

    // ✅ QR Code Generation
    const qrContent = `
CraftLink Payment Receipt
Receipt #: ${payment._id}
Order ID: ${payment.orderId}
Customer ID: ${payment.userId}
Amount: LKR ${totalAmount.toFixed(2)}
Date: ${new Date(payment.createdAt).toLocaleDateString()}
`;

    const qrImageBuffer = await QRCode.toBuffer(qrContent);
    doc.moveDown(2);
    doc.font("Helvetica-Bold").text("Scan this QR code to verify receipt:");
    doc.image(qrImageBuffer, {
      fit: [120, 120],
      align: "left",
    });

    // Footer
    doc.moveDown(2);
    doc.font("Helvetica").fontSize(10);
    doc.text("Thank you for shopping with CraftLink!");
    doc.text("Customer Support: +94 112 345 678 | support@craftlink.com");
    doc.text("Payment processed securely. Refunds as per our policy.");

    // Finalize PDF
    doc.end();

    return `uploads/receipts/receipt-${payment._id}.pdf`;
  } catch (err) {
    throw new Error(`Failed to generate receipt: ${err.message}`);
  }
};

// Helper to check if ID is a valid MongoDB ObjectId
function orderIdLooksValid(id) {
  const ObjectIdRegex = /^[a-f\d]{24}$/i;
  return ObjectIdRegex.test(id);
}

module.exports = { generateReceipt };
