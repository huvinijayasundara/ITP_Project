const Bill = require("../models/Bill");
const nodemailer = require("nodemailer");
const { generatePDF } = require("../utils/pdfgenerator");
require("dotenv").config(); 

const generateBill = async (req, res) => {
  try {
    const billData = req.body;

    // 1. Check for duplicate invoice number
    const existingBill = await Bill.findOne({ invoiceNumber: billData.invoiceNumber });
    if (existingBill) {
      return res.status(400).json({ message: "Invoice number already exists. Please try a different one." });
    }

    // 2. Auto-calculate totalAmount if not provided
    if (!billData.totalAmount && Array.isArray(billData.items)) {
      billData.totalAmount = billData.items.reduce((sum, item) => {
        return sum + item.quantity * item.price;
      }, 0);
    }

    // 3. Save bill to MongoDB
    const newBill = new Bill(billData);
    await newBill.save();

    // 4. Generate PDF bill
    const pdfBuffer = await generatePDF(billData); // Make sure this supports items[]

    // 5. Set up email transport
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // 6. Send email with PDF attachment
    await transporter.sendMail({
      from: `"Handicraft Store" <${process.env.EMAIL_USER}>`,
      to: billData.email,
      subject: "Your Handicraft Purchase Bill",
      text: `Dear ${billData.customerName || "Customer"},\n\nThank you for your purchase. Please find your bill attached.\n\n- Online Handicraft Store`,
      attachments: [
        {
          filename: `HandicraftBill-${billData.invoiceNumber}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    // 7. Return success response
    return res.status(200).json({ message: "Bill generated and emailed successfully!" });

  } catch (error) {
    console.error("Error generating bill:", error);
    return res.status(500).json({ message: "Something went wrong while generating the bill." });
  }
};

module.exports = { generateBill };

