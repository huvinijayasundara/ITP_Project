const { jsPDF } = require("jspdf");
const autoTable = require("jspdf-autotable"); // ✅ FIXED: correct import
const fs = require("fs");
const path = require("path");

// Utility: Generate Handicraft Bill PDF
const generatePDF = async (data) => {
  const doc = new jsPDF();

  // Add logo (if exists)
  if (data.logo) {
    try {
      const logoPath = path.join(__dirname, `../assets/${data.logo}`);
      const logoBuffer = fs.readFileSync(logoPath);
      const logoBase64 = `data:image/png;base64,${logoBuffer.toString("base64")}`;
      doc.addImage(logoBase64, "PNG", 80, 10, 50, 30); // center top
    } catch (err) {
      console.warn("Logo file not found or unreadable:", err.message);
    }
  }

  // Title
  doc.setFontSize(18);
  doc.setTextColor(40, 40, 120);
  doc.text("Handicraft Purchase Receipt", 105, 50, { align: "center" });

  // Store Info
  doc.setFontSize(12);
  doc.setTextColor(0);
  doc.text(`Store: ${data.storeName || "Online Handicraft Store"}`, 20, 60);
  doc.text(`Invoice #: ${data.invoiceNumber}`, 150, 60);
  doc.text(`Date: ${data.billDate}`, 20, 68);
  doc.text(`Time: ${data.billTime}`, 150, 68);

  // Customer Info
  doc.text(`Customer: ${data.customerName}`, 20, 78);
  doc.text(`Email: ${data.email}`, 20, 86);
  doc.text(`Address: ${data.address}`, 20, 94);

  // Items Table
  const tableData = data.items.map(item => [
    item.name,
    item.quantity,
    item.price,
    item.quantity * item.price
  ]);

  // ✅ FIXED: use autoTable(doc, ...) instead of doc.autoTable(...)
  autoTable(doc, {
    head: [["Item", "Qty", "Price", "Total"]],
    body: tableData,
    startY: 110,
    theme: "striped",
    headStyles: {
      fillColor: [44, 62, 80],
      textColor: 255,
    },
    styles: {
      fontSize: 11,
    },
  });

  // Total Amount
  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(`Total Amount: ₹${data.totalAmount.toFixed(2)}`, 20, finalY);

  // Payment Method
  doc.setFontSize(12);
  doc.text(`Payment Method: ${data.paymentMethod}`, 20, finalY + 10);

  // Thank You Message
  doc.setTextColor(0, 128, 0);
  doc.setFontSize(14);
  doc.text("Thank you for supporting handmade craftsmanship!", 105, finalY + 30, { align: "center" });

  // Return Buffer
  const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
  return pdfBuffer;
};

module.exports = { generatePDF };

